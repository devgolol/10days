package com.days.book.service;

import com.days.book.entity.Role;
import com.days.book.entity.User;
import com.days.book.entity.VerificationCode;
import com.days.book.entity.VerificationCode.VerificationType;
import com.days.book.repository.UserRepository;
import com.days.book.repository.VerificationCodeRepository;
import com.days.book.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityNotFoundException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final VerificationCodeRepository verificationCodeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;
    private final AuthenticationManager authenticationManager;
    private final MemberRepository memberRepository;

    /**
     * 회원가입
     */
    public String register(String username, String password, String email, String name, String phone, String address) {
        // 중복 확인 - 미인증 계정은 덮어쓰기 허용
        Optional<User> existingUser = userRepository.findByUsername(username);
        if (existingUser.isPresent() && existingUser.get().getEmailVerified()) {
            throw new RuntimeException("이미 존재하는 사용자명입니다.");
        }
        
        Optional<User> existingEmailUser = userRepository.findByEmail(email);
        if (existingEmailUser.isPresent() && existingEmailUser.get().getEmailVerified()) {
            throw new RuntimeException("이미 존재하는 이메일입니다.");
        }

        // 이메일 인증 토큰 생성
        String verificationToken = emailService.generateEmailVerificationToken();

        // 기존 미인증 계정이 있으면 업데이트, 없으면 새로 생성
        User user;
        if (existingUser.isPresent() && !existingUser.get().getEmailVerified()) {
            // 기존 미인증 계정 업데이트
            user = existingUser.get();
            user.setPassword(passwordEncoder.encode(password));
            user.setEmail(email);
            user.setName(name);
            user.setPhone(phone);
            user.setAddress(address);
            user.setEmailVerificationToken(verificationToken);
            user.setUpdatedAt(java.time.LocalDateTime.now());
        } else if (existingEmailUser.isPresent() && !existingEmailUser.get().getEmailVerified()) {
            // 기존 미인증 이메일 계정 업데이트
            user = existingEmailUser.get();
            user.setUsername(username);
            user.setPassword(passwordEncoder.encode(password));
            user.setName(name);
            user.setPhone(phone);
            user.setAddress(address);
            user.setEmailVerificationToken(verificationToken);
            user.setUpdatedAt(java.time.LocalDateTime.now());
        } else {
            // 새 사용자 생성
            user = User.builder()
                    .username(username)
                    .password(passwordEncoder.encode(password))
                    .email(email)
                    .name(name)
                    .phone(phone)
                    .address(address)
                    .memberNumber(User.generateMemberNumber())
                    .role(Role.USER)
                    .emailVerified(false)
                    .emailVerificationToken(verificationToken)
                    .build();
        }

        userRepository.save(user);

        // 이메일 인증 메일 발송
        emailService.sendEmailVerification(email, verificationToken, username);

        return "회원가입이 완료되었습니다. 이메일을 확인하여 인증을 완료해주세요.";
    }

    /**
     * 로그인 (사용자 정보 포함)
     */
    public Map<String, String> loginWithUserInfo(String username, String password) {
        // 사용자 존재 여부 확인
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 계정입니다."));

        // 비밀번호 확인
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("비밀번호가 일치하지 않습니다.");
        }

        // 이메일 인증 확인 (admin 계정 제외)
        if (!user.getEmailVerified() && !username.equals("admin")) {
            throw new RuntimeException("이메일 인증이 완료되지 않은 계정입니다. 이메일을 확인해주세요.");
        }

        // Member 테이블에서 삭제된 계정 확인 (admin 계정 제외)
        if (!username.equals("admin")) {
            boolean memberExists = memberRepository.findByEmail(user.getEmail()).isPresent();
            if (!memberExists) {
                // Member가 삭제된 경우, User도 삭제하고 오류 반환
                log.warn("Member 삭제된 계정으로 로그인 시도: {}, User 계정도 삭제 처리", username);
                userRepository.delete(user);
                throw new RuntimeException("존재하지 않는 계정입니다.");
            }
        }

        String token = jwtService.generateToken(user);
        
        Map<String, String> result = new HashMap<>();
        result.put("token", token);
        result.put("username", user.getUsername());
        result.put("name", user.getName()); // 실명 추가
        result.put("role", user.getRole().toString());
        
        return result;
    }

    /**
     * 이메일 인증
     */
    public String verifyEmail(String email, String token) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        if (!token.equals(user.getEmailVerificationToken())) {
            throw new RuntimeException("잘못된 인증 토큰입니다.");
        }

        user.setEmailVerified(true);
        user.setEmailVerificationToken(null);
        userRepository.save(user);

        return "이메일 인증이 완료되었습니다.";
    }

    /**
     * 아이디 찾기 - 인증코드 발송
     */
    public String sendFindIdCode(String email) {
        // 이메일로 사용자 확인
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("해당 이메일로 등록된 사용자를 찾을 수 없습니다."));

        // 인증코드 생성
        String code = emailService.generateVerificationCode();
        
        // 인증코드 저장 (5분 유효)
        VerificationCode verificationCode = VerificationCode.builder()
                .email(email)
                .code(code)
                .type(VerificationType.FIND_ID)
                .expiresAt(LocalDateTime.now().plusMinutes(5))
                .used(false)
                .username(user.getUsername())
                .build();
        
        verificationCodeRepository.save(verificationCode);
        
        // 이메일 발송
        emailService.sendUsernameVerificationEmail(email, code);
        
        log.info("아이디 찾기 인증코드 발송: email={}, code={}", email, code);
        return "인증코드가 이메일로 발송되었습니다.";
    }
    
    /**
     * 아이디 찾기 - 인증코드 확인
     */
    public Map<String, String> verifyFindIdCode(String email, String code) {
        // 유효한 인증코드 찾기
        VerificationCode verificationCode = verificationCodeRepository
                .findValidCode(email, code, VerificationType.FIND_ID, LocalDateTime.now())
                .orElseThrow(() -> new RuntimeException("잘못되었거나 만료된 인증코드입니다."));
        
        // 인증코드 사용 처리
        verificationCode.setUsed(true);
        verificationCodeRepository.save(verificationCode);
        
        Map<String, String> result = new HashMap<>();
        result.put("username", verificationCode.getUsername());
        result.put("message", "인증이 완료되었습니다.");
        
        // 아이디 정보를 이메일로도 발송
        emailService.sendFoundUsernameEmail(email, verificationCode.getUsername());
        
        log.info("아이디 찾기 완료: email={}, username={}", email, verificationCode.getUsername());
        return result;
    }
    
    /**
     * 비밀번호 찾기 - 인증코드 발송
     */
    public String sendResetPasswordCode(String username, String email) {
        // 사용자명과 이메일로 사용자 확인
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("존재하지 않는 사용자명입니다."));
        
        if (!user.getEmail().equals(email)) {
            throw new RuntimeException("사용자 정보가 일치하지 않습니다.");
        }
        
        // 인증코드 생성
        String code = emailService.generateVerificationCode();
        
        // 인증코드 저장 (5분 유효)
        VerificationCode verificationCode = VerificationCode.builder()
                .email(email)
                .code(code)
                .type(VerificationType.RESET_PASSWORD)
                .expiresAt(LocalDateTime.now().plusMinutes(5))
                .used(false)
                .username(username)
                .build();
        
        verificationCodeRepository.save(verificationCode);
        
        // 이메일 발송
        emailService.sendPasswordResetVerificationEmail(email, code);
        
        log.info("비밀번호 재설정 인증코드 발송: username={}, email={}, code={}", username, email, code);
        return "인증코드가 이메일로 발송되었습니다.";
    }
    
    /**
     * 비밀번호 찾기 - 인증코드 확인
     */
    public String verifyResetPasswordCode(String username, String email, String code) {
        // 유효한 인증코드 찾기
        VerificationCode verificationCode = verificationCodeRepository
                .findValidCode(email, code, VerificationType.RESET_PASSWORD, LocalDateTime.now())
                .orElseThrow(() -> new RuntimeException("잘못되었거나 만료된 인증코드입니다."));
        
        // 사용자명 확인
        if (!verificationCode.getUsername().equals(username)) {
            throw new RuntimeException("인증 정보가 일치하지 않습니다.");
        }
        
        // 인증코드는 아직 사용 처리하지 않음 (새 비밀번호 설정 시 사용 처리)
        
        log.info("비밀번호 재설정 인증 완료: username={}, email={}", username, email);
        return "인증이 완료되었습니다. 새 비밀번호를 입력해주세요.";
    }
    
    /**
     * 비밀번호 찾기 - 새 비밀번호 설정
     */
    public String resetPasswordWithCode(String username, String email, String code, String newPassword) {
        // 유효한 인증코드 찾기
        VerificationCode verificationCode = verificationCodeRepository
                .findValidCode(email, code, VerificationType.RESET_PASSWORD, LocalDateTime.now())
                .orElseThrow(() -> new RuntimeException("잘못되었거나 만료된 인증코드입니다."));
        
        // 사용자명 확인
        if (!verificationCode.getUsername().equals(username)) {
            throw new RuntimeException("인증 정보가 일치하지 않습니다.");
        }
        
        // 사용자 정보 조회
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
        
        // 새 비밀번호 설정
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        
        // 인증코드 사용 처리
        verificationCode.setUsed(true);
        verificationCodeRepository.save(verificationCode);
        
        log.info("비밀번호 재설정 완료: username={}", username);
        return "비밀번호가 성공적으로 변경되었습니다.";
    }

    /**
     * 회원탈퇴
     */
    public String withdrawUser(String username, String password) {
        // 사용자 정보 조회
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        // 비밀번호 확인
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("비밀번호가 일치하지 않습니다.");
        }

        // 관리자 계정은 탈퇴 불가
        if ("admin".equals(username)) {
            throw new RuntimeException("관리자 계정은 탈퇴할 수 없습니다.");
        }

        // 사용자 삭제
        userRepository.delete(user);
        
        log.info("회원탈퇴 완료: username={}", username);
        return "회원탈퇴가 완료되었습니다.";
    }

    /**
     * 이메일 마스킹 (보안을 위해)
     */
    private String maskEmail(String email) {
        String[] parts = email.split("@");
        if (parts.length != 2) {
            return email;
        }

        String username = parts[0];
        String domain = parts[1];

        if (username.length() <= 2) {
            return email;
        }

        String maskedUsername = username.substring(0, 2) + "*".repeat(username.length() - 2);
        return maskedUsername + "@" + domain;
    }
}

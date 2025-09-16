package com.days.book.service;

import com.days.book.entity.Role;
import com.days.book.entity.User;
import com.days.book.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


import java.util.Random;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;
    private final AuthenticationManager authenticationManager;

    /**
     * 회원가입
     */
    public String register(String username, String password, String email) {
        // 중복 확인
        if (userRepository.findByUsername(username).isPresent()) {
            throw new RuntimeException("이미 존재하는 사용자명입니다.");
        }
        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("이미 존재하는 이메일입니다.");
        }

        // 이메일 인증 토큰 생성
        String verificationToken = emailService.generateEmailVerificationToken();

        // 사용자 생성
        User user = User.builder()
                .username(username)
                .password(passwordEncoder.encode(password))
                .email(email)
                .role(Role.USER)
                .emailVerified(false)
                .emailVerificationToken(verificationToken)
                .build();

        userRepository.save(user);

        // 이메일 인증 메일 발송
        emailService.sendEmailVerification(email, verificationToken, username);

        return "회원가입이 완료되었습니다. 이메일을 확인하여 인증을 완료해주세요.";
    }

    /**
     * 로그인
     */
    public String login(String username, String password) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, password)
        );

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        if (!user.getEmailVerified()) {
            throw new RuntimeException("이메일 인증이 완료되지 않았습니다.");
        }

        return jwtService.generateToken(user);
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
     * 이메일 찾기 (사용자명으로)
     */
    public String findEmailByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        // 보안을 위해 이메일의 일부만 마스킹하여 반환
        String email = user.getEmail();
        String maskedEmail = maskEmail(email);

        // 실제 이메일로 전체 정보 발송
        emailService.sendFoundEmail(email, username);

        return "등록된 이메일 주소: " + maskedEmail + "\n전체 정보가 해당 이메일로 발송되었습니다.";
    }

    /**
     * 비밀번호 찾기 (이메일로 임시 비밀번호 발송)
     */
    public String resetPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("해당 이메일로 등록된 사용자를 찾을 수 없습니다."));

        // 임시 비밀번호 생성
        String temporaryPassword = emailService.generateTemporaryPassword();

        // 사용자 비밀번호 업데이트
        user.setPassword(passwordEncoder.encode(temporaryPassword));
        userRepository.save(user);

        // 임시 비밀번호 이메일 발송
        emailService.sendTemporaryPassword(email, temporaryPassword, user.getUsername());

        return "임시 비밀번호가 이메일로 발송되었습니다.";
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

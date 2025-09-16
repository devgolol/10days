package com.days.book.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {
    
    private final JavaMailSender mailSender;
    
    /**
     * 이메일 인증 코드 생성 (6자리 숫자)
     */
    public String generateVerificationCode() {
        Random random = new Random();
        int code = 100000 + random.nextInt(900000); // 100000 ~ 999999
        return String.valueOf(code);
    }
    
    /**
     * 아이디 찾기 인증 코드 이메일 발송
     */
    public void sendUsernameVerificationEmail(String toEmail, String verificationCode) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("[도서관리시스템] 아이디 찾기 인증코드");
            message.setText("안녕하세요.\n\n" +
                    "아이디 찾기를 위한 인증코드입니다.\n\n" +
                    "인증코드: " + verificationCode + "\n\n" +
                    "본 인증코드는 5분간 유효합니다.\n\n" +
                    "감사합니다.");
            message.setFrom("noreply@library.com");
            
            mailSender.send(message);
            log.info("아이디 찾기 인증 이메일 발송 성공: {}", toEmail);
        } catch (Exception e) {
            log.error("아이디 찾기 인증 이메일 발송 실패: {} - {}", toEmail, e.getMessage());
            throw new RuntimeException("이메일 발송에 실패했습니다.", e);
        }
    }
    
    /**
     * 비밀번호 초기화 인증 코드 이메일 발송
     */
    public void sendPasswordResetVerificationEmail(String toEmail, String verificationCode) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("[도서관리시스템] 비밀번호 초기화 인증코드");
            message.setText("안녕하세요.\n\n" +
                    "비밀번호 초기화를 위한 인증코드입니다.\n\n" +
                    "인증코드: " + verificationCode + "\n\n" +
                    "본 인증코드는 5분간 유효합니다.\n\n" +
                    "만약 본인이 요청하지 않은 이메일이라면 무시해주세요.\n\n" +
                    "감사합니다.");
            message.setFrom("noreply@library.com");
            
            mailSender.send(message);
            log.info("비밀번호 초기화 인증 이메일 발송 성공: {}", toEmail);
        } catch (Exception e) {
            log.error("비밀번호 초기화 인증 이메일 발송 실패: {} - {}", toEmail, e.getMessage());
            throw new RuntimeException("이메일 발송에 실패했습니다.", e);
        }
    }
    
    /**
     * 찾은 아이디 이메일 발송
     */
    public void sendFoundUsernameEmail(String toEmail, String username) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("[도서관리시스템] 아이디 찾기 결과");
            message.setText("안녕하세요.\n\n" +
                    "요청하신 아이디 찾기 결과입니다.\n\n" +
                    "아이디: " + username + "\n\n" +
                    "로그인 페이지에서 해당 아이디로 로그인하실 수 있습니다.\n\n" +
                    "감사합니다.");
            message.setFrom("noreply@library.com");
            
            mailSender.send(message);
            log.info("아이디 찾기 결과 이메일 발송 성공: {}", toEmail);
        } catch (Exception e) {
            log.error("아이디 찾기 결과 이메일 발송 실패: {} - {}", toEmail, e.getMessage());
            throw new RuntimeException("이메일 발송에 실패했습니다.", e);
        }
    }
    
    /**
     * 이메일 인증 토큰 생성 (generateEmailVerificationToken 별칭)
     */
    public String generateEmailVerificationToken() {
        return generateVerificationCode();
    }
    
    /**
     * 이메일 인증 발송 (sendEmailVerification 별칭)
     */
    public void sendEmailVerification(String email, String token, String username) {
        sendUsernameVerificationEmail(email, token);
    }
    
    /**
     * 찾은 이메일 발송 (sendFoundEmail 별칭)  
     */
    public void sendFoundEmail(String email, String username) {
        sendFoundUsernameEmail(email, username);
    }
    
    /**
     * 임시 비밀번호 생성 (8자리 임의 문자열)
     */
    public String generateTemporaryPassword() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        Random random = new Random();
        StringBuilder password = new StringBuilder();
        for (int i = 0; i < 8; i++) {
            password.append(chars.charAt(random.nextInt(chars.length())));
        }
        return password.toString();
    }
    
    /**
     * 임시 비밀번호 이메일 발송
     */
    public void sendTemporaryPassword(String toEmail, String temporaryPassword, String username) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("[도서관리시스템] 임시 비밀번호 발급");
            message.setText("안녕하세요 " + username + "님,\n\n" +
                    "요청하신 임시 비밀번호가 발급되었습니다.\n\n" +
                    "임시 비밀번호: " + temporaryPassword + "\n\n" +
                    "로그인 후 반드시 비밀번호를 변경해주세요.\n\n" +
                    "감사합니다.");
            message.setFrom("noreply@library.com");
            
            mailSender.send(message);
            log.info("임시 비밀번호 이메일 발송 성공: {}", toEmail);
        } catch (Exception e) {
            log.error("임시 비밀번호 이메일 발송 실패: {} - {}", toEmail, e.getMessage());
            throw new RuntimeException("이메일 발송에 실패했습니다.", e);
        }
    }
}

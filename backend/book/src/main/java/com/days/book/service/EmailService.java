package com.days.book.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.Random;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    /**
     * 이메일 인증 메일 발송
     */
    public void sendEmailVerification(String toEmail, String verificationToken, String username) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("도서관리 시스템 - 이메일 인증");
        
        String content = "안녕하세요 " + username + "님,\n\n" +
                "도서관리 시스템 회원가입을 위해 이메일 인증을 완료해주세요.\n\n" +
                "인증 토큰: " + verificationToken + "\n\n" +
                "이 토큰을 사용하여 이메일 인증을 완료하시기 바랍니다.\n\n" +
                "감사합니다.\n" +
                "도서관리 시스템 팀";
                
        message.setText(content);
        mailSender.send(message);
    }

    /**
     * 임시 비밀번호 발송
     */
    public void sendTemporaryPassword(String toEmail, String temporaryPassword, String username) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("도서관리 시스템 - 임시 비밀번호 발급");
        
        String content = "안녕하세요 " + username + "님,\n\n" +
                "비밀번호 찾기 요청에 따라 임시 비밀번호를 발급해드립니다.\n\n" +
                "임시 비밀번호: " + temporaryPassword + "\n\n" +
                "보안을 위해 로그인 후 반드시 비밀번호를 변경해주세요.\n\n" +
                "감사합니다.\n" +
                "도서관리 시스템 팀";
                
        message.setText(content);
        mailSender.send(message);
    }

    /**
     * 사용자 이메일 찾기 결과 발송
     */
    public void sendFoundEmail(String toEmail, String username) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("도서관리 시스템 - 이메일 찾기 결과");
        
        String content = "안녕하세요,\n\n" +
                "요청하신 이메일 찾기 결과입니다.\n\n" +
                "사용자명: " + username + "\n" +
                "이메일: " + toEmail + "\n\n" +
                "감사합니다.\n" +
                "도서관리 시스템 팀";
                
        message.setText(content);
        mailSender.send(message);
    }

    /**
     * 임시 비밀번호 생성 (8자리)
     */
    public String generateTemporaryPassword() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        Random random = new Random();
        StringBuilder sb = new StringBuilder();
        
        for (int i = 0; i < 8; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        
        return sb.toString();
    }

    /**
     * 이메일 인증 토큰 생성 (6자리 숫자)
     */
    public String generateEmailVerificationToken() {
        Random random = new Random();
        return String.format("%06d", random.nextInt(1000000));
    }
}

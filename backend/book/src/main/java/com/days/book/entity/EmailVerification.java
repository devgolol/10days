package com.days.book.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "email_verifications")
@Data
@NoArgsConstructor
public class EmailVerification {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String email;
    
    @Column(nullable = false, length = 6)
    private String verificationCode;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VerificationType type;
    
    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    @Column(nullable = false)
    private LocalDateTime expiresAt;
    
    @Column(nullable = false)
    private boolean verified = false;
    
    public EmailVerification(String email, String verificationCode, VerificationType type) {
        this.email = email;
        this.verificationCode = verificationCode;
        this.type = type;
        this.createdAt = LocalDateTime.now();
        this.expiresAt = LocalDateTime.now().plusMinutes(5); // 5분 후 만료
    }
    
    public enum VerificationType {
        USERNAME_RECOVERY,      // 아이디 찾기
        PASSWORD_RESET         // 비밀번호 초기화
    }
    
    /**
     * 인증 코드가 만료되었는지 확인
     */
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(this.expiresAt);
    }
    
    /**
     * 인증 완료 처리
     */
    public void markAsVerified() {
        this.verified = true;
    }
}

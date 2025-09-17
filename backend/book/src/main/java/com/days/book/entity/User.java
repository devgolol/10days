package com.days.book.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User implements UserDetails {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String username;
    
    @Column(nullable = false)
    private String password;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    // 도서관 회원 정보 추가
    @Column(nullable = false, length = 50)
    private String name;
    
    @Column(length = 15)
    private String phone;
    
    @Column(length = 200)
    private String address;
    
    @Column(name = "member_number", unique = true, length = 20)
    private String memberNumber;
    
    @Column(name = "join_date")
    @Builder.Default
    private LocalDate joinDate = LocalDate.now();
    
    @Enumerated(EnumType.STRING)
    @Column(name = "member_status", length = 20)
    @Builder.Default
    private MemberStatus memberStatus = MemberStatus.ACTIVE;
    
    @Column(name = "max_loan_count", nullable = false)
    @Builder.Default
    private Integer maxLoanCount = 5;
    
    @Column(name = "email_verified", nullable = false)
    @Builder.Default
    private Boolean emailVerified = false;
    
    @Column(name = "email_verification_token")
    private String emailVerificationToken;
    
    @Column(name = "password_reset_token")
    private String passwordResetToken;
    
    @Column(name = "password_reset_token_expiry")
    private LocalDateTime passwordResetTokenExpiry;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // UserDetails 구현
    @Override
    public String getUsername() {
        return username;
    }
    
    @Override
    public String getPassword() {
        return password;
    }
    
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }
    
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }
    
    @Override
    public boolean isAccountNonLocked() {
        return true;
    }
    
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }
    
    @Override
    public boolean isEnabled() {
        return true;
    }
    
    // MemberStatus enum
    public enum MemberStatus {
        ACTIVE("활성"),
        SUSPENDED("정지"),
        WITHDRAWN("탈퇴");

        private final String description;

        MemberStatus(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }
    
    // 도서관 회원 관련 메서드들
    public boolean canLoan() {
        return memberStatus == MemberStatus.ACTIVE;
    }

    public void suspend() {
        this.memberStatus = MemberStatus.SUSPENDED;
    }

    public void activate() {
        this.memberStatus = MemberStatus.ACTIVE;
    }

    public void withdraw() {
        this.memberStatus = MemberStatus.WITHDRAWN;
    }

    public static String generateMemberNumber() {
        String date = LocalDate.now().toString().replace("-", "");
        long timestamp = System.currentTimeMillis() % 1000;
        return "M" + date + String.format("%03d", timestamp);
    }
}

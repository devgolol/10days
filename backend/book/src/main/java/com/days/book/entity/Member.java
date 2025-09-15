package com.days.book.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "members")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private  Long id;

    @Column(name = "member_number", unique = true, nullable = false, length = 20)
    private String memberNumber;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(nullable = false, length = 50)
    private String email;

    @Column(length = 15)
    private String phone;

    @Column(length = 200)
    private String address;

    @Column(name = "join_date",nullable = false)
    @Builder.Default
    private LocalDate joinDate = LocalDate.now();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private MemberStatus status = MemberStatus.ACTIVE;

    @Column(name = "max_loan_count", nullable = false)
    @Builder.Default
    private Integer maxLoanCount = 5;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

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

    public boolean canLoan() {
        return status == MemberStatus.ACTIVE;
    }

    public void suspend() {
        this.status = MemberStatus.SUSPENDED;
    }

    public void activate() {
        this.status = MemberStatus.ACTIVE;
    }

    public void withdraw() {
        this.status = MemberStatus.WITHDRAWN;
    }

    public static String generateMemberNumber() {
        String date = LocalDate.now().toString().replace("-", "");
        long timestamp = System.currentTimeMillis() % 1000;
        return "M" + date + String.format("%03d", timestamp);
    }
}

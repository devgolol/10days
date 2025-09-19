package com.days.book.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "loans")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
public class Loan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = true)
    private Book book;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = true)
    private Member member;

    @Column(name = "loan_date", nullable = false)
    @Builder.Default
    private LocalDate loanDate = LocalDate.now();

    @Column(name = "due_date",nullable = false)
    @Builder.Default
    private LocalDate dueDate = LocalDate.now().plusDays(14);

    @Column(name = "return_date")
    private LocalDate returnDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private LoanStatus status = LoanStatus.ACTIVE;

    @Column(name = "overdue_fee")
    @Builder.Default
    private Integer overdueFee = 0;

    @Column(name = "notes", length = 500)
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime UpdatedAt;

    public enum LoanStatus {
        ACTIVE("대출중"),
        RETURNED("반납완료"),
        OVERDUE("연체"),
        LOST("분실");

        private final String description;

        LoanStatus(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }

    public long getOverdueDays() {
        LocalDate checkDate = returnDate != null ? returnDate : LocalDate.now();
        if(checkDate.isAfter(dueDate)) {
            return ChronoUnit.DAYS.between(dueDate, checkDate);
        }
        return 0;
    }

    public int calculateOverdueFee() {
        long overdueDays = getOverdueDays();
        return (int) (overdueDays * 100);
    }

    public boolean isOverdue() {
        return status == LoanStatus.ACTIVE && LocalDate.now().isAfter(dueDate);
    }

    public void returnBook() {
        this.returnDate = LocalDate.now();
        this.overdueFee = calculateOverdueFee();

        if(isOverdue()) {
            this.status = LoanStatus.OVERDUE;
        } else {
            this.status = LoanStatus.RETURNED;
        }

        if (book != null) {
            book.returnBook();;
        }
    }

    public void markAsLost() {
        this.status = LoanStatus.LOST;
        this.overdueFee = calculateOverdueFee();
        this.notes = (notes != null ? notes + " | " : "" ) + "분실 처리됨 - " + LocalDate.now();
    }

    public void markAsOverdue() {
        if(status == LoanStatus.ACTIVE && isOverdue()) {
            this.status = LoanStatus.OVERDUE;
            this.overdueFee = calculateOverdueFee();
        }
    }
    
    public boolean extendLoan() {
        if (status == LoanStatus.ACTIVE && !isOverdue()) {
            this.dueDate = this.dueDate.plusDays(7);
            this.notes = (notes != null ? notes + " | " : "") + "대출연장 - " + LocalDate.now();
            return true;
        }
        return false;
    }
}

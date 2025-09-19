package com.days.book.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.days.book.entity.Loan.LoanStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoanResponseDTO {
    
    // Loan 기본 정보
    private Long id;
    private LocalDate loanDate;
    private LocalDate dueDate;
    private LocalDate returnDate;
    private LoanStatus status;
    private Integer overdueFee;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Book 정보 (필요한 것만)
    private Long bookId;
    private String bookTitle;
    private String bookAuthor;
    private String bookIsbn;
    private String bookCategory;
    
    // Member 정보 (필요한 것만)
    private Long memberId;
    private String memberName;
    private String memberEmail;
    private String memberNumber;
    
    // 계산된 필드
    private long overdueDays;
    private boolean overdue;
}

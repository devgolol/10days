package com.days.book.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * 대출 생성 요청 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoanCreateRequest {
    
    private Long bookId;
    
    private Long memberId;
    
    private String loanDate;
    
    private String dueDate;
}

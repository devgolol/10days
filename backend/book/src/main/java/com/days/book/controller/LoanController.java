package com.days.book.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.days.book.entity.Loan;
import com.days.book.entity.Loan.LoanStatus;
import com.days.book.service.LoanService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/loans")
@RequiredArgsConstructor
public class LoanController {

    private final LoanService loanService;

    /**
     * 도서 대출
     */
    @PostMapping
    public ResponseEntity<Loan> createLoan(@RequestParam Long bookId, @RequestParam Long memberId) {
        try {
            Loan loan = loanService.createLoan(bookId, memberId);
            return ResponseEntity.status(HttpStatus.CREATED).body(loan);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * 도서 반납
     */
    @PutMapping("/{loanId}/return")
    public ResponseEntity<Loan> returnBook(@PathVariable Long loanId) {
        try {
            Loan loan = loanService.returnBook(loanId);
            return ResponseEntity.ok(loan);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * 대출 연장
     */
    @PutMapping("/{loanId}/extend")
    public ResponseEntity<Loan> extendLoan(@PathVariable Long loanId) {
        try {
            Loan loan = loanService.extendLoan(loanId);
            return ResponseEntity.ok(loan);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * 분실 처리
     */
    @PutMapping("/{loanId}/lost")
    public ResponseEntity<Loan> markAsLost(@PathVariable Long loanId, @RequestParam(required = false) String reason) {
        try {
            Loan loan = loanService.markAsLost(loanId, reason);
            return ResponseEntity.ok(loan);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * 특정 대출 조회
     */
    @GetMapping("/{loanId}")
    public ResponseEntity<Loan> getLoan(@PathVariable Long loanId) {
        try {
            Loan loan = loanService.getLoan(loanId);
            return ResponseEntity.ok(loan);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * 회원별 활성 대출 조회
     */
    @GetMapping("/member/{memberId}/active")
    public ResponseEntity<List<Loan>> getActiveLoansByMember(@PathVariable Long memberId) {
        try {
            List<Loan> loans = loanService.getActiveLoansByMember(memberId);
            return ResponseEntity.ok(loans);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * 회원별 대출 이력 조회
     */
    @GetMapping("/member/{memberId}/history")
    public ResponseEntity<List<Loan>> getLoanHistoryByMember(@PathVariable Long memberId) {
        try {
            List<Loan> loans = loanService.getLoanHistoryByMember(memberId);
            return ResponseEntity.ok(loans);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * 도서별 대출 이력 조회
     */
    @GetMapping("/book/{bookId}/history")
    public ResponseEntity<List<Loan>> getLoanHistoryByBook(@PathVariable Long bookId) {
        try {
            List<Loan> loans = loanService.getLoanHistoryByBook(bookId);
            return ResponseEntity.ok(loans);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * 연체된 대출 조회
     */
    @GetMapping("/overdue")
    public ResponseEntity<List<Loan>> getOverdueLoans() {
        List<Loan> loans = loanService.getOverdueLoans();
        return ResponseEntity.ok(loans);
    }

    /**
     * 오늘 반납 예정인 대출 조회
     */
    @GetMapping("/due-today")
    public ResponseEntity<List<Loan>> getTodayDueLoans() {
        List<Loan> loans = loanService.getTodayDueLoans();
        return ResponseEntity.ok(loans);
    }

    /**
     * 상태별 대출 조회
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Loan>> getLoansByStatus(@PathVariable LoanStatus status) {
        List<Loan> loans = loanService.getLoansByStatus(status);
        return ResponseEntity.ok(loans);
    }

    /**
     * 기간별 대출 조회
     */
    @GetMapping("/date-range")
    public ResponseEntity<List<Loan>> getLoansByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<Loan> loans = loanService.getLoansByDateRange(startDate, endDate);
        return ResponseEntity.ok(loans);
    }

    /**
     * 회원의 연체료 총액 조회
     */
    @GetMapping("/member/{memberId}/overdue-fee")
    public ResponseEntity<Integer> getTotalOverdueFeeByMember(@PathVariable Long memberId) {
        try {
            Integer totalFee = loanService.getTotalOverdueFeeByMember(memberId);
            return ResponseEntity.ok(totalFee);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * 연체 상태 일괄 업데이트 (관리자용)
     */
    @PutMapping("/update-overdue-status")
    public ResponseEntity<Integer> updateOverdueStatus() {
        int updatedCount = loanService.updateOverdueStatus();
        return ResponseEntity.ok(updatedCount);
    }

    /**
     * 회원의 현재 대출 수 조회
     */
    @GetMapping("/member/{memberId}/count")
    public ResponseEntity<Long> getCurrentLoanCountByMember(@PathVariable Long memberId) {
        try {
            Long count = loanService.getCurrentLoanCountByMember(memberId);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * 전체 대출 통계
     */
    @GetMapping("/statistics")
    public ResponseEntity<LoanService.LoanStatistics> getLoanStatistics() {
        LoanService.LoanStatistics statistics = loanService.getLoanStatistics();
        return ResponseEntity.ok(statistics);
    }
}
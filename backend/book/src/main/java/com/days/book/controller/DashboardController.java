package com.days.book.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.days.book.service.BookService;
import com.days.book.service.MemberService;
import com.days.book.service.LoanService;

import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
@Slf4j
public class DashboardController {
    
    private final BookService bookService;
    private final MemberService memberService;
    private final LoanService loanService;
    
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getDashboardStats() {
        try {
            // 각 서비스에서 통계 데이터 수집
            long totalBooks = bookService.getTotalBooksCount();
            long totalMembers = memberService.getTotalMembersCount();
            long activeLoans = loanService.getActiveLoansCount();
            long overdueLoans = loanService.getOverdueLoansCount();
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalBooks", totalBooks);
            stats.put("totalMembers", totalMembers);
            stats.put("activeLoans", activeLoans);
            stats.put("overdueLoans", overdueLoans);
            stats.put("recentLoans", loanService.getRecentLoans(5));
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", stats);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error getting dashboard stats: {}", e.getMessage());
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "대시보드 통계를 가져오는데 실패했습니다: " + e.getMessage());
            
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
    
    @GetMapping("/recent-loans")
    public ResponseEntity<?> getRecentLoans(@RequestParam(defaultValue = "10") int limit) {
        try {
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", loanService.getRecentLoans(limit));
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error getting recent loans: {}", e.getMessage());
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "최근 대출 목록을 가져오는데 실패했습니다: " + e.getMessage());
            
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
}

package com.days.book.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.days.book.service.EmailService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176", "http://localhost:3000"})
public class TestController {
    
    private final EmailService emailService;
    
    @PostMapping("/send-test-email")
    public ResponseEntity<?> sendTestEmail(@RequestParam String email) {
        try {
            String testCode = emailService.generateVerificationCode();
            emailService.sendEmailVerification(email, testCode, "테스트사용자");
            return ResponseEntity.ok("테스트 이메일 발송 성공: " + testCode);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("이메일 발송 실패: " + e.getMessage());
        }
    }
}

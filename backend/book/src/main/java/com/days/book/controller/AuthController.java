package com.days.book.controller;

import com.days.book.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final AuthService authService;

    /**
     * 회원가입
     */
    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@RequestBody RegisterRequest request) {
        try {
            String message = authService.register(request.getUsername(), request.getPassword(), request.getEmail());
            return ResponseEntity.ok(Map.of("message", message));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 로그인
     */
    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody LoginRequest request) {
        System.out.println("=== Login attempt ===");
        System.out.println("Username: " + request.getUsername());
        System.out.println("Password length: " + (request.getPassword() != null ? request.getPassword().length() : "null"));
        
        try {
            Map<String, String> loginResult = authService.loginWithUserInfo(request.getUsername(), request.getPassword());
            System.out.println("Login successful for user: " + request.getUsername());
            return ResponseEntity.ok(loginResult);
        } catch (RuntimeException e) {
            System.out.println("Login failed for user: " + request.getUsername());
            System.out.println("Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 이메일 인증
     */
    @PostMapping("/verify-email")
    public ResponseEntity<Map<String, String>> verifyEmail(@RequestBody VerifyEmailRequest request) {
        try {
            String message = authService.verifyEmail(request.getEmail(), request.getToken());
            return ResponseEntity.ok(Map.of("message", message));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 아이디 찾기 - 인증코드 발송
     */
    @PostMapping("/find-id/send-code")
    public ResponseEntity<Map<String, String>> sendFindIdCode(@RequestBody FindIdSendCodeRequest request) {
        try {
            String message = authService.sendFindIdCode(request.getEmail());
            return ResponseEntity.ok(Map.of("message", message));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * 아이디 찾기 - 인증코드 확인
     */
    @PostMapping("/find-id/verify-code")
    public ResponseEntity<Map<String, String>> verifyFindIdCode(@RequestBody FindIdVerifyCodeRequest request) {
        try {
            Map<String, String> result = authService.verifyFindIdCode(request.getEmail(), request.getCode());
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * 비밀번호 찾기 - 인증코드 발송
     */
    @PostMapping("/reset-password/send-code")
    public ResponseEntity<Map<String, String>> sendResetPasswordCode(@RequestBody ResetPasswordSendCodeRequest request) {
        try {
            String message = authService.sendResetPasswordCode(request.getUsername(), request.getEmail());
            return ResponseEntity.ok(Map.of("message", message));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * 비밀번호 찾기 - 인증코드 확인
     */
    @PostMapping("/reset-password/verify-code")  
    public ResponseEntity<Map<String, String>> verifyResetPasswordCode(@RequestBody ResetPasswordVerifyCodeRequest request) {
        try {
            String message = authService.verifyResetPasswordCode(
                request.getUsername(), request.getEmail(), request.getCode());
            return ResponseEntity.ok(Map.of("message", message));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * 비밀번호 찾기 - 새 비밀번호 설정
     */
    @PostMapping("/reset-password/set-new")
    public ResponseEntity<Map<String, String>> setNewPassword(@RequestBody SetNewPasswordRequest request) {
        try {
            String message = authService.resetPasswordWithCode(
                request.getUsername(), request.getEmail(), request.getCode(), request.getNewPassword());
            return ResponseEntity.ok(Map.of("message", message));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Request DTOs
    public static class RegisterRequest {
        private String username;
        private String password;
        private String email;

        // Getters and Setters
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }

    public static class LoginRequest {
        private String username;
        private String password;

        // Getters and Setters
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class VerifyEmailRequest {
        private String email;
        private String token;

        // Getters and Setters
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }
    }

    public static class FindIdSendCodeRequest {
        private String email;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }
    
    public static class FindIdVerifyCodeRequest {
        private String email;
        private String code;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }
    }
    
    public static class ResetPasswordSendCodeRequest {
        private String username;
        private String email;

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }
    
    public static class ResetPasswordVerifyCodeRequest {
        private String username;
        private String email;
        private String code;

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }
    }
    
    public static class SetNewPasswordRequest {
        private String username;
        private String email;
        private String code;
        private String newPassword;

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }
        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }
}

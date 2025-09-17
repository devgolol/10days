package com.days.book.controller;

import com.days.book.service.AuthService;
import com.days.book.service.JwtService;
import com.days.book.entity.User;
import com.days.book.entity.Role;
import com.days.book.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176", "http://localhost:3000"})
@Slf4j
public class AuthController {

    private final AuthService authService;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * 회원가입
     */
    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@RequestBody RegisterRequest request) {
        try {
            String message = authService.register(
                request.getUsername(), 
                request.getPassword(), 
                request.getEmail(),
                request.getName(),
                request.getPhone(),
                request.getAddress()
            );
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
        private String name;
        private String phone;
        private String address;

        // Getters and Setters
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }
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
    
    /**
     * 회원탈퇴
     */
    @PostMapping("/withdraw")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> withdraw(@RequestBody WithdrawRequest request, Authentication authentication) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String username = authentication.getName();
            
            // 관리자 계정은 탈퇴 불가
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
            
            if (user.getRole() == Role.ADMIN) {
                response.put("success", false);
                response.put("error", "관리자 계정은 탈퇴할 수 없습니다.");
                return ResponseEntity.badRequest().body(response);
            }
            
            // 비밀번호 확인
            if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                response.put("success", false);
                response.put("error", "비밀번호가 일치하지 않습니다.");
                return ResponseEntity.badRequest().body(response);
            }
            
            // 회원 정보 삭제 (실제로는 상태 변경이나 soft delete 권장)
            userRepository.delete(user);
            
            response.put("success", true);
            response.put("message", "회원탈퇴가 완료되었습니다.");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Withdraw error: {}", e.getMessage());
            response.put("success", false);
            response.put("error", "회원탈퇴 처리 중 오류가 발생했습니다.");
            return ResponseEntity.internalServerError().body(response);
        }
    }
    
    public static class WithdrawRequest {
        private String password;

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }
}

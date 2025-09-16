package com.days.book.config;

import com.days.book.entity.Role;
import com.days.book.entity.User;
import com.days.book.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Override
    public void run(String... args) throws Exception {
        createDefaultAdminUser();
    }
    
    private void createDefaultAdminUser() {
        if (!userRepository.existsByUsername("admin")) {
            User admin = User.builder()
                    .username("admin")
                    .email("admin@library.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role(Role.ADMIN)
                    .emailVerified(true)  // 관리자 계정은 이메일 인증 완료 상태로 생성
                    .build();
            
            userRepository.save(admin);
            log.info("Default admin user created: username=admin, password=admin123");
        } else {
            log.info("Admin user already exists");
        }
    }
}

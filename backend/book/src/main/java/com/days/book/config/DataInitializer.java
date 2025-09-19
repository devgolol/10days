package com.days.book.config;

import com.days.book.entity.*;
import com.days.book.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {
    
    private final UserRepository userRepository;
    private final MemberRepository memberRepository;
    private final BookRepository bookRepository;
    private final LoanRepository loanRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Override
    public void run(String... args) throws Exception {
        createDefaultAdminUser();
        createDefaultTestUser();
        createMemberForExistingUsers(); // 기존 사용자들을 위한 Member 생성
        // MOCK 데이터 생성 비활성화 - 실제 운영을 위해 샘플 데이터 제거
        // createSampleMembers();
        // createSampleBooks();
        // createSampleLoans();
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

    private void createDefaultTestUser() {
        if (!userRepository.existsByUsername("user")) {
            User user = User.builder()
                    .username("user")
                    .email("user@library.com")
                    .password(passwordEncoder.encode("user123"))
                    .role(Role.USER)
                    .emailVerified(true)  // 테스트 계정도 이메일 인증 완료 상태로 생성
                    .build();
            
            userRepository.save(user);
            log.info("Default test user created: username=user, password=user123");
        } else {
            log.info("Test user already exists");
        }
    }

    private void createMemberForExistingUsers() {
        // 모든 기존 사용자들을 위한 Member 자동 생성
        log.info("기존 사용자들을 위한 Member 동기화 시작...");
        
        // 모든 USERS 조회
        List<User> allUsers = userRepository.findAll();
        
        for (User user : allUsers) {
            // 해당 이메일로 Member가 없으면 생성
            if (!memberRepository.existsByEmail(user.getEmail())) {
                try {
                    // Member 번호 자동 생성 (현재 시간 기반으로 유니크하게)
                    long timestamp = System.currentTimeMillis() % 100000; // 마지막 5자리
                    String memberNumber = String.format("M%d%05d", 
                        LocalDate.now().getYear(), timestamp);
                    
                    Member newMember = Member.builder()
                            .memberNumber(memberNumber)
                            .name(user.getName() != null ? user.getName() : user.getUsername())
                            .email(user.getEmail())
                            .phone(user.getPhone() != null ? user.getPhone() : "010-0000-0000")
                            .address(user.getAddress() != null ? user.getAddress() : "주소 미입력")
                            .status(Member.MemberStatus.ACTIVE)
                            .joinDate(LocalDate.now())
                            .maxLoanCount(user.getRole() == Role.ADMIN ? 10 : 5)
                            .build();
                    
                    memberRepository.save(newMember);
                    log.info("Member 자동 생성: {} -> {}", user.getUsername(), user.getEmail());
                    
                    // 중복 방지를 위한 짧은 대기
                    Thread.sleep(1);
                    
                } catch (Exception e) {
                    log.warn("Member 생성 실패 (무시하고 계속): {} - {}", user.getEmail(), e.getMessage());
                }
            } else {
                log.info("Member 이미 존재: {}", user.getEmail());
            }
        }
        
        log.info("Member 동기화 완료. 총 사용자 수: {}, 총 Member 수: {}", 
            userRepository.count(), memberRepository.count());
    }

    private void createSampleMembers() {
        if (memberRepository.count() == 0) {
            Member[] members = {
                Member.builder()
                    .memberNumber("M2025001")
                    .name("김철수")
                    .email("kim.cs@email.com")
                    .phone("010-1234-5678")
                    .address("서울시 강남구 역삼동 123-45")
                    .status(Member.MemberStatus.ACTIVE)
                    .joinDate(LocalDate.of(2025, 1, 15))
                    .maxLoanCount(5)
                    .build(),
                Member.builder()
                    .memberNumber("M2025002")
                    .name("이영희")
                    .email("lee.yh@email.com")
                    .phone("010-2345-6789")
                    .address("서울시 서초구 서초동 456-78")
                    .status(Member.MemberStatus.ACTIVE)
                    .joinDate(LocalDate.of(2025, 1, 20))
                    .maxLoanCount(5)
                    .build(),
                Member.builder()
                    .memberNumber("M2025003")
                    .name("박민수")
                    .email("park.ms@email.com")
                    .phone("010-3456-7890")
                    .address("서울시 종로구 종로1가 789-12")
                    .status(Member.MemberStatus.SUSPENDED)
                    .joinDate(LocalDate.of(2025, 2, 1))
                    .maxLoanCount(5)
                    .build(),
                Member.builder()
                    .memberNumber("M2025004")
                    .name("정수현")
                    .email("jung.sh@email.com")
                    .phone("010-4567-8901")
                    .address("서울시 마포구 홍대동 234-56")
                    .status(Member.MemberStatus.ACTIVE)
                    .joinDate(LocalDate.of(2025, 2, 5))
                    .maxLoanCount(5)
                    .build(),
                Member.builder()
                    .memberNumber("M2025005")
                    .name("황동현")
                    .email("hwang.dh@email.com")
                    .phone("010-5678-9012")
                    .address("서울시 용산구 이태원동 567-89")
                    .status(Member.MemberStatus.WITHDRAWN)
                    .joinDate(LocalDate.of(2024, 12, 10))
                    .maxLoanCount(5)
                    .build()
            };
            
            for (Member member : members) {
                memberRepository.save(member);
            }
            log.info("Sample members created: {}", members.length);
        } else {
            log.info("Members already exist: count={}", memberRepository.count());
        }
    }

    private void createSampleBooks() {
        if (bookRepository.count() <= 1) { // 이미 1권이 있으므로
            Book[] books = {
                Book.builder()
                    .title("이펙티브 자바")
                    .author("조슈아 블로크")
                    .isbn("9788966262281")
                    .category("프로그래밍")
                    .publisher("인사이트")
                    .publishedDate(LocalDate.of(2018, 11, 1))
                    .totalCopies(3)
                    .availableCopies(2)
                    .description("자바 개발자 필독서")
                    .build()
            };
            
            for (Book book : books) {
                bookRepository.save(book);
            }
            log.info("Sample books created: {}", books.length);
        } else {
            log.info("Books already exist: count={}", bookRepository.count());
        }
    }

    private void createSampleLoans() {
        if (loanRepository.count() == 0 && memberRepository.count() > 0 && bookRepository.count() > 0) {
            Member member1 = memberRepository.findByMemberNumber("M2025001").orElse(null);
            Member member2 = memberRepository.findByMemberNumber("M2025002").orElse(null);
            Book book1 = bookRepository.findAll().get(0); // 첫 번째 책
            List<Book> books2 = bookRepository.findByTitleContaining("이펙티브 자바");
            Book book2 = books2.isEmpty() ? null : books2.get(0);
            
            if (member1 != null && member2 != null && book1 != null) {
                // 현재 대출 중인 책
                Loan activeLoan = Loan.builder()
                    .book(book1)
                    .member(member1)
                    .loanDate(LocalDate.of(2025, 9, 10))
                    .dueDate(LocalDate.of(2025, 9, 24))
                    .status(Loan.LoanStatus.ACTIVE)
                    .overdueFee(0)
                    .build();
                loanRepository.save(activeLoan);

                // 연체된 책 (book2가 있는 경우)
                if (book2 != null) {
                    Loan overdueLoan = Loan.builder()
                        .book(book2)
                        .member(member2)
                        .loanDate(LocalDate.of(2025, 9, 5))
                        .dueDate(LocalDate.of(2025, 9, 19))
                        .status(Loan.LoanStatus.OVERDUE)
                        .overdueFee(300)
                        .build();
                    loanRepository.save(overdueLoan);
                }

                // 반납 완료된 책
                Loan returnedLoan = Loan.builder()
                    .book(book1)
                    .member(member1)
                    .loanDate(LocalDate.of(2025, 8, 20))
                    .dueDate(LocalDate.of(2025, 9, 3))
                    .returnDate(LocalDate.of(2025, 9, 1))
                    .status(Loan.LoanStatus.RETURNED)
                    .overdueFee(0)
                    .build();
                loanRepository.save(returnedLoan);

                log.info("Sample loans created: 3");
            }
        } else {
            log.info("Loans already exist or no members/books: count={}", loanRepository.count());
        }
    }
}

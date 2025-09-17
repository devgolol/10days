package com.days.book.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.days.book.entity.Book;
import com.days.book.entity.Loan;
import com.days.book.entity.Loan.LoanStatus;
import com.days.book.entity.Member;
import com.days.book.entity.Member.MemberStatus;
import com.days.book.entity.User;
import com.days.book.repository.LoanRepository;
import com.days.book.repository.UserRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class LoanService {

    private final LoanRepository loanRepository;
    private final BookService bookService;
    private final MemberService memberService;
    private final UserRepository userRepository;

    /**
     * 도서 대출
     */
    public Loan createLoan(Long bookId, Long memberId) {
        // 1. 도서와 회원 정보 조회
        Book book = bookService.getBook(bookId);
        Member member = memberService.getMember(memberId);

        // 2. 대출 가능 여부 검증
        validateLoanEligibility(book, member);

        // 3. 대출 생성
        Loan loan = Loan.builder()
                .book(book)
                .member(member)
                .loanDate(LocalDate.now())
                .dueDate(LocalDate.now().plusDays(14))
                .status(LoanStatus.ACTIVE)
                .overdueFee(0)
                .build();

        // 4. 도서 재고 감소
        book.loanBook();
        bookService.updateBook(book);

        return loanRepository.save(loan);
    }

    /**
     * 도서 반납
     */
    public Loan returnBook(Long loanId) {
        Loan loan = getLoan(loanId);

        // 이미 반납된 대출인지 확인
        if (loan.getStatus() == LoanStatus.RETURNED) {
            throw new RuntimeException("이미 반납된 대출입니다.");
        }

        // 반납 처리 (Loan 엔티티의 메서드 사용)
        loan.returnBook();

        return loanRepository.save(loan);
    }

    /**
     * 대출 연장
     */
    public Loan extendLoan(Long loanId) {
        Loan loan = getLoan(loanId);

        if (!loan.extendLoan()) {
            throw new RuntimeException("대출 연장이 불가능합니다. 연체된 대출은 연장할 수 없습니다.");
        }

        return loanRepository.save(loan);
    }

    /**
     * 분실 처리
     */
    public Loan markAsLost(Long loanId, String reason) {
        Loan loan = getLoan(loanId);
        
        loan.markAsLost();
        if (reason != null && !reason.trim().isEmpty()) {
            loan.setNotes(loan.getNotes() + " | 분실사유: " + reason);
        }

        return loanRepository.save(loan);
    }

    /**
     * ID로 대출 정보 조회
     */
    @Transactional(readOnly = true)
    public Loan getLoan(Long id) {
        return loanRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("대출 정보를 찾을 수 없습니다. ID: " + id));
    }

    /**
     * 회원별 활성 대출 조회
     */
    @Transactional(readOnly = true)
    public List<Loan> getActiveLoansByMember(Long memberId) {
        Member member = memberService.getMember(memberId);
        return loanRepository.findActiveLoansByMember(member);
    }

    /**
     * 회원별 대출 이력 조회
     */
    @Transactional(readOnly = true)
    public List<Loan> getLoanHistoryByMember(Long memberId) {
        Member member = memberService.getMember(memberId);
        return loanRepository.findByMemberOrderByLoanDateDesc(member);
    }

    /**
     * 도서별 대출 이력 조회
     */
    @Transactional(readOnly = true)
    public List<Loan> getLoanHistoryByBook(Long bookId) {
        Book book = bookService.getBook(bookId);
        return loanRepository.findByBookOrderByLoanDateDesc(book);
    }

    /**
     * 연체된 대출 조회
     */
    @Transactional(readOnly = true)
    public List<Loan> getOverdueLoans() {
        return loanRepository.findOverdueLoans(LocalDate.now());
    }

    /**
     * 오늘 반납 예정인 대출 조회
     */
    @Transactional(readOnly = true)
    public List<Loan> getTodayDueLoans() {
        return loanRepository.findByDueDateAndStatus(LocalDate.now(), LoanStatus.ACTIVE);
    }

    /**
     * 상태별 대출 조회
     */
    @Transactional(readOnly = true)
    public List<Loan> getLoansByStatus(LoanStatus status) {
        return loanRepository.findByStatus(status);
    }

    /**
     * 기간별 대출 조회
     */
    @Transactional(readOnly = true)
    public List<Loan> getLoansByDateRange(LocalDate startDate, LocalDate endDate) {
        return loanRepository.findByLoanDateBetween(startDate, endDate);
    }

    /**
     * 회원의 연체료 총액 조회
     */
    @Transactional(readOnly = true)
    public Integer getTotalOverdueFeeByMember(Long memberId) {
        Member member = memberService.getMember(memberId);
        return loanRepository.getTotalOverdueFeeByMember(member);
    }

    /**
     * 연체 상태 일괄 업데이트 (배치 작업용)
     */
    public int updateOverdueStatus() {
        List<Loan> overdueLoans = loanRepository.findOverdueLoans(LocalDate.now());
        
        for (Loan loan : overdueLoans) {
            loan.markAsOverdue();
        }
        
        loanRepository.saveAll(overdueLoans);
        return overdueLoans.size();
    }

    /**
     * 회원의 현재 대출 수 조회
     */
    @Transactional(readOnly = true)
    public Long getCurrentLoanCountByMember(Long memberId) {
        Member member = memberService.getMember(memberId);
        return loanRepository.countByMemberAndStatus(member, LoanStatus.ACTIVE);
    }

    /**
     * 전체 대출 통계
     */
    @Transactional(readOnly = true)
    public LoanStatistics getLoanStatistics() {
        long totalLoans = loanRepository.count();
        long activeLoans = loanRepository.findByStatus(LoanStatus.ACTIVE).size();
        long overdueLoans = getOverdueLoans().size();
        long returnedLoans = loanRepository.findByStatus(LoanStatus.RETURNED).size();
        
        return LoanStatistics.builder()
                .totalLoans(totalLoans)
                .activeLoans(activeLoans)
                .overdueLoans(overdueLoans)
                .returnedLoans(returnedLoans)
                .build();
    }

    @Transactional(readOnly = true)
    public List<Loan> getRecentLoans(int limit) {
        return loanRepository.findRecentLoans(limit);
    }

    /**
     * DashboardController용 메서드들
     */
    @Transactional(readOnly = true)
    public long getActiveLoansCount() {
        return loanRepository.countByStatus(LoanStatus.ACTIVE);
    }

    @Transactional(readOnly = true)
    public long getOverdueLoansCount() {
        return loanRepository.findOverdueLoans(LocalDate.now()).size();
    }

    /**
     * 대출 가능 여부 검증
     */
    private void validateLoanEligibility(Book book, Member member) {
        // 1. 회원 상태 확인
        if (member.getStatus() != MemberStatus.ACTIVE) {
            throw new RuntimeException("대출 불가능한 회원 상태입니다: " + member.getStatus().getDescription());
        }

        // 2. 도서 재고 확인
        if (book.getAvailableCopies() <= 0) {
            throw new RuntimeException("대출 가능한 재고가 없습니다.");
        }

        // 3. 회원의 현재 대출 수 확인
        Long currentLoanCount = loanRepository.countByMemberAndStatus(member, LoanStatus.ACTIVE);
        if (currentLoanCount >= member.getMaxLoanCount()) {
            throw new RuntimeException("대출 한도를 초과했습니다. 현재 대출: " + currentLoanCount + 
                    ", 최대 허용: " + member.getMaxLoanCount());
        }

        // 4. 동일한 도서를 이미 대출했는지 확인
        List<Loan> existingLoans = loanRepository.findByMemberAndStatus(member, LoanStatus.ACTIVE);
        boolean alreadyBorrowed = existingLoans.stream()
                .anyMatch(loan -> loan.getBook().getId().equals(book.getId()));
        
        if (alreadyBorrowed) {
            throw new RuntimeException("이미 대출 중인 도서입니다.");
        }
    }
    
    /**
     * User ID 기반 대출 관련 메서드들
     */
    
    @Transactional(readOnly = true)
    public long getActiveLoansByUserId(Long userId) {
        try {
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다: " + userId));
            Member member = memberService.getMemberByEmail(user.getEmail());
            return loanRepository.countByMemberAndStatus(member, LoanStatus.ACTIVE);
        } catch (Exception e) {
            return 0; // Member가 없으면 0 반환
        }
    }
    
    @Transactional(readOnly = true)
    public long getOverdueLoansByUserId(Long userId) {
        try {
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다: " + userId));
            Member member = memberService.getMemberByEmail(user.getEmail());
            List<Loan> activeLoans = loanRepository.findByMemberAndStatus(member, LoanStatus.ACTIVE);
            return activeLoans.stream()
                .filter(loan -> loan.getDueDate().isBefore(LocalDate.now()))
                .count();
        } catch (Exception e) {
            return 0;
        }
    }
    
    @Transactional(readOnly = true)
    public long getTotalLoansByUserId(Long userId) {
        try {
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다: " + userId));
            Member member = memberService.getMemberByEmail(user.getEmail());
            return loanRepository.findByMemberOrderByLoanDateDesc(member).size();
        } catch (Exception e) {
            return 0;
        }
    }
    
    @Transactional(readOnly = true)
    public List<Loan> getRecentLoansByUserId(Long userId, int limit) {
        try {
            User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다: " + userId));
            Member member = memberService.getMemberByEmail(user.getEmail());
            List<Loan> allLoans = loanRepository.findByMemberOrderByLoanDateDesc(member);
            return allLoans.stream()
                .limit(limit)
                .toList();
        } catch (Exception e) {
            return List.of(); // 빈 리스트 반환
        }
    }

    /**
     * 대출 통계 내부 클래스
     */
    @Data
    @Builder
    public static class LoanStatistics {
        private long totalLoans;      // 전체 대출 수
        private long activeLoans;     // 현재 대출 중
        private long overdueLoans;    // 연체 대출
        private long returnedLoans;   // 반납 완료
    }
}
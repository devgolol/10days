package com.days.book.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.days.book.entity.Book;
import com.days.book.entity.Loan;
import com.days.book.entity.Loan.LoanStatus;
import com.days.book.entity.Member;
import com.days.book.dto.LoanResponseDTO;

@Repository
public interface LoanRepository extends JpaRepository<Loan, Long> {
    
    // 회원의 특정 상태 대출 조회
    List<Loan> findByMemberAndStatus(Member member, LoanStatus status);
    
    // 도서의 특정 상태 대출 조회
    List<Loan> findByBookAndStatus(Book book, LoanStatus status);
    
    // 회원의 모든 대출 이력 조회 (최신순)
    List<Loan> findByMemberOrderByLoanDateDesc(Member member);
    
    // 도서의 모든 대출 이력 조회 (최신순)
    List<Loan> findByBookOrderByLoanDateDesc(Book book);
    
    // 특정 상태의 모든 대출 조회
    List<Loan> findByStatus(LoanStatus status);
    
    // 특정 상태의 대출 건수 조회
    Long countByStatus(LoanStatus status);
    
    // 반납 예정일이 지난 활성 대출 조회 (연체 대상)
    List<Loan> findByDueDateBeforeAndStatus(LocalDate date, LoanStatus status);
    
    // 오늘 반납 예정인 대출 조회
    List<Loan> findByDueDateAndStatus(LocalDate date, LoanStatus status);
    
    // 특정 기간 내 대출 조회
    List<Loan> findByLoanDateBetween(LocalDate startDate, LocalDate endDate);
    
    // 특정 기간 내 반납 조회
    List<Loan> findByReturnDateBetween(LocalDate startDate, LocalDate endDate);
    
    // 회원의 현재 대출 수 조회
    @Query("SELECT COUNT(l) FROM Loan l WHERE l.member = :member AND l.status = :status")
    Long countByMemberAndStatus(@Param("member") Member member, @Param("status") LoanStatus status);
    
    // 도서의 현재 대출 수 조회
    @Query("SELECT COUNT(l) FROM Loan l WHERE l.book = :book AND l.status = :status")
    Long countByBookAndStatus(@Param("book") Book book, @Param("status") LoanStatus status);
    
    // 연체료가 있는 대출 조회
    List<Loan> findByOverdueFeeGreaterThan(Integer fee);
    
    // 회원별 연체료 총액 조회
    @Query("SELECT COALESCE(SUM(l.overdueFee), 0) FROM Loan l WHERE l.member = :member")
    Integer getTotalOverdueFeeByMember(@Param("member") Member member);
    
    // 회원의 대출 기록 존재 여부 확인 (삭제 전 체크용)
    boolean existsByMember(Member member);
    
    // 도서의 대출 기록 존재 여부 확인 (삭제 전 체크용)
    boolean existsByBook(Book book);
    
    // 도서 ID로 대출 기록 존재 여부 확인 (삭제 전 체크용)
    @Query("SELECT CASE WHEN COUNT(l) > 0 THEN true ELSE false END FROM Loan l WHERE l.book.id = :bookId")
    boolean existsByBookId(@Param("bookId") Long bookId);
    
    // 회원의 모든 대출 기록 삭제 (강제 삭제용)
    void deleteByMember(Member member);
    
    // 오늘까지 연체된 대출 자동 조회 (배치용)
    @Query("SELECT l FROM Loan l WHERE l.status = 'ACTIVE' AND l.dueDate < :today")
    List<Loan> findOverdueLoans(@Param("today") LocalDate today);
    
    // 특정 회원의 활성 대출 조회
    @Query("SELECT l FROM Loan l WHERE l.member = :member AND l.status = 'ACTIVE'")
    List<Loan> findActiveLoansByMember(@Param("member") Member member);
    
    // 최근 대출 조회 (대출일 기준 최신순, 삭제된 엔티티도 포함) - Pageable 지원
    @Query("SELECT l FROM Loan l ORDER BY l.loanDate DESC")
    List<Loan> findRecentLoans(Pageable pageable);
    
    // 최근 대출 조회 (JOIN FETCH 버전, Pageable 없음) - DISTINCT 추가
    @Query("SELECT DISTINCT l FROM Loan l LEFT JOIN FETCH l.book LEFT JOIN FETCH l.member ORDER BY l.loanDate DESC")
    List<Loan> findRecentLoansWithDetails();
    
    // 모든 대출 조회 (@EntityGraph 사용 - 더 안정적)
    @EntityGraph(attributePaths = {"book", "member"})
    @Query("SELECT l FROM Loan l ORDER BY l.loanDate DESC, l.createdAt DESC")
    List<Loan> findAllWithBookAndMemberGraph();
    
    // 최신 대출 목록 조회 (날짜 기준 정렬, Pageable 지원)
    @EntityGraph(attributePaths = {"book", "member"})
    @Query("SELECT l FROM Loan l ORDER BY l.loanDate DESC, l.createdAt DESC")
    List<Loan> findRecentLoansOrderByDate(Pageable pageable);
    
    // 백업 방법: 단순 쿼리 (N+1 문제 있지만 확실함)
    @Query("SELECT l FROM Loan l ORDER BY l.id DESC")
    List<Loan> findAllLoansSimple();
    
    // 책 삭제 시 관련 대출 기록의 book_id를 NULL로 설정 (기록 보존하되 참조 해제)
    @Modifying
    @Transactional
    @Query("UPDATE Loan l SET l.book = null WHERE l.book.id = :bookId")
    void updateBookToNullByBookId(@Param("bookId") Long bookId);
    
    // DTO 방식으로 모든 대출 조회 (프록시 문제 해결) - NULL 처리 개선 및 삭제된 엔티티 포함, 최신순 정렬
    @Query("SELECT new com.days.book.dto.LoanResponseDTO(" +
           "l.id, l.loanDate, l.dueDate, l.returnDate, l.status, l.overdueFee, l.notes, l.createdAt, l.updatedAt, " +
           "COALESCE(b.id, 0L), COALESCE(b.title, '삭제된 도서'), COALESCE(b.author, '정보없음'), COALESCE(b.isbn, '정보없음'), COALESCE(b.category, '정보없음'), " +
           "COALESCE(m.id, 0L), COALESCE(m.name, '삭제된 회원'), COALESCE(m.email, '정보없음'), COALESCE(m.memberNumber, '정보없음'), " +
           "0L, false) " +
           "FROM Loan l " +
           "LEFT JOIN l.book b " +
           "LEFT JOIN l.member m " +
           "ORDER BY l.loanDate DESC, l.id DESC")
    List<LoanResponseDTO> findAllLoansAsDTO();
}
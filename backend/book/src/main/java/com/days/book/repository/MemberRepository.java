package com.days.book.repository;

import java.lang.reflect.Member;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.days.book.entity.Member.MemberStatus;

@Repository
public interface MemberRepository extends JpaRepository<Member,Long>{

    Optional<Member> findByMemberNumber(String memberNumber);

    Optional<Member> findByEmail(String email);

    Optional<Member> findByEmailAndStatus(String email, MemberStatus status);

    List<Member> findByNameContaining(String name);

    List<Member> findByStatus(MemberStatus status);

    List<Member> findByStatusNot(MemberStatus status);

    Optional<Member> findByPhone(String phone);

    
    // 키워드로 이름 또는 이메일 검색
    @Query("SELECT m FROM Member m WHERE m.name LIKE %:keyword% OR m.email LIKE %:keyword%")
    List<Member> findByKeyword(@Param("keyword") String keyword);
    
    // 가입일 범위로 회원 조회
    @Query("SELECT m FROM Member m WHERE m.joinDate BETWEEN :startDate AND :endDate")
    List<Member> findByJoinDateBetween(@Param("startDate") LocalDate startDate, 
                                      @Param("endDate") LocalDate endDate);
    
    // 현재 대출 중인 회원 조회
    @Query("SELECT DISTINCT m FROM Member m JOIN Loan l ON m.id = l.member.id " +
           "WHERE l.status = com.days.book.entity.Loan.LoanStatus.ACTIVE")
    List<Member> findMembersWithActiveLoans();
    
    // 연체가 있는 회원 조회
    @Query("SELECT DISTINCT m FROM Member m JOIN Loan l ON m.id = l.member.id " +
           "WHERE l.status = com.days.book.entity.Loan.LoanStatus.OVERDUE")
    List<Member> findMembersWithOverdueLoans();
    
    // 회원번호 중복 확인
    boolean existsByMemberNumber(String memberNumber);
    
    // 이메일 중복 확인
    boolean existsByEmail(String email);
}

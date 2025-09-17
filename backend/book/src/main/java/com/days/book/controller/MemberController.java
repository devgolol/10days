package com.days.book.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.days.book.entity.Member;
import com.days.book.entity.Member.MemberStatus;
import com.days.book.service.MemberService;

import org.springframework.web.bind.annotation.CrossOrigin;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/members")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176", "http://localhost:3000"})
public class MemberController {

    private final MemberService memberService;

    /**
     * 회원 등록 (관리자만)
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Member> createMember(@Valid @RequestBody Member member) {
        try {
            Member savedMember = memberService.createMember(member);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedMember);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * 전체 회원 조회 (관리자만)
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Member>> getAllMembers() {
        List<Member> members = memberService.getAllMembers();
        return ResponseEntity.ok(members);
    }

    /**
     * ID로 회원 조회 (관리자만)
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Member> getMember(@PathVariable Long id) {
        try {
            Member member = memberService.getMember(id);
            return ResponseEntity.ok(member);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * 회원번호로 회원 조회 (관리자만)
     */
    @GetMapping("/member-number/{memberNumber}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Member> getMemberByMemberNumber(@PathVariable String memberNumber) {
        try {
            Member member = memberService.getMemberByMemberNumber(memberNumber);
            return ResponseEntity.ok(member);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * 이메일로 회원 조회
     */
    @GetMapping("/email/{email}")
    public ResponseEntity<Member> getMemberByEmail(@PathVariable String email) {
        try {
            Member member = memberService.getMemberByEmail(email);
            return ResponseEntity.ok(member);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * 회원 정보 수정
     */
    @PutMapping("/{id}")
    public ResponseEntity<Member> updateMember(@PathVariable Long id, @Valid @RequestBody Member member) {
        try {
            member.setId(id);
            Member updatedMember = memberService.updateMember(member);
            return ResponseEntity.ok(updatedMember);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * 회원 삭제 (탈퇴 처리)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMember(@PathVariable Long id) {
        try {
            memberService.deleteMember(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * 키워드로 회원 검색
     */
    @GetMapping("/search")
    public ResponseEntity<List<Member>> searchMembers(@RequestParam String keyword) {
        List<Member> members = memberService.searchMembers(keyword);
        return ResponseEntity.ok(members);
    }

    /**
     * 상태별 회원 조회
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Member>> getMembersByStatus(@PathVariable MemberStatus status) {
        List<Member> members = memberService.getMembersByStatus(status);
        return ResponseEntity.ok(members);
    }

    /**
     * 활성 회원만 조회
     */
    @GetMapping("/active")
    public ResponseEntity<List<Member>> getActiveMembers() {
        List<Member> members = memberService.getActiveMembers();
        return ResponseEntity.ok(members);
    }

    /**
     * 대출 중인 회원 조회
     */
    @GetMapping("/with-active-loans")
    public ResponseEntity<List<Member>> getMembersWithActiveLoans() {
        List<Member> members = memberService.getMembersWithActiveLoans();
        return ResponseEntity.ok(members);
    }

    /**
     * 연체가 있는 회원 조회
     */
    @GetMapping("/with-overdue-loans")
    public ResponseEntity<List<Member>> getMembersWithOverdueLoans() {
        List<Member> members = memberService.getMembersWithOverdueLoans();
        return ResponseEntity.ok(members);
    }

    /**
     * 회원 활성화
     */
    @PutMapping("/{id}/activate")
    public ResponseEntity<Member> activateMember(@PathVariable Long id) {
        try {
            Member member = memberService.activateMember(id);
            return ResponseEntity.ok(member);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * 회원 정지
     */
    @PutMapping("/{id}/suspend")
    public ResponseEntity<Member> suspendMember(@PathVariable Long id) {
        try {
            Member member = memberService.suspendMember(id);
            return ResponseEntity.ok(member);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * 회원 탈퇴
     */
    @PutMapping("/{id}/withdraw")
    public ResponseEntity<Member> withdrawMember(@PathVariable Long id) {
        try {
            Member member = memberService.withdrawMember(id);
            return ResponseEntity.ok(member);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * 기간별 신규 가입 회원 조회
     */
    @GetMapping("/new")
    public ResponseEntity<List<Member>> getNewMembersByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<Member> members = memberService.getNewMembersByDateRange(startDate, endDate);
        return ResponseEntity.ok(members);
    }

    /**
     * 회원 대출 가능 여부 확인
     */
    @GetMapping("/{id}/can-loan")
    public ResponseEntity<Boolean> canMemberLoan(@PathVariable Long id) {
        try {
            boolean canLoan = memberService.canMemberLoan(id);
            return ResponseEntity.ok(canLoan);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * 이메일 중복 확인
     */
    @GetMapping("/check-email")
    public ResponseEntity<Boolean> checkEmailExists(@RequestParam String email) {
        boolean exists = memberService.isEmailExists(email);
        return ResponseEntity.ok(exists);
    }

    /**
     * 회원번호 중복 확인
     */
    @GetMapping("/check-member-number")
    public ResponseEntity<Boolean> checkMemberNumberExists(@RequestParam String memberNumber) {
        boolean exists = memberService.isMemberNumberExists(memberNumber);
        return ResponseEntity.ok(exists);
    }

    /**
     * 전체 회원 수 조회
     */
    @GetMapping("/count")
    public ResponseEntity<Long> getTotalMemberCount() {
        long count = memberService.getTotalMemberCount();
        return ResponseEntity.ok(count);
    }

    /**
     * 활성 회원 수 조회
     */
    @GetMapping("/count/active")
    public ResponseEntity<Long> getActiveMemberCount() {
        long count = memberService.getActiveMemberCount();
        return ResponseEntity.ok(count);
    }
}
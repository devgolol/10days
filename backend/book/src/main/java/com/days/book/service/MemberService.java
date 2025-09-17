package com.days.book.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.days.book.entity.Member;
import com.days.book.entity.Member.MemberStatus;
import com.days.book.repository.MemberRepository;
import com.days.book.repository.LoanRepository;
import com.days.book.repository.UserRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class MemberService {

    private final MemberRepository memberRepository;
    private final LoanRepository loanRepository;
    private final UserRepository userRepository;

    /**
     * 회원 등록
     */
    public Member createMember(Member member) {
        // 이메일 중복 확인
        if (memberRepository.existsByEmail(member.getEmail())) {
            throw new RuntimeException("이미 등록된 이메일입니다: " + member.getEmail());
        }

        // 회원번호 자동 생성 (중복 방지)
        String memberNumber;
        do {
            memberNumber = Member.generateMemberNumber();
        } while (memberRepository.existsByMemberNumber(memberNumber));
        
        member.setMemberNumber(memberNumber);
        
        // 기본값 설정
        if (member.getJoinDate() == null) {
            member.setJoinDate(LocalDate.now());
        }
        if (member.getStatus() == null) {
            member.setStatus(MemberStatus.ACTIVE);
        }
        if (member.getMaxLoanCount() == null) {
            member.setMaxLoanCount(5);
        }

        return memberRepository.save(member);
    }

    /**
     * ID로 회원 조회
     */
    @Transactional(readOnly = true)
    public Member getMember(Long id) {
        return memberRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("회원을 찾을 수 없습니다. ID: " + id));
    }

    /**
     * 회원번호로 회원 조회
     */
    @Transactional(readOnly = true)
    public Member getMemberByMemberNumber(String memberNumber) {
        return memberRepository.findByMemberNumber(memberNumber)
                .orElseThrow(() -> new EntityNotFoundException("회원을 찾을 수 없습니다. 회원번호: " + memberNumber));
    }

    /**
     * 이메일로 회원 조회
     */
    @Transactional(readOnly = true)
    public Member getMemberByEmail(String email) {
        return memberRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("회원을 찾을 수 없습니다. 이메일: " + email));
    }

    /**
     * 회원 정보 수정
     */
    public Member updateMember(Member member) {
        Member existingMember = getMember(member.getId());
        
        // 이메일 변경 시 중복 확인
        if (!existingMember.getEmail().equals(member.getEmail())) {
            if (memberRepository.existsByEmail(member.getEmail())) {
                throw new RuntimeException("이미 등록된 이메일입니다: " + member.getEmail());
            }
        }

        // 수정 가능한 필드들 업데이트
        existingMember.setName(member.getName());
        existingMember.setEmail(member.getEmail());
        existingMember.setPhone(member.getPhone());
        existingMember.setAddress(member.getAddress());
        existingMember.setMaxLoanCount(member.getMaxLoanCount());

        return memberRepository.save(existingMember);
    }

    /**
     * 회원 삭제 (실제 DB에서 삭제 - User도 함께 삭제)
     */
    public void deleteMember(Long id) {
        Member member = getMember(id);
        
        // 대출 기록이 있는지 확인
        if (loanRepository.existsByMember(member)) {
            throw new RuntimeException("대출 기록이 있는 회원은 삭제할 수 없습니다. 먼저 모든 대출을 처리해주세요.");
        }
        
        try {
            // 해당 이메일로 등록된 User 계정도 함께 삭제
            userRepository.findByEmail(member.getEmail()).ifPresent(user -> {
                userRepository.delete(user);
            });
            
            // Member 삭제
            memberRepository.delete(member);
            
        } catch (Exception e) {
            // 예외 발생 시 로그 출력 및 다시 시도
            System.out.println("회원 삭제 중 오류 발생: " + e.getMessage());
            
            // User를 username으로도 시도
            try {
                userRepository.findByUsername(member.getName()).ifPresent(user -> {
                    userRepository.delete(user);
                });
            } catch (Exception ex) {
                System.out.println("Username으로 User 삭제 시도 실패: " + ex.getMessage());
            }
            
            // Member 삭제는 재시도
            memberRepository.delete(member);
            throw new RuntimeException("회원 삭제가 완료되었지만 일부 오류가 발생했습니다: " + e.getMessage());
        }
    }

    /**
     * 회원 강제 삭제 (대출 기록과 함께 삭제 - User도 함께 삭제)
     */
    public void forceDeleteMember(Long id) {
        Member member = getMember(id);
        
        // 대출 기록이 있으면 먼저 삭제
        if (loanRepository.existsByMember(member)) {
            loanRepository.deleteByMember(member);
        }
        
        // 해당 이메일로 등록된 User 계정도 함께 삭제
        userRepository.findByEmail(member.getEmail()).ifPresent(user -> {
            userRepository.delete(user);
        });
        
        // Member 삭제
        memberRepository.delete(member);
    }

    /**
     * 회원 활성화
     */
    public Member activateMember(Long id) {
        Member member = getMember(id);
        member.activate();
        return memberRepository.save(member);
    }

    /**
     * 회원 정지
     */
    public Member suspendMember(Long id) {
        Member member = getMember(id);
        member.suspend();
        return memberRepository.save(member);
    }

    /**
     * 회원 탈퇴
     */
    public Member withdrawMember(Long id) {
        Member member = getMember(id);
        member.withdraw();
        return memberRepository.save(member);
    }

    /**
     * 키워드로 회원 검색
     */
    @Transactional(readOnly = true)
    public List<Member> searchMembers(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllMembers();
        }
        return memberRepository.findByKeyword(keyword.trim());
    }

    /**
     * 전체 회원 조회
     */
    @Transactional(readOnly = true)
    public List<Member> getAllMembers() {
        return memberRepository.findAll();
    }

    /**
     * 상태별 회원 조회
     */
    @Transactional(readOnly = true)
    public List<Member> getMembersByStatus(MemberStatus status) {
        return memberRepository.findByStatus(status);
    }

    /**
     * 활성 회원만 조회
     */
    @Transactional(readOnly = true)
    public List<Member> getActiveMembers() {
        return memberRepository.findByStatus(MemberStatus.ACTIVE);
    }

    /**
     * 대출 중인 회원 조회
     */
    @Transactional(readOnly = true)
    public List<Member> getMembersWithActiveLoans() {
        return memberRepository.findMembersWithActiveLoans();
    }

    /**
     * 연체가 있는 회원 조회
     */
    @Transactional(readOnly = true)
    public List<Member> getMembersWithOverdueLoans() {
        return memberRepository.findMembersWithOverdueLoans();
    }

    /**
     * 기간별 신규 가입 회원 조회
     */
    @Transactional(readOnly = true)
    public List<Member> getNewMembersByDateRange(LocalDate startDate, LocalDate endDate) {
        return memberRepository.findByJoinDateBetween(startDate, endDate);
    }

    /**
     * 회원 대출 가능 여부 확인
     */
    @Transactional(readOnly = true)
    public boolean canMemberLoan(Long id) {
        Member member = getMember(id);
        return member.canLoan();
    }

    /**
     * 이메일 중복 확인
     */
    @Transactional(readOnly = true)
    public boolean isEmailExists(String email) {
        return memberRepository.existsByEmail(email);
    }

    /**
     * 회원번호 중복 확인
     */
    @Transactional(readOnly = true)
    public boolean isMemberNumberExists(String memberNumber) {
        return memberRepository.existsByMemberNumber(memberNumber);
    }

    /**
     * 회원 통계 - 전체 회원 수
     */
    @Transactional(readOnly = true)
    public long getTotalMemberCount() {
        return memberRepository.count();
    }

    /**
     * DashboardController용 메서드
     */
    @Transactional(readOnly = true)
    public long getTotalMembersCount() {
        return memberRepository.count();
    }

    /**
     * 회원 통계 - 활성 회원 수
     */
    @Transactional(readOnly = true)
    public long getActiveMemberCount() {
        return memberRepository.findByStatus(MemberStatus.ACTIVE).size();
    }
}
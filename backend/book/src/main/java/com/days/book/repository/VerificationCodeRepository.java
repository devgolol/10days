package com.days.book.repository;

import com.days.book.entity.VerificationCode;
import com.days.book.entity.VerificationCode.VerificationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface VerificationCodeRepository extends JpaRepository<VerificationCode, Long> {
    
    /**
     * 이메일, 코드, 타입으로 유효한 인증코드 찾기
     */
    @Query("SELECT vc FROM VerificationCode vc WHERE vc.email = :email " +
           "AND vc.code = :code AND vc.type = :type " +
           "AND vc.used = false AND vc.expiresAt > :now")
    Optional<VerificationCode> findValidCode(
        @Param("email") String email,
        @Param("code") String code,
        @Param("type") VerificationType type,
        @Param("now") LocalDateTime now
    );
    
    /**
     * 이메일과 타입으로 가장 최근의 유효한 코드 찾기
     */
    @Query("SELECT vc FROM VerificationCode vc WHERE vc.email = :email " +
           "AND vc.type = :type AND vc.used = false " +
           "AND vc.expiresAt > :now ORDER BY vc.createdAt DESC")
    Optional<VerificationCode> findLatestValidCode(
        @Param("email") String email,
        @Param("type") VerificationType type,
        @Param("now") LocalDateTime now
    );
    
    /**
     * 만료된 인증코드 삭제
     */
    void deleteByExpiresAtBefore(LocalDateTime dateTime);
}

package fu.se.lms_group6.repository;

import fu.se.lms_group6.entity.Registration;
import jakarta.persistence.LockModeType;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RegistrationRepository extends JpaRepository<Registration, Long>, JpaSpecificationExecutor<Registration> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    List<Registration> findByStudentUserIdAndCourseCourseIdOrderByRegisteredAtDesc(Long studentId, Long courseId);

    Optional<Registration> findByRegistrationIdAndStudentUserId(Long registrationId, Long studentId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select r from Registration r where r.paymentCode = :code")
    Optional<Registration> findByPaymentCodeForUpdate(@Param("code") String code);

    @Query("select r.student.userId from Registration r where r.paymentCode = :code")
    Optional<Long> findStudentIdByPaymentCode(@Param("code") String code);

    Optional<Registration> findFirstByStudentUserIdAndCourseCourseIdAndStatus(
            Long studentId, Long courseId, fu.se.lms_group6.entity.enums.RegistrationStatus status);

    boolean existsByTransactionRef(String transactionRef);

    Optional<Registration> findFirstByStudentUserIdAndCourseCourseIdAndStatusAndExpiresAtAfterOrderByRegistrationIdDesc(
            Long studentId, Long courseId, fu.se.lms_group6.entity.enums.RegistrationStatus status, LocalDateTime now);

    @Modifying(clearAutomatically = true)
    @Query("update Registration r set r.status = fu.se.lms_group6.entity.enums.RegistrationStatus.EXPIRED where r.status = fu.se.lms_group6.entity.enums.RegistrationStatus.PENDING and r.expiresAt <= :now")
    int expirePending(@Param("now") LocalDateTime now);
}

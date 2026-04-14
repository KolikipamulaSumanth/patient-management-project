package com.pm.patientservice.repository;

import com.pm.patientservice.model.Appointment;
import com.pm.patientservice.model.AppointmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for {@link Appointment} entities.  
 * Provides convenience methods for conflict detection and querying appointments for a given doctor or patient.
 */
@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {

    /**
     * Find appointments for a doctor that conflict with a proposed time range.  
     * An appointment conflicts if its start is before the new end and its end is after the new start.
     *
     * @param doctorId the doctor to check for existing appointments
     * @param start proposed appointment start time
     * @param end proposed appointment end time
     * @return a list of conflicting appointments
     */
    @Query("SELECT a FROM Appointment a WHERE a.doctor.id = :doctorId AND a.status <> :cancelledStatus AND a.startDateTime < :end AND a.endDateTime > :start")
    List<Appointment> findConflictingAppointments(@Param("doctorId") UUID doctorId,
                                                  @Param("cancelledStatus") AppointmentStatus cancelledStatus,
                                                  @Param("start") LocalDateTime start,
                                                  @Param("end") LocalDateTime end);

    @Query("SELECT a FROM Appointment a WHERE a.doctor.id = :doctorId AND a.id <> :appointmentId AND a.status <> :cancelledStatus AND a.startDateTime < :end AND a.endDateTime > :start")
    List<Appointment> findConflictingAppointmentsExcludingAppointment(@Param("doctorId") UUID doctorId,
                                                                      @Param("appointmentId") UUID appointmentId,
                                                                      @Param("cancelledStatus") AppointmentStatus cancelledStatus,
                                                                      @Param("start") LocalDateTime start,
                                                                      @Param("end") LocalDateTime end);

    /**
     * Returns a paged list of appointments for a patient.
     */
    Page<Appointment> findByPatientId(UUID patientId, Pageable pageable);

    /**
     * Returns a paged list of appointments for a doctor.
     */
    Page<Appointment> findByDoctorId(UUID doctorId, Pageable pageable);

    Optional<Appointment> findByIdAndPatientId(UUID id, UUID patientId);

    Optional<Appointment> findByIdAndDoctorId(UUID id, UUID doctorId);

    boolean existsByDoctorId(UUID doctorId);

    List<Appointment> findByDoctorHospitalIdAndStartDateTimeBetweenOrderByStartDateTimeAsc(UUID hospitalId,
                                                                                            LocalDateTime from,
                                                                                            LocalDateTime to);

    boolean existsByDoctorHospitalId(UUID hospitalId);
}

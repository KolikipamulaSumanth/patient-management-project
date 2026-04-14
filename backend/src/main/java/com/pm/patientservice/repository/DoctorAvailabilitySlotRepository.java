package com.pm.patientservice.repository;

import com.pm.patientservice.model.DoctorAvailabilitySlot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface DoctorAvailabilitySlotRepository extends JpaRepository<DoctorAvailabilitySlot, UUID> {
    List<DoctorAvailabilitySlot> findByDoctorIdOrderByDayOfWeekAscStartTimeAsc(UUID doctorId);
}

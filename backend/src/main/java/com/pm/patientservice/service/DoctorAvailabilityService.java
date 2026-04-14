package com.pm.patientservice.service;

import com.pm.patientservice.dto.AvailabilitySlotRequestDTO;
import com.pm.patientservice.dto.AvailabilitySlotResponseDTO;
import com.pm.patientservice.model.DoctorAvailabilitySlot;
import com.pm.patientservice.model.Role;
import com.pm.patientservice.model.User;
import com.pm.patientservice.repository.DoctorAvailabilitySlotRepository;
import com.pm.patientservice.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class DoctorAvailabilityService {

    private final DoctorAvailabilitySlotRepository slotRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    public DoctorAvailabilityService(DoctorAvailabilitySlotRepository slotRepository,
                                     UserRepository userRepository,
                                     UserService userService) {
        this.slotRepository = slotRepository;
        this.userRepository = userRepository;
        this.userService = userService;
    }

    public List<AvailabilitySlotResponseDTO> getDoctorAvailability(UUID doctorId) {
        return slotRepository.findByDoctorIdOrderByDayOfWeekAscStartTimeAsc(doctorId).stream()
                .map(DoctorAvailabilityService::toDTO)
                .toList();
    }

    @Transactional
    public AvailabilitySlotResponseDTO addAvailability(UUID doctorId, AvailabilitySlotRequestDTO request, String actorEmail) {
        User doctor = getDoctor(doctorId);
        ensureCanManageAvailability(doctor, actorEmail);
        validateSlot(request);
        DoctorAvailabilitySlot slot = new DoctorAvailabilitySlot();
        slot.setDoctor(doctor);
        slot.setDayOfWeek(request.getDayOfWeek());
        slot.setStartTime(request.getStartTime());
        slot.setEndTime(request.getEndTime());
        return toDTO(slotRepository.save(slot));
    }

    @Transactional
    public AvailabilitySlotResponseDTO updateAvailability(UUID doctorId, UUID slotId, AvailabilitySlotRequestDTO request, String actorEmail) {
        User doctor = getDoctor(doctorId);
        ensureCanManageAvailability(doctor, actorEmail);
        validateSlot(request);
        DoctorAvailabilitySlot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new IllegalArgumentException("Availability slot not found"));
        if (!slot.getDoctor().getId().equals(doctorId)) {
            throw new IllegalArgumentException("Availability slot does not belong to this doctor");
        }
        slot.setDayOfWeek(request.getDayOfWeek());
        slot.setStartTime(request.getStartTime());
        slot.setEndTime(request.getEndTime());
        return toDTO(slotRepository.save(slot));
    }

    @Transactional
    public void deleteAvailability(UUID doctorId, UUID slotId, String actorEmail) {
        User doctor = getDoctor(doctorId);
        ensureCanManageAvailability(doctor, actorEmail);
        DoctorAvailabilitySlot slot = slotRepository.findById(slotId)
                .orElseThrow(() -> new IllegalArgumentException("Availability slot not found"));
        if (!slot.getDoctor().getId().equals(doctorId)) {
            throw new IllegalArgumentException("Availability slot does not belong to this doctor");
        }
        slotRepository.delete(slot);
    }

    public boolean doctorHasAvailabilityFor(User doctor, java.time.LocalDateTime start, java.time.LocalDateTime end) {
        return slotRepository.findByDoctorIdOrderByDayOfWeekAscStartTimeAsc(doctor.getId()).stream()
                .anyMatch(slot -> slot.getDayOfWeek().equals(start.getDayOfWeek())
                        && !start.toLocalTime().isBefore(slot.getStartTime())
                        && !end.toLocalTime().isAfter(slot.getEndTime()));
    }

    public static AvailabilitySlotResponseDTO toDTO(DoctorAvailabilitySlot slot) {
        AvailabilitySlotResponseDTO dto = new AvailabilitySlotResponseDTO();
        dto.setId(slot.getId());
        dto.setDayOfWeek(slot.getDayOfWeek());
        dto.setStartTime(slot.getStartTime());
        dto.setEndTime(slot.getEndTime());
        return dto;
    }

    private User getDoctor(UUID doctorId) {
        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new IllegalArgumentException("Doctor not found"));
        if (!doctor.getRoles().contains(Role.ROLE_DOCTOR)) {
            throw new IllegalArgumentException("Selected user is not a doctor");
        }
        return doctor;
    }

    private void ensureCanManageAvailability(User doctor, String actorEmail) {
        User actor = userService.getCurrentUser(actorEmail);
        if (actor.getRoles().contains(Role.ROLE_DOCTOR) && actor.getId().equals(doctor.getId())) {
            return;
        }
        userService.ensureAdminPrivileges(actor);
        if (userService.isPlatformAdmin(actor)) {
            return;
        }
        if (userService.isHospitalAdmin(actor)) {
            UUID actorHospitalId = actor.getHospital() != null ? actor.getHospital().getId() : null;
            UUID doctorHospitalId = doctor.getHospital() != null ? doctor.getHospital().getId() : null;
            if (actorHospitalId == null || !actorHospitalId.equals(doctorHospitalId)) {
                throw new IllegalArgumentException("You can only manage availability for doctors in your own hospital");
            }
        }
    }

    private void validateSlot(AvailabilitySlotRequestDTO request) {
        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new IllegalArgumentException("Availability end time must be after start time");
        }
    }
}

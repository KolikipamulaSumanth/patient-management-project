package com.pm.patientservice.controller;

import com.pm.patientservice.dto.AppointmentCancelRequestDTO;
import com.pm.patientservice.dto.AppointmentRequestDTO;
import com.pm.patientservice.dto.AppointmentRescheduleRequestDTO;
import com.pm.patientservice.dto.AppointmentResponseDTO;
import com.pm.patientservice.dto.AppointmentStatusUpdateRequestDTO;
import com.pm.patientservice.model.Appointment;
import com.pm.patientservice.model.Role;
import com.pm.patientservice.model.User;
import com.pm.patientservice.repository.UserRepository;
import com.pm.patientservice.service.AppointmentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Endpoints for creating and retrieving appointments.
 */
@RestController
@RequestMapping("/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;
    private final UserRepository userRepository;

    @Autowired
    public AppointmentController(AppointmentService appointmentService, UserRepository userRepository) {
        this.appointmentService = appointmentService;
        this.userRepository = userRepository;
    }

    /**
     * Allows a patient to schedule an appointment with a doctor.  
     * The authenticated user's email is used to determine the patient entity.
     */
    @PostMapping
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<AppointmentResponseDTO> createAppointment(
            @Valid @RequestBody AppointmentRequestDTO request,
            Authentication authentication) {
        String email = authentication.getName();
        User patient = userRepository.findByEmail(email).orElseThrow();
        Appointment appointment = appointmentService.scheduleAppointment(patient, request);
        AppointmentResponseDTO dto = AppointmentService.toDTO(appointment);
        return ResponseEntity.ok(dto);
    }

    /**
     * Retrieves the authenticated patient's own appointments with pagination.
     */
    @GetMapping("/my")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<List<AppointmentResponseDTO>> getMyAppointments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        String email = authentication.getName();
        User patient = userRepository.findByEmail(email).orElseThrow();
        Page<Appointment> appts = appointmentService.getAppointmentsForPatient(patient.getId(), page, size);
        List<AppointmentResponseDTO> dtos = appts.getContent().stream()
                .map(AppointmentService::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    /**
     * Retrieves appointments for the authenticated doctor or administrator.  
     * Doctors can only view their own appointments; administrators may specify a doctorId
     * parameter to view a particular doctor's schedule.  
     *
     * @param doctorId optional doctor ID (admin only)
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('DOCTOR','ADMIN','PLATFORM_ADMIN')")
    public ResponseEntity<List<AppointmentResponseDTO>> getAppointmentsForDoctor(
            @RequestParam(required = false) UUID doctorId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        UUID targetDoctorId;
        boolean isAdmin = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(r -> r.equals(Role.ROLE_ADMIN.name()) || r.equals(Role.ROLE_PLATFORM_ADMIN.name()));
        if (isAdmin) {
            // admin can choose any doctor; if none provided, return 400
            if (doctorId == null) {
                return ResponseEntity.badRequest().build();
            }
            if (authentication.getAuthorities().stream().noneMatch(a -> a.getAuthority().equals(Role.ROLE_PLATFORM_ADMIN.name()))) {
                User admin = userRepository.findByEmail(authentication.getName()).orElseThrow();
                User doctor = userRepository.findById(doctorId)
                        .orElseThrow(() -> new IllegalArgumentException("Doctor not found"));
                UUID adminHospitalId = admin.getHospital() != null ? admin.getHospital().getId() : null;
                UUID doctorHospitalId = doctor.getHospital() != null ? doctor.getHospital().getId() : null;
                if (adminHospitalId == null || !adminHospitalId.equals(doctorHospitalId)) {
                    throw new IllegalArgumentException("You can only view appointments for doctors in your own hospital");
                }
            }
            targetDoctorId = doctorId;
        } else {
            // doctor can only view own appointments
            String email = authentication.getName();
            User doctor = userRepository.findByEmail(email).orElseThrow();
            targetDoctorId = doctor.getId();
        }
        Page<Appointment> appts = appointmentService.getAppointmentsForDoctor(targetDoctorId, page, size);
        List<AppointmentResponseDTO> dtos = appts.getContent().stream()
                .map(AppointmentService::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/{appointmentId}/cancel")
    @PreAuthorize("hasAnyRole('PATIENT','DOCTOR','ADMIN','PLATFORM_ADMIN')")
    public ResponseEntity<AppointmentResponseDTO> cancelAppointment(@PathVariable UUID appointmentId,
                                                                    @RequestBody(required = false) AppointmentCancelRequestDTO request,
                                                                    Authentication authentication) {
        User actor = userRepository.findByEmail(authentication.getName()).orElseThrow();
        Appointment appointment = appointmentService.cancelAppointment(
                appointmentId,
                actor,
                request != null ? request.getNote() : null
        );
        return ResponseEntity.ok(AppointmentService.toDTO(appointment));
    }

    @PutMapping("/{appointmentId}/reschedule")
    @PreAuthorize("hasAnyRole('PATIENT','DOCTOR','ADMIN','PLATFORM_ADMIN')")
    public ResponseEntity<AppointmentResponseDTO> rescheduleAppointment(@PathVariable UUID appointmentId,
                                                                        @Valid @RequestBody AppointmentRescheduleRequestDTO request,
                                                                        Authentication authentication) {
        User actor = userRepository.findByEmail(authentication.getName()).orElseThrow();
        Appointment appointment = appointmentService.rescheduleAppointment(appointmentId, actor, request);
        return ResponseEntity.ok(AppointmentService.toDTO(appointment));
    }

    @PostMapping("/{appointmentId}/status")
    @PreAuthorize("hasAnyRole('DOCTOR','ADMIN','PLATFORM_ADMIN')")
    public ResponseEntity<AppointmentResponseDTO> updateAppointmentStatus(@PathVariable UUID appointmentId,
                                                                          @Valid @RequestBody AppointmentStatusUpdateRequestDTO request,
                                                                          Authentication authentication) {
        User actor = userRepository.findByEmail(authentication.getName()).orElseThrow();
        Appointment appointment = appointmentService.updateAppointmentStatus(appointmentId, actor, request);
        return ResponseEntity.ok(AppointmentService.toDTO(appointment));
    }
}

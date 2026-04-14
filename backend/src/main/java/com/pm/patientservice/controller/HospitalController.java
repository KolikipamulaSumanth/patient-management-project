package com.pm.patientservice.controller;

import com.pm.patientservice.dto.AdminCreateRequestDTO;
import com.pm.patientservice.dto.HospitalRequestDTO;
import com.pm.patientservice.dto.HospitalResponseDTO;
import com.pm.patientservice.dto.HospitalAdminUpdateRequestDTO;
import com.pm.patientservice.dto.AppointmentResponseDTO;
import com.pm.patientservice.dto.UserResponseDTO;
import com.pm.patientservice.service.AppointmentService;
import com.pm.patientservice.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/hospitals")
public class HospitalController {

    private final UserService userService;
    private final AppointmentService appointmentService;

    public HospitalController(UserService userService, AppointmentService appointmentService) {
        this.userService = userService;
        this.appointmentService = appointmentService;
    }

    @GetMapping
    public ResponseEntity<List<HospitalResponseDTO>> getHospitals() {
        return ResponseEntity.ok(userService.getHospitals());
    }

    @PostMapping
    @PreAuthorize("hasRole('PLATFORM_ADMIN')")
    public ResponseEntity<HospitalResponseDTO> createHospital(@Valid @RequestBody HospitalRequestDTO request) {
        return ResponseEntity.ok(UserService.toHospitalDTO(userService.createHospital(request)));
    }

    @PutMapping("/{hospitalId}")
    @PreAuthorize("hasRole('PLATFORM_ADMIN')")
    public ResponseEntity<HospitalResponseDTO> updateHospital(@PathVariable UUID hospitalId,
                                                              @Valid @RequestBody HospitalRequestDTO request) {
        return ResponseEntity.ok(UserService.toHospitalDTO(userService.updateHospital(hospitalId, request)));
    }

    @PostMapping("/{hospitalId}/delete")
    @PreAuthorize("hasRole('PLATFORM_ADMIN')")
    public ResponseEntity<Void> deleteHospital(@PathVariable UUID hospitalId) {
        userService.deleteHospital(hospitalId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{hospitalId}/admins")
    @PreAuthorize("hasRole('PLATFORM_ADMIN')")
    public ResponseEntity<UserResponseDTO> createHospitalAdmin(@PathVariable UUID hospitalId,
                                                               @Valid @RequestBody AdminCreateRequestDTO request) {
        return ResponseEntity.ok(UserService.toDTO(userService.createHospitalAdmin(hospitalId, request)));
    }

    @GetMapping("/{hospitalId}/admins")
    @PreAuthorize("hasRole('PLATFORM_ADMIN')")
    public ResponseEntity<List<UserResponseDTO>> getHospitalAdmins(@PathVariable UUID hospitalId) {
        return ResponseEntity.ok(userService.getHospitalAdmins(hospitalId));
    }

    @PutMapping("/{hospitalId}/admins/{adminId}")
    @PreAuthorize("hasRole('PLATFORM_ADMIN')")
    public ResponseEntity<UserResponseDTO> updateHospitalAdmin(@PathVariable UUID hospitalId,
                                                               @PathVariable UUID adminId,
                                                               @Valid @RequestBody HospitalAdminUpdateRequestDTO request) {
        return ResponseEntity.ok(UserService.toDTO(userService.updateHospitalAdmin(hospitalId, adminId, request)));
    }

    @PostMapping("/{hospitalId}/admins/{adminId}/delete")
    @PreAuthorize("hasRole('PLATFORM_ADMIN')")
    public ResponseEntity<Void> deleteHospitalAdmin(@PathVariable UUID hospitalId,
                                                    @PathVariable UUID adminId) {
        userService.deleteHospitalAdmin(hospitalId, adminId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{hospitalId}/calendar")
    @PreAuthorize("hasAnyRole('PLATFORM_ADMIN','ADMIN','DOCTOR')")
    public ResponseEntity<List<AppointmentResponseDTO>> getHospitalCalendar(@PathVariable UUID hospitalId,
                                                                            @RequestParam LocalDate from,
                                                                            @RequestParam LocalDate to,
                                                                            org.springframework.security.core.Authentication authentication) {
        userService.ensureCanAccessHospitalCalendar(userService.getCurrentUser(authentication.getName()), hospitalId);
        return ResponseEntity.ok(appointmentService.getAppointmentsForHospital(hospitalId, from, to));
    }
}

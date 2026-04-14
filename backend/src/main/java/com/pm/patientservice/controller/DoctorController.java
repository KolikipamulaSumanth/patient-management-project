package com.pm.patientservice.controller;

import com.pm.patientservice.dto.AvailabilitySlotRequestDTO;
import com.pm.patientservice.dto.AvailabilitySlotResponseDTO;
import com.pm.patientservice.dto.DoctorRequestDTO;
import com.pm.patientservice.dto.UserResponseDTO;
import com.pm.patientservice.service.DoctorAvailabilityService;
import com.pm.patientservice.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/doctors")
public class DoctorController {

    private final UserService userService;
    private final DoctorAvailabilityService doctorAvailabilityService;

    public DoctorController(UserService userService, DoctorAvailabilityService doctorAvailabilityService) {
        this.userService = userService;
        this.doctorAvailabilityService = doctorAvailabilityService;
    }

    @GetMapping
    public ResponseEntity<List<UserResponseDTO>> getDoctors() {
        return ResponseEntity.ok(userService.getDoctors());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDTO> getDoctor(@PathVariable UUID id) {
        return userService.getDoctor(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/availability")
    public ResponseEntity<List<AvailabilitySlotResponseDTO>> getDoctorAvailability(@PathVariable UUID id) {
        return ResponseEntity.ok(doctorAvailabilityService.getDoctorAvailability(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','PLATFORM_ADMIN')")
    public ResponseEntity<UserResponseDTO> createDoctor(@Valid @RequestBody DoctorRequestDTO request,
                                                        Authentication authentication) {
        return ResponseEntity.ok(UserService.toDTO(userService.createDoctor(request, authentication.getName())));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PLATFORM_ADMIN')")
    public ResponseEntity<UserResponseDTO> updateDoctor(@PathVariable UUID id,
                                                        @Valid @RequestBody DoctorRequestDTO request,
                                                        Authentication authentication) {
        return ResponseEntity.ok(UserService.toDTO(userService.updateDoctor(id, request, authentication.getName())));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','PLATFORM_ADMIN')")
    public ResponseEntity<Void> deleteDoctor(@PathVariable UUID id, Authentication authentication) {
        userService.deleteDoctor(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/delete")
    @PreAuthorize("hasAnyRole('ADMIN','PLATFORM_ADMIN')")
    public ResponseEntity<Void> deleteDoctorViaPost(@PathVariable UUID id, Authentication authentication) {
        userService.deleteDoctor(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/availability")
    @PreAuthorize("hasAnyRole('ADMIN','PLATFORM_ADMIN','DOCTOR')")
    public ResponseEntity<AvailabilitySlotResponseDTO> addAvailability(@PathVariable UUID id,
                                                                       @Valid @RequestBody AvailabilitySlotRequestDTO request,
                                                                       Authentication authentication) {
        return ResponseEntity.ok(doctorAvailabilityService.addAvailability(id, request, authentication.getName()));
    }

    @PutMapping("/{id}/availability/{slotId}")
    @PreAuthorize("hasAnyRole('ADMIN','PLATFORM_ADMIN','DOCTOR')")
    public ResponseEntity<AvailabilitySlotResponseDTO> updateAvailability(@PathVariable UUID id,
                                                                          @PathVariable UUID slotId,
                                                                          @Valid @RequestBody AvailabilitySlotRequestDTO request,
                                                                          Authentication authentication) {
        return ResponseEntity.ok(doctorAvailabilityService.updateAvailability(id, slotId, request, authentication.getName()));
    }

    @PostMapping("/{id}/availability/{slotId}/delete")
    @PreAuthorize("hasAnyRole('ADMIN','PLATFORM_ADMIN','DOCTOR')")
    public ResponseEntity<Void> deleteAvailability(@PathVariable UUID id,
                                                   @PathVariable UUID slotId,
                                                   Authentication authentication) {
        doctorAvailabilityService.deleteAvailability(id, slotId, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}

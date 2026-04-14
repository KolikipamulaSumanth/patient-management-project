package com.pm.patientservice.service;

import com.pm.patientservice.dto.AppointmentRequestDTO;
import com.pm.patientservice.model.Appointment;
import com.pm.patientservice.model.AppointmentStatus;
import com.pm.patientservice.model.Role;
import com.pm.patientservice.model.User;
import com.pm.patientservice.repository.AppointmentRepository;
import com.pm.patientservice.repository.UserRepository;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for {@link AppointmentService}.
 */
@ExtendWith(MockitoExtension.class)
public class AppointmentServiceTest {

    @Mock
    private AppointmentRepository appointmentRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private NotificationService notificationService;

    @Mock
    private DoctorAvailabilityService doctorAvailabilityService;

    @InjectMocks
    private AppointmentService appointmentService;

    private User patient;
    private User doctor;

    @BeforeEach
    void setUp() {
        patient = new User();
        patient.setId(UUID.randomUUID());
        patient.setEmail("patient@example.com");
        patient.setRoles(Set.of(Role.ROLE_PATIENT));

        doctor = new User();
        doctor.setId(UUID.randomUUID());
        doctor.setEmail("doctor@example.com");
        doctor.setRoles(Set.of(Role.ROLE_DOCTOR));
    }

    @Test
    void scheduleAppointment_conflictThrows() {
        // Prepare request
        AppointmentRequestDTO dto = new AppointmentRequestDTO();
        dto.setDoctorId(doctor.getId());
        dto.setStart(LocalDateTime.now().plusDays(1));
        dto.setEnd(dto.getStart().plusHours(1));
        dto.setReason("Check-up");

        // doctor exists
        when(userRepository.findById(doctor.getId())).thenReturn(Optional.of(doctor));
        when(doctorAvailabilityService.doctorHasAvailabilityFor(any(), any(), any())).thenReturn(true);
        // conflict exists
        when(appointmentRepository.findConflictingAppointments(any(), any(), any(), any()))
                .thenReturn(List.of(new Appointment()));

        Assertions.assertThrows(IllegalStateException.class, () -> {
            appointmentService.scheduleAppointment(patient, dto);
        });
        verify(notificationService, never()).sendAppointmentConfirmation(any());
    }

    @Test
    void scheduleAppointment_successSendsNotification() {
        AppointmentRequestDTO dto = new AppointmentRequestDTO();
        dto.setDoctorId(doctor.getId());
        dto.setStart(LocalDateTime.now().plusDays(1));
        dto.setEnd(dto.getStart().plusHours(1));
        dto.setReason("Consultation");

        when(userRepository.findById(doctor.getId())).thenReturn(Optional.of(doctor));
        when(doctorAvailabilityService.doctorHasAvailabilityFor(any(), any(), any())).thenReturn(true);
        when(appointmentRepository.findConflictingAppointments(any(), any(), any(), any()))
                .thenReturn(Collections.emptyList());
        when(appointmentRepository.save(any(Appointment.class))).thenAnswer(invocation -> {
            Appointment appt = invocation.getArgument(0);
            appt.setId(UUID.randomUUID());
            appt.setStatus(AppointmentStatus.PENDING);
            return appt;
        });

        Appointment saved = appointmentService.scheduleAppointment(patient, dto);
        Assertions.assertNotNull(saved.getId());
        Assertions.assertEquals(AppointmentStatus.PENDING, saved.getStatus());
        verify(notificationService, times(1)).sendAppointmentConfirmation(any());
    }
}

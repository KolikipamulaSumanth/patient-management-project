package com.pm.patientservice.service;

import com.pm.patientservice.dto.PatientRequestDTO;
import com.pm.patientservice.dto.PatientResponseDTO;
import com.pm.patientservice.exception.EmailAlreadyExistsException;
import com.pm.patientservice.exception.PatientNotFoundException;
import com.pm.patientservice.model.Patient;
import com.pm.patientservice.repository.PatientRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PatientServiceTest {

    @Mock
    private PatientRepository patientRepository;

    private PatientService patientService;

    @BeforeEach
    void setUp() {
        patientService = new PatientService(patientRepository);
    }

    @Test
    void createPatientSavesNewPatientWhenEmailIsUnique() {
        PatientRequestDTO request = buildRequest("Sumanth", "sumanth@example.com");
        when(patientRepository.existsByEmail("sumanth@example.com")).thenReturn(false);
        when(patientRepository.save(any(Patient.class))).thenAnswer(invocation -> {
            Patient patient = invocation.getArgument(0);
            patient.setId(UUID.randomUUID());
            return patient;
        });

        PatientResponseDTO response = patientService.createPatient(request);

        assertThat(response.getName()).isEqualTo("Sumanth");
        assertThat(response.getEmail()).isEqualTo("sumanth@example.com");
        assertThat(response.getDateOfBirth()).isEqualTo("2000-05-10");

        ArgumentCaptor<Patient> patientCaptor = ArgumentCaptor.forClass(Patient.class);
        verify(patientRepository).save(patientCaptor.capture());
        assertThat(patientCaptor.getValue().getRegisteredDate()).isEqualTo(LocalDate.of(2026, 5, 25));
    }

    @Test
    void createPatientThrowsWhenEmailAlreadyExists() {
        PatientRequestDTO request = buildRequest("Sumanth", "sumanth@example.com");
        when(patientRepository.existsByEmail("sumanth@example.com")).thenReturn(true);

        assertThatThrownBy(() -> patientService.createPatient(request))
                .isInstanceOf(EmailAlreadyExistsException.class)
                .hasMessageContaining("sumanth@example.com");

        verify(patientRepository, never()).save(any(Patient.class));
    }

    @Test
    void updatePatientUpdatesExistingPatientDetails() {
        UUID patientId = UUID.randomUUID();
        Patient existingPatient = buildPatient(patientId, "Old Name", "old@example.com");
        PatientRequestDTO request = buildRequest("Updated Name", "updated@example.com");

        when(patientRepository.findById(patientId)).thenReturn(Optional.of(existingPatient));
        when(patientRepository.existsByEmailAndIdNot("updated@example.com", patientId)).thenReturn(false);
        when(patientRepository.save(existingPatient)).thenReturn(existingPatient);

        PatientResponseDTO response = patientService.updatePatient(patientId, request);

        assertThat(response.getName()).isEqualTo("Updated Name");
        assertThat(response.getEmail()).isEqualTo("updated@example.com");
        assertThat(response.getAddress()).isEqualTo("Hyderabad");
        verify(patientRepository).save(existingPatient);
    }

    @Test
    void updatePatientThrowsWhenPatientDoesNotExist() {
        UUID patientId = UUID.randomUUID();
        when(patientRepository.findById(patientId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> patientService.updatePatient(patientId, buildRequest("Sumanth", "sumanth@example.com")))
                .isInstanceOf(PatientNotFoundException.class)
                .hasMessageContaining(patientId.toString());

        verify(patientRepository, never()).save(any(Patient.class));
    }

    @Test
    void getPatientsUsesNameFilterWhenSearchTermIsProvided() {
        Patient patient = buildPatient(UUID.randomUUID(), "Sumanth", "sumanth@example.com");
        when(patientRepository.findByNameContainingIgnoreCase(eq("sum"), eq(PageRequest.of(0, 5))))
                .thenReturn(new PageImpl<>(List.of(patient)));

        List<PatientResponseDTO> patients = patientService.getPatients("sum", 0, 5);

        assertThat(patients).hasSize(1);
        assertThat(patients.getFirst().getName()).isEqualTo("Sumanth");
        verify(patientRepository, never()).findAll(PageRequest.of(0, 5));
    }

    private PatientRequestDTO buildRequest(String name, String email) {
        PatientRequestDTO request = new PatientRequestDTO();
        request.setName(name);
        request.setEmail(email);
        request.setAddress("Hyderabad");
        request.setDateOfBirth("2000-05-10");
        request.setRegisteredDate("2026-05-25");
        return request;
    }

    private Patient buildPatient(UUID id, String name, String email) {
        Patient patient = new Patient();
        patient.setId(id);
        patient.setName(name);
        patient.setEmail(email);
        patient.setAddress("Hyderabad");
        patient.setDateOfBirth(LocalDate.of(2000, 5, 10));
        patient.setRegisteredDate(LocalDate.of(2026, 5, 25));
        return patient;
    }
}

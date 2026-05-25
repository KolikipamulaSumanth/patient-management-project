package com.pm.patientservice.mapper;

import com.pm.patientservice.dto.PatientRequestDTO;
import com.pm.patientservice.dto.PatientResponseDTO;
import com.pm.patientservice.model.Patient;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class PatientMapperTest {

    @Test
    void toModelMapsPatientRequestFields() {
        PatientRequestDTO request = new PatientRequestDTO();
        request.setName("Sumanth");
        request.setEmail("sumanth@example.com");
        request.setAddress("Hyderabad");
        request.setDateOfBirth("2000-05-10");
        request.setRegisteredDate("2026-05-25");

        Patient patient = PatientMapper.toModel(request);

        assertThat(patient.getName()).isEqualTo("Sumanth");
        assertThat(patient.getEmail()).isEqualTo("sumanth@example.com");
        assertThat(patient.getAddress()).isEqualTo("Hyderabad");
        assertThat(patient.getDateOfBirth()).isEqualTo(LocalDate.of(2000, 5, 10));
        assertThat(patient.getRegisteredDate()).isEqualTo(LocalDate.of(2026, 5, 25));
    }

    @Test
    void toDTOMapsPatientEntityFields() {
        UUID patientId = UUID.randomUUID();
        Patient patient = new Patient();
        patient.setId(patientId);
        patient.setName("Ananya");
        patient.setEmail("ananya@example.com");
        patient.setAddress("Bengaluru");
        patient.setDateOfBirth(LocalDate.of(1998, 2, 14));
        patient.setRegisteredDate(LocalDate.of(2026, 5, 25));

        PatientResponseDTO response = PatientMapper.toDTO(patient);

        assertThat(response.getId()).isEqualTo(patientId.toString());
        assertThat(response.getName()).isEqualTo("Ananya");
        assertThat(response.getEmail()).isEqualTo("ananya@example.com");
        assertThat(response.getAddress()).isEqualTo("Bengaluru");
        assertThat(response.getDateOfBirth()).isEqualTo("1998-02-14");
    }
}

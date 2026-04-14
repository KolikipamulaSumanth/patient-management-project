package com.pm.patientservice.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO for creating a new appointment.  
 *
 * <p>The {@code start} and {@code end} fields must be in the future and follow ISO-8601 format
 * when submitted as JSON.</p>
 */
public class AppointmentRequestDTO {
    @NotNull
    private UUID doctorId;

    @NotNull
    @Future(message = "Appointment start time must be in the future")
    private LocalDateTime start;

    @NotNull
    @Future(message = "Appointment end time must be in the future")
    private LocalDateTime end;

    private String reason;

    public UUID getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(UUID doctorId) {
        this.doctorId = doctorId;
    }

    public LocalDateTime getStart() {
        return start;
    }

    public void setStart(LocalDateTime start) {
        this.start = start;
    }

    public LocalDateTime getEnd() {
        return end;
    }

    public void setEnd(LocalDateTime end) {
        this.end = end;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
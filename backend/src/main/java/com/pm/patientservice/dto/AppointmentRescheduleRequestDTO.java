package com.pm.patientservice.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class AppointmentRescheduleRequestDTO {
    @NotNull
    @Future(message = "Appointment start time must be in the future")
    private LocalDateTime start;

    @NotNull
    @Future(message = "Appointment end time must be in the future")
    private LocalDateTime end;

    private String note;

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

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }
}

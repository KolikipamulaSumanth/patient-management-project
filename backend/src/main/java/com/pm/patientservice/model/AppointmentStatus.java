package com.pm.patientservice.model;

/**
 * Enumeration of the possible states of an appointment.  
 *
 * <p>Appointments begin in the {@link #PENDING} state when created.  
 * They may be moved to {@link #CONFIRMED} when accepted by a doctor or administrator, or
 * {@link #CANCELLED} if the appointment is no longer going to occur.
 */
public enum AppointmentStatus {
    PENDING,
    CONFIRMED,
    RESCHEDULED,
    COMPLETED,
    NO_SHOW,
    CANCELLED
}

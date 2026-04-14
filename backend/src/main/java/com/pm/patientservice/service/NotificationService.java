package com.pm.patientservice.service;

import com.pm.patientservice.model.Appointment;
import com.pm.patientservice.model.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Sends notifications to users about their appointments.  
 *
 * <p>Currently the implementation uses plain email via {@link JavaMailSender}.  
 * If email is not configured the notification will be logged instead.</p>
 */
@Service
public class NotificationService {
    private static final Logger LOGGER = LoggerFactory.getLogger(NotificationService.class);

    private final JavaMailSender mailSender;

    @Autowired
    public NotificationService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Sends an appointment confirmation to both the patient and doctor involved.  
     *
     * @param appointment the appointment that was created
     */
    public void sendAppointmentConfirmation(Appointment appointment) {
        User patient = appointment.getPatient();
        User doctor = appointment.getDoctor();
        String subject = "Appointment Confirmation";
        String body = String.format(
                "Dear %s,\n\nYour appointment with Dr. %s is scheduled for %s to %s.\n\nReason: %s\n\nRegards,\nPatient Management System",
                patient.getName(), doctor.getName(), appointment.getStartDateTime(), appointment.getEndDateTime(), appointment.getReason());
        sendEmail(patient.getEmail(), subject, body);
        // Notify the doctor as well
        String doctorBody = String.format(
                "Dear Dr. %s,\n\nYou have a new appointment with patient %s on %s to %s.\n\nReason: %s\n\nRegards,\nPatient Management System",
                doctor.getName(), patient.getName(), appointment.getStartDateTime(), appointment.getEndDateTime(), appointment.getReason());
        sendEmail(doctor.getEmail(), subject, doctorBody);
    }

    private void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
        } catch (Exception ex) {
            LOGGER.warn("Failed to send email to {}: {}", to, ex.getMessage());
            LOGGER.info("Email content:\nSubject: {}\n{}", subject, body);
        }
    }
}
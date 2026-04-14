package com.pm.patientservice.service;

import com.pm.patientservice.dto.AppointmentRequestDTO;
import com.pm.patientservice.dto.AppointmentRescheduleRequestDTO;
import com.pm.patientservice.dto.AppointmentResponseDTO;
import com.pm.patientservice.dto.AppointmentStatusUpdateRequestDTO;
import com.pm.patientservice.model.Appointment;
import com.pm.patientservice.model.AppointmentStatus;
import com.pm.patientservice.model.Role;
import com.pm.patientservice.model.User;
import com.pm.patientservice.repository.AppointmentRepository;
import com.pm.patientservice.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final DoctorAvailabilityService doctorAvailabilityService;

    public AppointmentService(AppointmentRepository appointmentRepository,
                              UserRepository userRepository,
                              NotificationService notificationService,
                              DoctorAvailabilityService doctorAvailabilityService) {
        this.appointmentRepository = appointmentRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.doctorAvailabilityService = doctorAvailabilityService;
    }

    @Transactional
    public Appointment scheduleAppointment(User patient, AppointmentRequestDTO dto) {
        Optional<User> optDoctor = userRepository.findById(dto.getDoctorId());
        if (optDoctor.isEmpty()) {
            throw new IllegalArgumentException("Doctor not found with id=" + dto.getDoctorId());
        }
        User doctor = optDoctor.get();
        if (!doctor.getRoles().contains(Role.ROLE_DOCTOR)) {
            throw new IllegalArgumentException("Selected user is not a doctor");
        }
        LocalDateTime start = dto.getStart();
        LocalDateTime end = dto.getEnd();
        if (end.isBefore(start) || end.equals(start)) {
            throw new IllegalArgumentException("Appointment end time must be after start time");
        }
        if (!doctorAvailabilityService.doctorHasAvailabilityFor(doctor, start, end)) {
            throw new IllegalArgumentException("Doctor is not available for the requested time slot");
        }
        List<Appointment> conflicts = appointmentRepository.findConflictingAppointments(
                doctor.getId(),
                AppointmentStatus.CANCELLED,
                start,
                end
        );
        if (!conflicts.isEmpty()) {
            throw new IllegalStateException("Requested time slot is not available");
        }
        Appointment appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setStartDateTime(start);
        appointment.setEndDateTime(end);
        appointment.setStatus(AppointmentStatus.PENDING);
        appointment.setReason(dto.getReason());
        stampStatusChange(appointment, patient.getEmail(), "Appointment created");
        Appointment saved = appointmentRepository.save(appointment);
        notificationService.sendAppointmentConfirmation(saved);
        return saved;
    }

    @Transactional
    public Appointment cancelAppointment(UUID appointmentId, User actor, String note) {
        Appointment appointment = getAccessibleAppointment(appointmentId, actor);
        ensureCanMutateAppointment(appointment, actor);
        ensureMutableStatus(appointment);
        appointment.setStatus(AppointmentStatus.CANCELLED);
        stampStatusChange(appointment, actor.getEmail(), note != null && !note.isBlank() ? note : "Appointment cancelled");
        return appointmentRepository.save(appointment);
    }

    @Transactional
    public Appointment rescheduleAppointment(UUID appointmentId, User actor, AppointmentRescheduleRequestDTO request) {
        Appointment appointment = getAccessibleAppointment(appointmentId, actor);
        ensureCanMutateAppointment(appointment, actor);
        ensureMutableStatus(appointment);

        LocalDateTime start = request.getStart();
        LocalDateTime end = request.getEnd();
        if (end.isBefore(start) || end.equals(start)) {
            throw new IllegalArgumentException("Appointment end time must be after start time");
        }
        if (!doctorAvailabilityService.doctorHasAvailabilityFor(appointment.getDoctor(), start, end)) {
            throw new IllegalArgumentException("Doctor is not available for the requested time slot");
        }
        List<Appointment> conflicts = appointmentRepository.findConflictingAppointmentsExcludingAppointment(
                appointment.getDoctor().getId(),
                appointment.getId(),
                AppointmentStatus.CANCELLED,
                start,
                end
        );
        if (!conflicts.isEmpty()) {
            throw new IllegalStateException("Requested time slot is not available");
        }

        appointment.setStartDateTime(start);
        appointment.setEndDateTime(end);
        appointment.setStatus(AppointmentStatus.RESCHEDULED);
        stampStatusChange(appointment, actor.getEmail(), request.getNote() != null && !request.getNote().isBlank()
                ? request.getNote()
                : "Appointment rescheduled");
        return appointmentRepository.save(appointment);
    }

    @Transactional
    public Appointment updateAppointmentStatus(UUID appointmentId, User actor, AppointmentStatusUpdateRequestDTO request) {
        Appointment appointment = getAccessibleAppointment(appointmentId, actor);
        ensureCanManageStatus(appointment, actor, request.getStatus());

        if (request.getStatus() == AppointmentStatus.RESCHEDULED) {
            throw new IllegalArgumentException("Use the reschedule endpoint to change appointment timing");
        }
        if (request.getStatus() == AppointmentStatus.PENDING) {
            throw new IllegalArgumentException("Appointment cannot be moved back to pending");
        }
        if (appointment.getStatus() == AppointmentStatus.CANCELLED && request.getStatus() != AppointmentStatus.CANCELLED) {
            throw new IllegalStateException("Cancelled appointments cannot be reopened");
        }
        if ((appointment.getStatus() == AppointmentStatus.COMPLETED || appointment.getStatus() == AppointmentStatus.NO_SHOW)
                && request.getStatus() != appointment.getStatus()) {
            throw new IllegalStateException("Completed or no-show appointments cannot change state");
        }

        appointment.setStatus(request.getStatus());
        String defaultNote = switch (request.getStatus()) {
            case CONFIRMED -> "Appointment confirmed";
            case COMPLETED -> "Appointment completed";
            case NO_SHOW -> "Patient marked as no-show";
            case CANCELLED -> "Appointment cancelled";
            default -> "Appointment updated";
        };
        stampStatusChange(appointment, actor.getEmail(),
                request.getNote() != null && !request.getNote().isBlank() ? request.getNote() : defaultNote);
        return appointmentRepository.save(appointment);
    }

    public Page<Appointment> getAppointmentsForPatient(UUID patientId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return appointmentRepository.findByPatientId(patientId, pageable);
    }

    public Page<Appointment> getAppointmentsForDoctor(UUID doctorId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return appointmentRepository.findByDoctorId(doctorId, pageable);
    }

    public List<AppointmentResponseDTO> getAppointmentsForHospital(UUID hospitalId, LocalDate from, LocalDate to) {
        LocalDateTime start = from.atStartOfDay();
        LocalDateTime end = to.plusDays(1).atStartOfDay().minusSeconds(1);
        return appointmentRepository.findByDoctorHospitalIdAndStartDateTimeBetweenOrderByStartDateTimeAsc(hospitalId, start, end).stream()
                .map(AppointmentService::toDTO)
                .toList();
    }

    public boolean hasAppointmentsForDoctor(UUID doctorId) {
        return appointmentRepository.existsByDoctorId(doctorId);
    }

    public boolean hasAppointmentsForHospital(UUID hospitalId) {
        return appointmentRepository.existsByDoctorHospitalId(hospitalId);
    }

    public static AppointmentResponseDTO toDTO(Appointment appointment) {
        AppointmentResponseDTO dto = new AppointmentResponseDTO();
        dto.setId(appointment.getId());
        dto.setPatientId(appointment.getPatient().getId());
        dto.setDoctorId(appointment.getDoctor().getId());
        dto.setPatientName(appointment.getPatient().getName());
        dto.setDoctorName(appointment.getDoctor().getName());
        dto.setDoctorSpeciality(appointment.getDoctor().getSpeciality());
        dto.setStart(appointment.getStartDateTime());
        dto.setEnd(appointment.getEndDateTime());
        dto.setStatus(appointment.getStatus());
        dto.setReason(appointment.getReason());
        dto.setStatusNote(appointment.getStatusNote());
        dto.setStatusUpdatedBy(appointment.getStatusUpdatedBy());
        dto.setStatusUpdatedAt(appointment.getStatusUpdatedAt());
        return dto;
    }

    private Appointment getAccessibleAppointment(UUID appointmentId, User actor) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found"));
        if (canAccessAppointment(actor, appointment)) {
            return appointment;
        }
        throw new IllegalArgumentException("You do not have access to this appointment");
    }

    private boolean canAccessAppointment(User actor, Appointment appointment) {
        if (actor.getRoles().contains(Role.ROLE_PLATFORM_ADMIN)) {
            return true;
        }
        if (actor.getRoles().contains(Role.ROLE_PATIENT)) {
            return appointment.getPatient().getId().equals(actor.getId());
        }
        if (actor.getRoles().contains(Role.ROLE_DOCTOR)) {
            return appointment.getDoctor().getId().equals(actor.getId());
        }
        if (actor.getRoles().contains(Role.ROLE_ADMIN)) {
            UUID actorHospitalId = actor.getHospital() != null ? actor.getHospital().getId() : null;
            UUID appointmentHospitalId = appointment.getDoctor().getHospital() != null ? appointment.getDoctor().getHospital().getId() : null;
            return actorHospitalId != null && actorHospitalId.equals(appointmentHospitalId);
        }
        return false;
    }

    private void ensureCanMutateAppointment(Appointment appointment, User actor) {
        if (actor.getRoles().contains(Role.ROLE_PATIENT)) {
            if (!appointment.getPatient().getId().equals(actor.getId())) {
                throw new IllegalArgumentException("Patients can only manage their own appointments");
            }
            return;
        }
        if (actor.getRoles().contains(Role.ROLE_DOCTOR) && !appointment.getDoctor().getId().equals(actor.getId())) {
            throw new IllegalArgumentException("Doctors can only manage their own appointments");
        }
    }

    private void ensureCanManageStatus(Appointment appointment, User actor, AppointmentStatus status) {
        if (status == AppointmentStatus.CANCELLED) {
            ensureCanMutateAppointment(appointment, actor);
            return;
        }
        boolean privileged = actor.getRoles().contains(Role.ROLE_PLATFORM_ADMIN)
                || actor.getRoles().contains(Role.ROLE_ADMIN)
                || actor.getRoles().contains(Role.ROLE_DOCTOR);
        if (!privileged) {
            throw new IllegalArgumentException("Only doctors or administrators can update this appointment status");
        }
        if (actor.getRoles().contains(Role.ROLE_DOCTOR) && !appointment.getDoctor().getId().equals(actor.getId())) {
            throw new IllegalArgumentException("Doctors can only update their own appointments");
        }
    }

    private void ensureMutableStatus(Appointment appointment) {
        if (appointment.getStatus() == AppointmentStatus.CANCELLED) {
            throw new IllegalStateException("Cancelled appointments cannot be modified");
        }
        if (appointment.getStatus() == AppointmentStatus.COMPLETED) {
            throw new IllegalStateException("Completed appointments cannot be modified");
        }
        if (appointment.getStatus() == AppointmentStatus.NO_SHOW) {
            throw new IllegalStateException("No-show appointments cannot be modified");
        }
    }

    private void stampStatusChange(Appointment appointment, String actorEmail, String note) {
        appointment.setStatusUpdatedBy(actorEmail);
        appointment.setStatusUpdatedAt(LocalDateTime.now());
        appointment.setStatusNote(note);
    }
}

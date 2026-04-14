package com.pm.patientservice.service;

import com.pm.patientservice.dto.AdminCreateRequestDTO;
import com.pm.patientservice.dto.DoctorRequestDTO;
import com.pm.patientservice.dto.HospitalAdminUpdateRequestDTO;
import com.pm.patientservice.dto.HospitalRequestDTO;
import com.pm.patientservice.dto.HospitalResponseDTO;
import com.pm.patientservice.dto.RegisterRequest;
import com.pm.patientservice.dto.UserResponseDTO;
import com.pm.patientservice.model.Hospital;
import com.pm.patientservice.model.Role;
import com.pm.patientservice.model.User;
import com.pm.patientservice.repository.AppointmentRepository;
import com.pm.patientservice.repository.HospitalRepository;
import com.pm.patientservice.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.Period;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final HospitalRepository hospitalRepository;
    private final AppointmentRepository appointmentRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserService(UserRepository userRepository,
                       HospitalRepository hospitalRepository,
                       AppointmentRepository appointmentRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.hospitalRepository = hospitalRepository;
        this.appointmentRepository = appointmentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public User registerPatient(RegisterRequest request) {
        ensureEmailAvailable(request.getEmail(), null);
        User user = new User();
        applyBasicDetails(user, request.getName(), request.getEmail(), request.getPassword(), request.getAddress(), request.getDateOfBirth(), true);
        user.setRoles(Set.of(Role.ROLE_PATIENT));
        return userRepository.save(user);
    }

    @Transactional
    public User createBootstrapPlatformAdmin(String email, String password, String name) {
        ensureEmailAvailable(email, null);
        User user = new User();
        applyBasicDetails(user, name, email, password, null, null, true);
        user.setRoles(Set.of(Role.ROLE_PLATFORM_ADMIN));
        return userRepository.save(user);
    }

    @Transactional
    public User promoteToPlatformAdmin(String email) {
        User user = getCurrentUser(email);
        user.getRoles().add(Role.ROLE_PLATFORM_ADMIN);
        return userRepository.save(user);
    }

    @Transactional
    public Hospital createHospital(HospitalRequestDTO request) {
        if (hospitalRepository.existsByName(request.getName())) {
            throw new IllegalArgumentException("A hospital with this name already exists: " + request.getName());
        }
        Hospital hospital = new Hospital();
        hospital.setName(request.getName());
        hospital.setAddress(request.getAddress());
        hospital.setDescription(request.getDescription());
        return hospitalRepository.save(hospital);
    }

    @Transactional
    public Hospital updateHospital(UUID hospitalId, HospitalRequestDTO request) {
        Hospital hospital = getHospital(hospitalId);
        hospitalRepository.findByName(request.getName()).ifPresent(existing -> {
            if (!existing.getId().equals(hospitalId)) {
                throw new IllegalArgumentException("A hospital with this name already exists: " + request.getName());
            }
        });
        hospital.setName(request.getName());
        hospital.setAddress(request.getAddress());
        hospital.setDescription(request.getDescription());
        return hospitalRepository.save(hospital);
    }

    @Transactional
    public void deleteHospital(UUID hospitalId) {
        if (appointmentRepository.existsByDoctorHospitalId(hospitalId)) {
            throw new IllegalStateException("Cannot delete a hospital that already has appointments");
        }
        List<User> hospitalUsers = userRepository.findByHospitalId(hospitalId);
        if (!hospitalUsers.isEmpty()) {
            throw new IllegalStateException("Cannot delete a hospital while admins or doctors are assigned to it");
        }
        hospitalRepository.delete(getHospital(hospitalId));
    }

    public List<HospitalResponseDTO> getHospitals() {
        return hospitalRepository.findAll().stream().map(UserService::toHospitalDTO).toList();
    }

    @Transactional
    public User createHospitalAdmin(UUID hospitalId, AdminCreateRequestDTO request) {
        ensureEmailAvailable(request.getEmail(), null);
        Hospital hospital = getHospital(hospitalId);
        User user = new User();
        applyBasicDetails(user, request.getName(), request.getEmail(), request.getPassword(), null, null, true);
        user.setHospital(hospital);
        user.setRoles(Set.of(Role.ROLE_ADMIN));
        return userRepository.save(user);
    }

    public List<UserResponseDTO> getHospitalAdmins(UUID hospitalId) {
        return userRepository.findByHospitalId(hospitalId).stream()
                .filter(user -> user.getRoles().contains(Role.ROLE_ADMIN))
                .map(UserService::toDTO)
                .toList();
    }

    @Transactional
    public User updateHospitalAdmin(UUID hospitalId, UUID adminId, HospitalAdminUpdateRequestDTO request) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new IllegalArgumentException("Hospital admin not found"));
        if (!admin.getRoles().contains(Role.ROLE_ADMIN)) {
            throw new IllegalArgumentException("Selected user is not a hospital admin");
        }
        if (admin.getHospital() == null || !admin.getHospital().getId().equals(hospitalId)) {
            throw new IllegalArgumentException("Hospital admin does not belong to this hospital");
        }
        ensureEmailAvailable(request.getEmail(), admin.getId());
        applyBasicDetails(admin, request.getName(), request.getEmail(), request.getPassword(), admin.getAddress(), admin.getDateOfBirth() != null ? admin.getDateOfBirth().toString() : null, false);
        return userRepository.save(admin);
    }

    @Transactional
    public void deleteHospitalAdmin(UUID hospitalId, UUID adminId) {
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new IllegalArgumentException("Hospital admin not found"));
        if (!admin.getRoles().contains(Role.ROLE_ADMIN)) {
            throw new IllegalArgumentException("Selected user is not a hospital admin");
        }
        if (admin.getHospital() == null || !admin.getHospital().getId().equals(hospitalId)) {
            throw new IllegalArgumentException("Hospital admin does not belong to this hospital");
        }
        userRepository.delete(admin);
    }

    @Transactional
    public User createDoctor(DoctorRequestDTO request, String actorEmail) {
        User actor = getCurrentUser(actorEmail);
        ensureAdminPrivileges(actor);
        ensureEmailAvailable(request.getEmail(), null);

        Hospital hospital = resolveHospitalForManagedUser(actor, request.getHospitalId());
        User doctor = new User();
        applyDoctorDetails(doctor, request, true);
        doctor.setHospital(hospital);
        doctor.setRoles(Set.of(Role.ROLE_DOCTOR));
        return userRepository.save(doctor);
    }

    @Transactional
    public User updateDoctor(UUID doctorId, DoctorRequestDTO request, String actorEmail) {
        User actor = getCurrentUser(actorEmail);
        ensureAdminPrivileges(actor);

        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new IllegalArgumentException("Doctor not found"));
        ensureDoctor(doctor);
        ensureCanManageDoctor(actor, doctor);
        ensureEmailAvailable(request.getEmail(), doctor.getId());

        applyDoctorDetails(doctor, request, false);
        doctor.setHospital(resolveHospitalForExistingManagedUser(actor, doctor, request.getHospitalId()));
        return userRepository.save(doctor);
    }

    @Transactional
    public void deleteDoctor(UUID doctorId, String actorEmail) {
        User actor = getCurrentUser(actorEmail);
        ensureAdminPrivileges(actor);

        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new IllegalArgumentException("Doctor not found"));
        ensureDoctor(doctor);
        ensureCanManageDoctor(actor, doctor);
        if (appointmentRepository.existsByDoctorId(doctorId)) {
            throw new IllegalStateException("Cannot delete a doctor who already has appointments");
        }
        userRepository.delete(doctor);
    }

    public Optional<User> getUser(UUID id) {
        return userRepository.findById(id);
    }

    public Page<User> getUsers(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return userRepository.findAll(pageable);
    }

    public UserResponseDTO getCurrentUserProfile(String email) {
        return toDTO(getCurrentUser(email));
    }

    public List<UserResponseDTO> getDoctors() {
        return userRepository.findAll().stream()
                .filter(user -> user.getRoles().contains(Role.ROLE_DOCTOR))
                .map(UserService::toDTO)
                .toList();
    }

    public Optional<UserResponseDTO> getDoctor(UUID id) {
        return userRepository.findById(id)
                .filter(user -> user.getRoles().contains(Role.ROLE_DOCTOR))
                .map(UserService::toDTO);
    }

    public User getCurrentUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));
    }

    public boolean isPlatformAdmin(User user) {
        return user.getRoles().contains(Role.ROLE_PLATFORM_ADMIN);
    }

    public boolean isHospitalAdmin(User user) {
        return user.getRoles().contains(Role.ROLE_ADMIN);
    }

    public boolean isAnyAdmin(User user) {
        return isPlatformAdmin(user) || isHospitalAdmin(user);
    }

    public void ensureAdminPrivileges(User user) {
        if (!isAnyAdmin(user)) {
            throw new IllegalArgumentException("Administrator privileges are required");
        }
    }

    public void ensureCanAccessHospitalCalendar(User user, UUID hospitalId) {
        if (isPlatformAdmin(user)) {
            return;
        }
        UUID userHospitalId = user.getHospital() != null ? user.getHospital().getId() : null;
        if (userHospitalId == null || !userHospitalId.equals(hospitalId)) {
            throw new IllegalArgumentException("You can only access the calendar for your own hospital");
        }
    }

    public static UserResponseDTO toDTO(User user) {
        UserResponseDTO dto = new UserResponseDTO();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setAddress(user.getAddress());
        dto.setDateOfBirth(user.getDateOfBirth());
        dto.setAge(calculateAge(user.getDateOfBirth()));
        dto.setRegisteredDate(user.getRegisteredDate());
        dto.setRoles(user.getRoles());
        dto.setHospitalId(user.getHospital() != null ? user.getHospital().getId() : null);
        dto.setHospitalName(user.getHospital() != null ? user.getHospital().getName() : null);
        dto.setSpeciality(user.getSpeciality());
        dto.setQualification(user.getQualification());
        dto.setYearsOfExperience(user.getYearsOfExperience());
        dto.setBio(user.getBio());
        return dto;
    }

    public static HospitalResponseDTO toHospitalDTO(Hospital hospital) {
        HospitalResponseDTO dto = new HospitalResponseDTO();
        dto.setId(hospital.getId());
        dto.setName(hospital.getName());
        dto.setAddress(hospital.getAddress());
        dto.setDescription(hospital.getDescription());
        return dto;
    }

    private void ensureCanManageDoctor(User actor, User doctor) {
        if (isPlatformAdmin(actor)) {
            return;
        }
        UUID actorHospitalId = actor.getHospital() != null ? actor.getHospital().getId() : null;
        UUID doctorHospitalId = doctor.getHospital() != null ? doctor.getHospital().getId() : null;
        if (actorHospitalId == null || !actorHospitalId.equals(doctorHospitalId)) {
            throw new IllegalArgumentException("You can only manage doctors in your own hospital");
        }
    }

    private Hospital resolveHospitalForManagedUser(User actor, UUID requestedHospitalId) {
        if (isPlatformAdmin(actor)) {
            if (requestedHospitalId == null) {
                throw new IllegalArgumentException("Hospital is required");
            }
            return getHospital(requestedHospitalId);
        }
        if (actor.getHospital() == null) {
            throw new IllegalArgumentException("Hospital admin is not linked to any hospital");
        }
        return actor.getHospital();
    }

    private Hospital resolveHospitalForExistingManagedUser(User actor, User doctor, UUID requestedHospitalId) {
        if (isPlatformAdmin(actor)) {
            if (requestedHospitalId == null) {
                return doctor.getHospital();
            }
            return getHospital(requestedHospitalId);
        }
        if (actor.getHospital() == null) {
            throw new IllegalArgumentException("Hospital admin is not linked to any hospital");
        }
        return actor.getHospital();
    }

    private Hospital getHospital(UUID hospitalId) {
        return hospitalRepository.findById(hospitalId)
                .orElseThrow(() -> new IllegalArgumentException("Hospital not found"));
    }

    private void ensureDoctor(User user) {
        if (!user.getRoles().contains(Role.ROLE_DOCTOR)) {
            throw new IllegalArgumentException("Selected user is not a doctor");
        }
    }

    private void ensureEmailAvailable(String email, UUID currentUserId) {
        userRepository.findByEmail(email).ifPresent(existing -> {
            if (currentUserId == null || !existing.getId().equals(currentUserId)) {
                throw new IllegalArgumentException("A user with this email already exists: " + email);
            }
        });
    }

    private void applyDoctorDetails(User doctor, DoctorRequestDTO request, boolean creating) {
        applyBasicDetails(
                doctor,
                request.getName(),
                request.getEmail(),
                request.getPassword(),
                request.getAddress(),
                request.getDateOfBirth(),
                creating
        );
        doctor.setSpeciality(request.getSpeciality());
        doctor.setQualification(request.getQualification());
        doctor.setYearsOfExperience(request.getYearsOfExperience());
        doctor.setBio(request.getBio());
    }

    private void applyBasicDetails(User user,
                                   String name,
                                   String email,
                                   String rawPassword,
                                   String address,
                                   String dateOfBirth,
                                   boolean setRegisteredDate) {
        user.setName(name);
        user.setEmail(email);
        user.setAddress(address);
        if (dateOfBirth != null && !dateOfBirth.isBlank()) {
            user.setDateOfBirth(LocalDate.parse(dateOfBirth));
        }
        if (rawPassword != null && !rawPassword.isBlank()) {
            user.setPassword(passwordEncoder.encode(rawPassword));
        } else if (user.getPassword() == null) {
            throw new IllegalArgumentException("Password is required");
        }
        if (setRegisteredDate && user.getRegisteredDate() == null) {
            user.setRegisteredDate(LocalDate.now());
        }
    }

    private static Integer calculateAge(LocalDate dateOfBirth) {
        if (dateOfBirth == null) {
            return null;
        }
        return Period.between(dateOfBirth, LocalDate.now()).getYears();
    }
}

package com.pm.patientservice.repository;

import com.pm.patientservice.model.Hospital;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface HospitalRepository extends JpaRepository<Hospital, UUID> {
    boolean existsByName(String name);
    Optional<Hospital> findByName(String name);
}

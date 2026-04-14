package com.pm.patientservice.repository;

import com.pm.patientservice.model.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PatientRepository extends JpaRepository<Patient, UUID> {
    boolean existsByEmail(String email);
    boolean existsByEmailAndIdNot(String email,UUID id);
    /**
     * Finds patients whose name contains the given search term, case-insensitively.  
     * Supports pagination.
     *
     * @param name   name fragment to search for
     * @param pageable pagination information
     * @return page of matching patients
     */
    Page<Patient> findByNameContainingIgnoreCase(String name, Pageable pageable);

    @Deprecated
    default Optional<Patient> id(UUID id) {
        return findById(id);
    }
}

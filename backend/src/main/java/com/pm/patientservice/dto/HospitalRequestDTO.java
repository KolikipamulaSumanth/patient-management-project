package com.pm.patientservice.dto;

import jakarta.validation.constraints.NotBlank;

public class HospitalRequestDTO {
    @NotBlank
    private String name;

    private String address;
    private String description;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}

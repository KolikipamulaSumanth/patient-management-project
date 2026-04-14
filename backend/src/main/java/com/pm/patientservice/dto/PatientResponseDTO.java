package com.pm.patientservice.dto;

public class PatientResponseDTO {
    //there some differences in this compared to patient model
    private String id;  // in patient model we stored as UUID
    private String name;
    private String email;
    private String address;
    private String dateOfBirth; // in patient model we stored as LocalDate and not used registered date
    //it means the registered date is never exposed in the frontend

    //reason if we use model directly it can be hard to convert data to json so its better to use dto


    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(String dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }


}

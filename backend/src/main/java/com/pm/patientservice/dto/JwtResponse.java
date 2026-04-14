package com.pm.patientservice.dto;

/**
 * Response object containing a JWT token.  
 *
 * <p>Used by the authentication endpoints to send the token back to the client.</p>
 */
public class JwtResponse {
    private String token;

    public JwtResponse() {
    }

    public JwtResponse(String token) {
        this.token = token;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }
}
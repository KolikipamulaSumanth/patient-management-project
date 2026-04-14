package com.pm.patientservice.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import org.springframework.context.annotation.Configuration;

/**
 * Basic OpenAPI configuration to provide API metadata for Swagger UI.  
 */
@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "Patient Management API",
                version = "1.0",
                description = "Backend services for managing patients and appointments"
        )
)
public class OpenApiConfig {
}
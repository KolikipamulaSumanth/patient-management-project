package com.pm.patientservice.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Globally configures Cross‑Origin Resource Sharing (CORS) for the application.
 *
 * <p>This configuration allows requests from a locally running React
 * development server (typically on {@code http://localhost:3000}) to reach
 * the Spring Boot backend. It permits all HTTP methods and headers and
 * supports sending credentials such as the Authorization header. Adjust
 * the allowed origin(s) as needed for different deployment environments.</p>
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
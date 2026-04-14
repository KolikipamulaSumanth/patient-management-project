package com.pm.patientservice.config;

import com.pm.patientservice.dto.RegisterRequest;
import com.pm.patientservice.model.Role;
import com.pm.patientservice.model.User;
import com.pm.patientservice.repository.UserRepository;
import com.pm.patientservice.service.UserService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AdminBootstrapInitializer {

    @Bean
    ApplicationRunner bootstrapAdmin(UserRepository userRepository,
                                     UserService userService,
                                     @Value("${app.bootstrap.admin.email:admin@hospital.local}") String adminEmail,
                                     @Value("${app.bootstrap.admin.password:Admin@123}") String adminPassword,
                                     @Value("${app.bootstrap.admin.name:System Admin}") String adminName) {
        return args -> {
            boolean platformAdminExists = userRepository.findAll().stream()
                    .anyMatch(user -> user.getRoles().contains(Role.ROLE_PLATFORM_ADMIN));
            if (platformAdminExists) {
                return;
            }
            if (userRepository.existsByEmail(adminEmail)) {
                userService.promoteToPlatformAdmin(adminEmail);
                return;
            }
            userService.createBootstrapPlatformAdmin(adminEmail, adminPassword, adminName);
        };
    }
}

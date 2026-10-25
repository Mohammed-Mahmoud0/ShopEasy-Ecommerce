package org.example.shopeasy.config;

import org.example.shopeasy.model.AppUser;
import org.example.shopeasy.model.Role;
import org.example.shopeasy.repo.UserRepo;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.Locale;

@Configuration
public class AdminBootstrap {
    @Bean
    CommandLineRunner createAdmin(UserRepo users, PasswordEncoder passwords,
                                  @Value("${app.admin.email}") String email,
                                  @Value("${app.admin.password}") String password) {
        return args -> {
            if (email.isBlank() && password.isBlank()) return;
            if (email.isBlank() || password.length() < 12)
                throw new IllegalStateException("Set ADMIN_EMAIL and an ADMIN_PASSWORD of at least 12 characters");
            String normalized = email.trim().toLowerCase(Locale.ROOT);
            var existing = users.findByEmail(normalized);
            if (existing.isPresent()) {
                if (existing.get().getRole() != Role.ADMIN)
                    throw new IllegalStateException("ADMIN_EMAIL already belongs to a customer account");
                return;
            }
            AppUser admin = new AppUser();
            admin.setEmail(normalized);
            admin.setName("Administrator");
            admin.setPasswordHash(passwords.encode(password));
            admin.setRole(Role.ADMIN);
            users.save(admin);
        };
    }
}

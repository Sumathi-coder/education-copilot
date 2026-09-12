package com.educopilot.backend.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Small reference controller showing how ANY endpoint (yours or Person B's)
 * can require a valid JWT and/or a specific role, once SecurityConfig and
 * JwtFilter are in place.
 */
@RestController
@RequestMapping("/api")
public class ProfileController {

    // Any logged-in user (STUDENT, PROFESSOR, or ADMIN) can call this
    @GetMapping("/me")
    public Map<String, Object> whoAmI(Authentication authentication) {
        return Map.of(
                "email", authentication.getName(),
                "authorities", authentication.getAuthorities()
        );
    }

    // Only PROFESSOR (or ADMIN, if you add it to the annotation) can call this
    @PreAuthorize("hasRole('PROFESSOR')")
    @GetMapping("/professor/ping")
    public Map<String, String> professorOnly() {
        return Map.of("message", "You are authenticated as a professor.");
    }

    // Only STUDENT can call this
    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping("/student/ping")
    public Map<String, String> studentOnly() {
        return Map.of("message", "You are authenticated as a student.");
    }
}

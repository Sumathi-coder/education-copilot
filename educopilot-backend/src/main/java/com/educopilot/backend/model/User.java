package com.educopilot.backend.model;

import jakarta.persistence.*;

/**
 * STUB — Person A owns the real User entity (with password, JWT-related
 * fields, etc.) in the auth branch. This minimal version exists only so
 * Person B's module (Course, Enrollment, Test...) compiles and can be
 * tested independently. DELETE this file when merging with Person A's
 * branch — use their User.java instead.
 */
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true)
    private String email;

    private String role; // STUDENT, PROFESSOR, ADMIN

    public User() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}

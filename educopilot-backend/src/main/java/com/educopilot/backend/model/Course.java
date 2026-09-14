package com.educopilot.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "courses")
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String code;

    @Column(length = 2000)
    private String description;

    // References Person A's User entity (professor role)
    @Column(name = "professor_id", nullable = false)
    private Long professorId;

    public Course() {}

    public Course(String name, String code, String description, Long professorId) {
        this.name = name;
        this.code = code;
        this.description = description;
        this.professorId = professorId;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Long getProfessorId() { return professorId; }
    public void setProfessorId(Long professorId) { this.professorId = professorId; }
}

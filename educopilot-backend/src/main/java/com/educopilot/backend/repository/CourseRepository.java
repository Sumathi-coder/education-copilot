package com.educopilot.backend.repository;

import com.educopilot.backend.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findByProfessorId(Long professorId);
    Course findByCode(String code);
}

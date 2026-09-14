package com.educopilot.backend.controller;

import com.educopilot.backend.model.Enrollment;
import com.educopilot.backend.service.EnrollmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/enrollments")
public class EnrollmentController {

    @Autowired
    private EnrollmentService enrollmentService;

    @PostMapping
    public ResponseEntity<Enrollment> enroll(@RequestParam Long studentId, @RequestParam Long courseId) {
        return ResponseEntity.ok(enrollmentService.enrollStudent(studentId, courseId));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Enrollment>> getCoursesForStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(enrollmentService.getCoursesForStudent(studentId));
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<Enrollment>> getStudentsForCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(enrollmentService.getStudentsForCourse(courseId));
    }
}

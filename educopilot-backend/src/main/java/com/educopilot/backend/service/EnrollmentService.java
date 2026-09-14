package com.educopilot.backend.service;

import com.educopilot.backend.model.Course;
import com.educopilot.backend.model.Enrollment;
import com.educopilot.backend.repository.CourseRepository;
import com.educopilot.backend.repository.EnrollmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EnrollmentService {

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private CourseRepository courseRepository;

    public Enrollment enrollStudent(Long studentId, Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found: " + courseId));
        Enrollment enrollment = new Enrollment(studentId, course);
        return enrollmentRepository.save(enrollment);
    }

    public List<Enrollment> getCoursesForStudent(Long studentId) {
        return enrollmentRepository.findByStudentId(studentId);
    }

    public List<Enrollment> getStudentsForCourse(Long courseId) {
        return enrollmentRepository.findByCourseId(courseId);
    }
}

package com.educopilot.backend.controller;

import com.educopilot.backend.model.Question;
import com.educopilot.backend.model.Test;
import com.educopilot.backend.service.TestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/professor/test")
public class TestController {

    @Autowired
    private TestService testService;

    @PreAuthorize("hasRole('PROFESSOR')")
    @PostMapping
    public ResponseEntity<Test> createTest(@RequestBody Test test) {
        return ResponseEntity.ok(testService.createTest(test));
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<Test>> getTestsByCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(testService.getTestsByCourse(courseId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Test> getTest(@PathVariable Long id) {
        return testService.getTestById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasRole('PROFESSOR')")
    @PostMapping("/{testId}/questions")
    public ResponseEntity<Question> addQuestion(@PathVariable Long testId, @RequestBody Question question) {
        return ResponseEntity.ok(testService.addQuestion(question));
    }

    @GetMapping("/{testId}/questions")
    public ResponseEntity<List<Question>> getQuestions(@PathVariable Long testId) {
        return ResponseEntity.ok(testService.getQuestionsForTest(testId));
    }

    @PreAuthorize("hasRole('PROFESSOR')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTest(@PathVariable Long id) {
        testService.deleteTest(id);
        return ResponseEntity.noContent().build();
    }
}

package com.educopilot.backend.controller;

import com.educopilot.backend.dto.SubmissionRequest;
import com.educopilot.backend.model.Submission;
import com.educopilot.backend.service.SubmissionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class SubmissionController {

    @Autowired
    private SubmissionService submissionService;

    // Deterministic scoring for MCQ / True-False. Short answers get
    // scored later by the AI service via /api/grading/evaluate.
    @PostMapping("/tests/submit")
    public ResponseEntity<Submission> submitTest(@RequestBody SubmissionRequest request) {
        Submission result = submissionService.submitAndScore(
                request.getTestId(), request.getStudentId(), request.getAnswers());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/grading/{submissionId}")
    public ResponseEntity<Submission> getSubmission(@PathVariable Long submissionId) {
        return submissionService.getSubmission(submissionId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/student/{studentId}/submissions")
    public ResponseEntity<List<Submission>> getSubmissionsForStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(submissionService.getSubmissionsForStudent(studentId));
    }

    @GetMapping("/professor/submissions/test/{testId}")
    public ResponseEntity<List<Submission>> getSubmissionsForTest(@PathVariable Long testId) {
        return ResponseEntity.ok(submissionService.getSubmissionsForTest(testId));
    }
}

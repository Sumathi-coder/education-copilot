package com.educopilot.backend.dto;

import java.util.Map;

public class SubmissionRequest {

    private Long testId;
    private Long studentId;
    private Map<Long, String> answers; // questionId -> given answer

    public Long getTestId() { return testId; }
    public void setTestId(Long testId) { this.testId = testId; }

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public Map<Long, String> getAnswers() { return answers; }
    public void setAnswers(Map<Long, String> answers) { this.answers = answers; }
}

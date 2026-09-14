package com.educopilot.backend.service;

import com.educopilot.backend.model.*;
import com.educopilot.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class SubmissionService {

    @Autowired
    private SubmissionRepository submissionRepository;

    @Autowired
    private AnswerRepository answerRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private OptionRepository optionRepository;

    /**
     * Deterministic scoring for MCQ / True-False submissions.
     * answersMap: questionId -> selected option text (or answer text)
     * AI-based short-answer grading is handled separately by the AI service.
     */
    public Submission submitAndScore(Long testId, Long studentId, Map<Long, String> answersMap) {
        Submission submission = new Submission();
        submission.setStudentId(studentId);
        submission.setSubmittedAt(LocalDateTime.now());

        List<Answer> answerList = new ArrayList<>();
        double totalScore = 0.0;

        for (Map.Entry<Long, String> entry : answersMap.entrySet()) {
            Long questionId = entry.getKey();
            String givenAnswer = entry.getValue();

            Question question = questionRepository.findById(questionId)
                    .orElseThrow(() -> new RuntimeException("Question not found: " + questionId));

            Answer answer = new Answer();
            answer.setSubmission(submission);
            answer.setQuestion(question);
            answer.setAnswer(givenAnswer);

            if ("MCQ".equalsIgnoreCase(question.getQuestionType())
                    || "TRUE_FALSE".equalsIgnoreCase(question.getQuestionType())) {
                boolean correct = isCorrectOption(questionId, givenAnswer);
                double marks = correct ? (question.getMarks() != null ? question.getMarks() : 1) : 0;
                answer.setScore(marks);
                totalScore += marks;
            }
            // SHORT_ANSWER questions are left unscored here;
            // the AI service (/api/grading/evaluate) fills in score + aiFeedback later.

            answerList.add(answer);
        }

        submission.setAnswers(answerList);
        submission.setScore(totalScore);
        return submissionRepository.save(submission);
    }

    private boolean isCorrectOption(Long questionId, String givenAnswer) {
        List<Option> options = optionRepository.findByQuestionId(questionId);
        return options.stream()
                .anyMatch(o -> o.getOptionText().equalsIgnoreCase(givenAnswer)
                        && Boolean.TRUE.equals(o.getIsCorrect()));
    }

    public Optional<Submission> getSubmission(Long id) {
        return submissionRepository.findById(id);
    }

    public List<Submission> getSubmissionsForStudent(Long studentId) {
        return submissionRepository.findByStudentId(studentId);
    }

    public List<Submission> getSubmissionsForTest(Long testId) {
        return submissionRepository.findByTestId(testId);
    }
}

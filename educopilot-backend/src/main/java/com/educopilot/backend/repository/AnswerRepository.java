package com.educopilot.backend.repository;

import com.educopilot.backend.model.Answer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AnswerRepository extends JpaRepository<Answer, Long> {
    List<Answer> findBySubmissionId(Long submissionId);
}

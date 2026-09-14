package com.educopilot.backend.service;

import com.educopilot.backend.model.Question;
import com.educopilot.backend.model.Test;
import com.educopilot.backend.repository.QuestionRepository;
import com.educopilot.backend.repository.TestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TestService {

    @Autowired
    private TestRepository testRepository;

    @Autowired
    private QuestionRepository questionRepository;

    public Test createTest(Test test) {
        return testRepository.save(test);
    }

    public List<Test> getTestsByCourse(Long courseId) {
        return testRepository.findByCourseId(courseId);
    }

    public Optional<Test> getTestById(Long id) {
        return testRepository.findById(id);
    }

    public Question addQuestion(Question question) {
        return questionRepository.save(question);
    }

    public List<Question> getQuestionsForTest(Long testId) {
        return questionRepository.findByTestId(testId);
    }

    public void deleteTest(Long id) {
        testRepository.deleteById(id);
    }
}

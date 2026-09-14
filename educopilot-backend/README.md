# EduCopilot Backend — Person B (Core Features & APIs)

This module covers everything except authentication: **Course, Enrollment, Test,
Question, Option, Submission, Answer** — entities, repositories, services and
REST controllers.

## What's included

| Layer | Files |
|---|---|
| Entities | `Course`, `Enrollment`, `Test`, `Question`, `Option`, `Submission`, `Answer` |
| Repositories | JPA repos for each entity above |
| Services | `CourseService`, `EnrollmentService`, `TestService`, `SubmissionService` (with deterministic MCQ scoring) |
| Controllers | `CourseController`, `EnrollmentController`, `TestController`, `SubmissionController` |

## Note on `User.java`

`model/User.java` in this package is a **stub** — just enough fields
(`id`, `name`, `email`, `role`) so this module compiles and can be tested
standalone. **Person A owns the real `User` entity** (with password hashing,
JWT claims, etc.) in the `feature/backend-auth` branch.

**When merging:** delete this stub and replace references with Person A's
actual `User` entity — the fields used here (`id`, `role`) should already match.

## Running standalone

```bash
mvn spring-boot:run
```

Update `src/main/resources/application.properties` with your PostgreSQL
credentials first. The app runs on port 8080.

## Endpoints

| Area | Endpoint |
|---|---|
| Courses | `POST/GET /api/courses`, `GET /api/courses/{id}`, `GET /api/courses/professor/{id}`, `PUT/DELETE /api/courses/{id}` |
| Enrollment | `POST /api/enrollments`, `GET /api/enrollments/student/{id}`, `GET /api/enrollments/course/{id}` |
| Tests | `POST/GET /api/professor/test`, `POST/GET /api/professor/test/{id}/questions` |
| Submissions | `POST /api/tests/submit`, `GET /api/grading/{submissionId}` |

Import `postman/PersonB-EduCopilot.postman_collection.json` into Postman to
test all endpoints (set `base_url` if not running on `localhost:8080`).

## Git workflow

```bash
git checkout -b feature/backend-courses
# ... build, commit ...
git push origin feature/backend-courses
# open PR into develop, merge after Person A's auth branch is in
# and this module's stub User.java is swapped for the real one
```

## Security notes

- `@PreAuthorize("hasRole('PROFESSOR')")` is already applied to
  create/update/delete endpoints on Course and Test — this depends on
  Person A's JWT + Spring Security setup being in place.
- MCQ/True-False scoring is fully deterministic (no AI call) — see
  `SubmissionService.submitAndScore()`. Short-answer questions are left
  unscored here; the AI service fills in `score` + `aiFeedback` via
  `/api/grading/evaluate` (built by Member 3 — AI/RAG).

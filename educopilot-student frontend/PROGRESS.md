# EduCopilot frontend data mode

## Current mode: local

The frontend contains **no seeded/mock/demo content**. Course, enrollment, material, assessment, account, quiz-result, schedule, and submission records created during frontend development are stored in browser `localStorage` through `src/services/localStore.js`.

### Professor -> Student flow

1. Register a Professor account.
2. Create a course from **Professor → My Courses → Create Course**.
3. Optionally add student email addresses while creating the course.
4. Upload syllabus/lecture material from the course's **Materials** page.
5. Log out and register/login as a Student.
6. The student sees the courses created by professors and the uploaded materials in the course's **Materials** tab.

Changes are broadcast between open tabs using the browser `storage` event/custom event, so two tabs on the same origin can see updates without a page refresh.

## Backend handoff

When the backend developer is ready, set:

`VITE_DATA_MODE=backend`

The service modules already contain the HTTP integration points. In backend mode the frontend stops reading/writing application records from localStorage and uses the configured API endpoints.

There is intentionally **no fallback from backend errors to mock data**. A backend error is shown to the user instead of silently displaying fake records.

import { Routes, Route, Navigate } from 'react-router-dom'

import PublicRoute from './routes/PublicRoute'
import ProtectedRoute from './routes/ProtectedRoute'
import StudentRoute from './routes/StudentRoute'
import ProfessorRoute from './routes/ProfessorRoute'

import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'

import StudentLayout from './components/layout/StudentLayout'
import Dashboard from './pages/student/Dashboard'
import Courses from './pages/student/Courses'
import StudentAssessments from './pages/student/Assessments'
import AssessmentTake from './pages/student/AssessmentTake'
import AssessmentResult from './pages/student/AssessmentResult'
import CourseDetail from './pages/student/CourseDetail'
import AITutor from './pages/student/AITutor'
import StudyPlan from './pages/student/StudyPlan'
import QuizCreate from './pages/student/QuizCreate'
import Quiz from './pages/student/Quiz'
import QuizResult from './pages/student/QuizResult'
import Performance from './pages/student/Performance'
import Revision from './pages/student/Revision'
import StudentProfile from './pages/student/Profile'

import ProfessorLayout from './components/layout/ProfessorLayout'
import ProfessorDashboard from './pages/professor/Dashboard'
import ProfessorCourses from './pages/professor/Courses'
import CourseCreate from './pages/professor/CourseCreate'
import CourseManagement from './pages/professor/CourseManagement'
import CourseMaterials from './pages/professor/CourseMaterials'
import LecturePlanner from './pages/professor/LecturePlanner'
import MaterialGenerator from './pages/professor/MaterialGenerator'
import Assessments from './pages/professor/Assessments'
import AssessmentCreate from './pages/professor/AssessmentCreate'
import Submissions from './pages/professor/Submissions'
import Grading from './pages/professor/Grading'
import Analytics from './pages/professor/Analytics'
import StudentAnalytics from './pages/professor/StudentAnalytics'
import ProfessorProfile from './pages/professor/Profile'

import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Public auth routes — redirect away if already signed in */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>

      {/* Authenticated routes */}
      <Route element={<ProtectedRoute />}>
        {/* Student workspace */}
        <Route element={<StudentRoute />}>
          <Route element={<StudentLayout />}>
            <Route path="/student/dashboard" element={<Dashboard />} />
            <Route path="/student/courses" element={<Courses />} />
            <Route path="/student/assessments" element={<StudentAssessments />} />
            <Route path="/student/courses/:courseId" element={<CourseDetail />} />
            <Route path="/student/tutor" element={<AITutor />} />
            <Route path="/student/tutor/:courseId" element={<AITutor />} />
            <Route path="/student/study-plan" element={<StudyPlan />} />
            <Route path="/student/quiz/create" element={<QuizCreate />} />
            <Route path="/student/performance" element={<Performance />} />
            <Route path="/student/revision" element={<Revision />} />
            <Route path="/student/profile" element={<StudentProfile />} />
          </Route>
          {/* Full-bleed quiz-taking and result screens skip the dashboard chrome */}
          <Route path="/student/quiz/:quizId" element={<Quiz />} />
          <Route path="/student/quiz/:quizId/result" element={<QuizResult />} />
          <Route path="/student/assessments/:assessmentId" element={<AssessmentTake />} />
          <Route path="/student/assessments/:assessmentId/result" element={<AssessmentResult />} />
        </Route>

        {/* Professor workspace */}
        <Route element={<ProfessorRoute />}>
          <Route element={<ProfessorLayout />}>
            <Route path="/professor/dashboard" element={<ProfessorDashboard />} />
            <Route path="/professor/courses" element={<ProfessorCourses />} />
            <Route path="/professor/courses/create" element={<CourseCreate />} />
            <Route path="/professor/courses/:courseId" element={<CourseManagement />} />
            <Route path="/professor/courses/:courseId/materials" element={<CourseMaterials />} />
            <Route path="/professor/planner" element={<LecturePlanner />} />
            <Route path="/professor/material-generator" element={<MaterialGenerator />} />
            <Route path="/professor/assessments" element={<Assessments />} />
            <Route path="/professor/assessments/create" element={<AssessmentCreate />} />
            <Route path="/professor/submissions" element={<Submissions />} />
            <Route path="/professor/grading/:submissionId" element={<Grading />} />
            <Route path="/professor/analytics" element={<Analytics />} />
            <Route path="/professor/analytics/student/:studentId" element={<StudentAnalytics />} />
            <Route path="/professor/profile" element={<ProfessorProfile />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

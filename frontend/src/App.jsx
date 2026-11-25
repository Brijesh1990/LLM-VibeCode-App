import React, { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import PublicRoute from './routes/PublicRoute';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleProtectedRoute from './routes/RoleProtectedRoute';
import AdminLayout from './components/layout/AdminLayout';
import InstructorLayout from './components/layout/InstructorLayout';
import StudentLayout from './components/layout/StudentLayout';
import Loader from './components/common/Loader';

// Public Pages
const LandingPage = lazy(() => import('./pages/public/LandingPage'));
const LoginPage = lazy(() => import('./pages/public/LoginPage'));
const RegisterPage = lazy(() => import('./pages/public/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/public/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/public/ResetPasswordPage'));
const VerifyCertificatePage = lazy(() => import('./pages/public/VerifyCertificatePage'));

// Error Pages
const NotFound = lazy(() => import('./pages/errors/NotFound'));
const Unauthorized = lazy(() => import('./pages/errors/Unauthorized'));

// Admin & Shared Management Pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const ManageUsersPage = lazy(() => import('./pages/admin/ManageUsersPage'));
const ManageStudentsPage = lazy(() => import('./pages/admin/ManageStudentsPage'));
const ManageInstructorsPage = lazy(() => import('./pages/admin/ManageInstructorsPage'));
const ManageCoursesPage = lazy(() => import('./pages/admin/ManageCoursesPage'));
const ManageCategoriesPage = lazy(() => import('./pages/admin/ManageCategoriesPage'));
const ManageModulesPage = lazy(() => import('./pages/admin/ManageModulesPage'));
const ManageBatchesPage = lazy(() => import('./pages/admin/ManageBatchesPage'));
const ManageEnrollmentsPage = lazy(() => import('./pages/admin/ManageEnrollmentsPage'));
const ManageLecturesPage = lazy(() => import('./pages/admin/ManageLecturesPage'));
const ManageMaterialsPage = lazy(() => import('./pages/admin/ManageMaterialsPage'));
const ManageAssignmentsPage = lazy(() => import('./pages/admin/ManageAssignmentsPage'));
const ManageSubmissionsPage = lazy(() => import('./pages/admin/ManageSubmissionsPage'));
const ManageQuizzesPage = lazy(() => import('./pages/admin/ManageQuizzesPage'));
const ManageAttendancePage = lazy(() => import('./pages/admin/ManageAttendancePage'));
const ManagePaymentsPage = lazy(() => import('./pages/admin/ManagePaymentsPage'));
const ManageCertificatesPage = lazy(() => import('./pages/admin/ManageCertificatesPage'));
const ManageNotificationsPage = lazy(() => import('./pages/admin/ManageNotificationsPage'));
const ManageAnnouncementsPage = lazy(() => import('./pages/admin/ManageAnnouncementsPage'));
const ManageReportsPage = lazy(() => import('./pages/admin/ManageReportsPage'));
const SystemSettingsPage = lazy(() => import('./pages/admin/SystemSettingsPage'));
const ProfilePage = lazy(() => import('./pages/admin/ProfilePage'));

// Instructor Pages (All 15 Dedicated Files)
const InstructorDashboard = lazy(() => import('./pages/instructor/InstructorDashboard'));
const InstructorCoursesPage = lazy(() => import('./pages/instructor/InstructorCoursesPage'));
const InstructorBatchesPage = lazy(() => import('./pages/instructor/InstructorBatchesPage'));
const InstructorStudentsPage = lazy(() => import('./pages/instructor/InstructorStudentsPage'));
const InstructorLecturesPage = lazy(() => import('./pages/instructor/InstructorLecturesPage'));
const InstructorMaterialsPage = lazy(() => import('./pages/instructor/InstructorMaterialsPage'));
const InstructorAssignmentsPage = lazy(() => import('./pages/instructor/InstructorAssignmentsPage'));
const InstructorSubmissionsPage = lazy(() => import('./pages/instructor/InstructorSubmissionsPage'));
const InstructorEvaluationsPage = lazy(() => import('./pages/instructor/InstructorEvaluationsPage'));
const InstructorQuizzesPage = lazy(() => import('./pages/instructor/InstructorQuizzesPage'));
const InstructorAttendancePage = lazy(() => import('./pages/instructor/InstructorAttendancePage'));
const InstructorProgressPage = lazy(() => import('./pages/instructor/InstructorProgressPage'));
const InstructorAnnouncementsPage = lazy(() => import('./pages/instructor/InstructorAnnouncementsPage'));
const InstructorNotificationsPage = lazy(() => import('./pages/instructor/InstructorNotificationsPage'));
const InstructorProfilePage = lazy(() => import('./pages/instructor/InstructorProfilePage'));

// Student Pages (All 17 Dedicated Files)
const StudentDashboard = lazy(() => import('./pages/student/StudentDashboard'));
const StudentCoursesPage = lazy(() => import('./pages/student/StudentCoursesPage'));
const StudentCourseDetailsPage = lazy(() => import('./pages/student/StudentCourseDetailsPage'));
const StudentLecturesPage = lazy(() => import('./pages/student/StudentLecturesPage'));
const StudentMaterialsPage = lazy(() => import('./pages/student/StudentMaterialsPage'));
const StudentAssignmentsPage = lazy(() => import('./pages/student/StudentAssignmentsPage'));
const StudentSubmitAssignmentPage = lazy(() => import('./pages/student/StudentSubmitAssignmentPage'));
const StudentSubmissionsPage = lazy(() => import('./pages/student/StudentSubmissionsPage'));
const StudentQuizzesPage = lazy(() => import('./pages/student/StudentQuizzesPage'));
const StudentQuizExamPage = lazy(() => import('./pages/student/StudentQuizExamPage'));
const StudentQuizResultsPage = lazy(() => import('./pages/student/StudentQuizResultsPage'));
const StudentAttendancePage = lazy(() => import('./pages/student/StudentAttendancePage'));
const StudentProgressPage = lazy(() => import('./pages/student/StudentProgressPage'));
const StudentCertificatesPage = lazy(() => import('./pages/student/StudentCertificatesPage'));
const StudentPaymentsPage = lazy(() => import('./pages/student/StudentPaymentsPage'));
const StudentNotificationsPage = lazy(() => import('./pages/student/StudentNotificationsPage'));
const StudentProfilePage = lazy(() => import('./pages/student/StudentProfilePage'));

export default function App() {
  return (
    <Suspense fallback={<Loader fullScreen text="Loading NexusLMS module..." />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/verify-certificate/:certificateId" element={<VerifyCertificatePage />} />

        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>

        {/* Protected Application Routes */}
        <Route element={<ProtectedRoute />}>
          {/* Admin Portal (22 Routes) */}
          <Route
            path="/admin"
            element={
              <RoleProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </RoleProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<ManageUsersPage />} />
            <Route path="students" element={<ManageStudentsPage />} />
            <Route path="instructors" element={<ManageInstructorsPage />} />
            <Route path="courses" element={<ManageCoursesPage />} />
            <Route path="categories" element={<ManageCategoriesPage />} />
            <Route path="modules" element={<ManageModulesPage />} />
            <Route path="batches" element={<ManageBatchesPage />} />
            <Route path="enrollments" element={<ManageEnrollmentsPage />} />
            <Route path="lectures" element={<ManageLecturesPage />} />
            <Route path="materials" element={<ManageMaterialsPage />} />
            <Route path="assignments" element={<ManageAssignmentsPage />} />
            <Route path="submissions" element={<ManageSubmissionsPage />} />
            <Route path="quizzes" element={<ManageQuizzesPage />} />
            <Route path="attendance" element={<ManageAttendancePage />} />
            <Route path="payments" element={<ManagePaymentsPage />} />
            <Route path="certificates" element={<ManageCertificatesPage />} />
            <Route path="notifications" element={<ManageNotificationsPage />} />
            <Route path="announcements" element={<ManageAnnouncementsPage />} />
            <Route path="reports" element={<ManageReportsPage />} />
            <Route path="settings" element={<SystemSettingsPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* Instructor Portal (15 Routes) */}
          <Route
            path="/instructor"
            element={
              <RoleProtectedRoute allowedRoles={['instructor', 'admin']}>
                <InstructorLayout />
              </RoleProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/instructor/dashboard" replace />} />
            <Route path="dashboard" element={<InstructorDashboard />} />
            <Route path="courses" element={<InstructorCoursesPage />} />
            <Route path="batches" element={<InstructorBatchesPage />} />
            <Route path="students" element={<InstructorStudentsPage />} />
            <Route path="lectures" element={<InstructorLecturesPage />} />
            <Route path="materials" element={<InstructorMaterialsPage />} />
            <Route path="assignments" element={<InstructorAssignmentsPage />} />
            <Route path="submissions" element={<InstructorSubmissionsPage />} />
            <Route path="evaluations" element={<InstructorEvaluationsPage />} />
            <Route path="quizzes" element={<InstructorQuizzesPage />} />
            <Route path="attendance" element={<InstructorAttendancePage />} />
            <Route path="progress" element={<InstructorProgressPage />} />
            <Route path="announcements" element={<InstructorAnnouncementsPage />} />
            <Route path="notifications" element={<InstructorNotificationsPage />} />
            <Route path="profile" element={<InstructorProfilePage />} />
          </Route>

          {/* Student Portal (17 Routes) */}
          <Route
            path="/student"
            element={
              <RoleProtectedRoute allowedRoles={['student', 'admin']}>
                <StudentLayout />
              </RoleProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/student/dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="courses" element={<StudentCoursesPage />} />
            <Route path="course/:id" element={<StudentCourseDetailsPage />} />
            <Route path="lectures" element={<StudentLecturesPage />} />
            <Route path="materials" element={<StudentMaterialsPage />} />
            <Route path="assignments" element={<StudentAssignmentsPage />} />
            <Route path="assignments/:id/submit" element={<StudentSubmitAssignmentPage />} />
            <Route path="submissions" element={<StudentSubmissionsPage />} />
            <Route path="quizzes" element={<StudentQuizzesPage />} />
            <Route path="quiz/:id" element={<StudentQuizExamPage />} />
            <Route path="results" element={<StudentQuizResultsPage />} />
            <Route path="attendance" element={<StudentAttendancePage />} />
            <Route path="progress" element={<StudentProgressPage />} />
            <Route path="certificates" element={<StudentCertificatesPage />} />
            <Route path="payments" element={<StudentPaymentsPage />} />
            <Route path="notifications" element={<StudentNotificationsPage />} />
            <Route path="profile" element={<StudentProfilePage />} />
          </Route>
        </Route>

        {/* Error Routes */}
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

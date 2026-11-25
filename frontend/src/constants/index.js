export const APP_NAME = import.meta.env.VITE_APP_NAME || 'NexusLMS Enterprise';
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';
export const BACKEND_ORIGIN = API_BASE_URL.startsWith('http')
  ? API_BASE_URL.replace(/\/api\/v1\/?$/, '')
  : 'http://localhost:8000';

export const ROLES = {
  ADMIN: 'admin',
  INSTRUCTOR: 'instructor',
  STUDENT: 'student',
};

export const ROLE_HOME_PATHS = {
  admin: '/admin/dashboard',
  instructor: '/instructor/dashboard',
  student: '/student/dashboard',
};

export const ADMIN_NAV_ITEMS = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: 'LayoutDashboard' },
  { label: 'Manage Students', path: '/admin/students', icon: 'GraduationCap' },
  { label: 'Manage Instructors', path: '/admin/instructors', icon: 'UserCheck' },
  { label: 'Manage Users', path: '/admin/users', icon: 'Users' },
  { label: 'Courses', path: '/admin/courses', icon: 'BookOpen' },
  { label: 'Categories', path: '/admin/categories', icon: 'FolderKanban' },
  { label: 'Course Modules', path: '/admin/modules', icon: 'Layers' },
  { label: 'Batches & Cohorts', path: '/admin/batches', icon: 'CalendarRange' },
  { label: 'Enrollments', path: '/admin/enrollments', icon: 'ClipboardCheck' },
  { label: 'Lectures', path: '/admin/lectures', icon: 'Video' },
  { label: 'Study Materials', path: '/admin/materials', icon: 'FileText' },
  { label: 'Assignments', path: '/admin/assignments', icon: 'FileCheck2' },
  { label: 'Submissions', path: '/admin/submissions', icon: 'Inbox' },
  { label: 'Quizzes & Exams', path: '/admin/quizzes', icon: 'BrainCircuit' },
  { label: 'Attendance', path: '/admin/attendance', icon: 'CalendarCheck' },
  { label: 'Payments & Fees', path: '/admin/payments', icon: 'CreditCard' },
  { label: 'Certificates', path: '/admin/certificates', icon: 'Award' },
  { label: 'Announcements', path: '/admin/announcements', icon: 'Megaphone' },
  { label: 'Notifications', path: '/admin/notifications', icon: 'Bell' },
  { label: 'Reports & Analytics', path: '/admin/reports', icon: 'BarChart3' },
  { label: 'System Settings', path: '/admin/settings', icon: 'Settings' },
  { label: 'My Profile', path: '/admin/profile', icon: 'UserCog' },
];

export const INSTRUCTOR_NAV_ITEMS = [
  { label: 'My Dashboard', path: '/instructor/dashboard', icon: 'LayoutDashboard' },
  { label: 'My Courses', path: '/instructor/courses', icon: 'BookOpen' },
  { label: 'My Batches', path: '/instructor/batches', icon: 'CalendarRange' },
  { label: 'Student Roster', path: '/instructor/students', icon: 'GraduationCap' },
  { label: 'Manage Lectures', path: '/instructor/lectures', icon: 'Video' },
  { label: 'Study Materials', path: '/instructor/materials', icon: 'FileText' },
  { label: 'Assignments', path: '/instructor/assignments', icon: 'FileCheck2' },
  { label: 'Review Submissions', path: '/instructor/submissions', icon: 'Inbox' },
  { label: 'Evaluate Work', path: '/instructor/evaluations', icon: 'CheckCircle2' },
  { label: 'Quizzes & Questions', path: '/instructor/quizzes', icon: 'BrainCircuit' },
  { label: 'Record Attendance', path: '/instructor/attendance', icon: 'CalendarCheck' },
  { label: 'Student Progress', path: '/instructor/progress', icon: 'TrendingUp' },
  { label: 'Announcements', path: '/instructor/announcements', icon: 'Megaphone' },
  { label: 'Notifications', path: '/instructor/notifications', icon: 'Bell' },
  { label: 'Profile Settings', path: '/instructor/profile', icon: 'UserCog' },
];

export const STUDENT_NAV_ITEMS = [
  { label: 'My Dashboard', path: '/student/dashboard', icon: 'LayoutDashboard' },
  { label: 'My Courses', path: '/student/courses', icon: 'BookOpen' },
  { label: 'My Lectures', path: '/student/lectures', icon: 'Video' },
  { label: 'Study Materials', path: '/student/materials', icon: 'FileText' },
  { label: 'My Assignments', path: '/student/assignments', icon: 'FileCheck2' },
  { label: 'My Submissions', path: '/student/submissions', icon: 'Inbox' },
  { label: 'Available Quizzes', path: '/student/quizzes', icon: 'BrainCircuit' },
  { label: 'Quiz Results', path: '/student/results', icon: 'Trophy' },
  { label: 'My Attendance', path: '/student/attendance', icon: 'CalendarCheck' },
  { label: 'My Progress', path: '/student/progress', icon: 'TrendingUp' },
  { label: 'My Certificates', path: '/student/certificates', icon: 'Award' },
  { label: 'Payments & Receipts', path: '/student/payments', icon: 'CreditCard' },
  { label: 'Notifications', path: '/student/notifications', icon: 'Bell' },
  { label: 'Profile Settings', path: '/student/profile', icon: 'UserCog' },
];

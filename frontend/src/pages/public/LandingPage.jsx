import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  ShieldCheck,
  Award,
  BarChart3,
  Clock,
  Users,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  GraduationCap,
  CalendarRange,
  Video,
  FileText,
  BrainCircuit,
  CreditCard,
  Search,
  Layers,
  ChevronDown,
  Download,
  ExternalLink,
  Megaphone,
  PlayCircle,
  Lock,
  Globe,
  Cpu,
  Check,
} from 'lucide-react';
import api from '../../services/api';
import { paymentService } from '../../services/paymentService';
import { useAuth } from '../../hooks/useAuth';
import { API_BASE_URL, ROLE_HOME_PATHS } from '../../constants';
import { formatCurrency, formatDate } from '../../utils/formatters';
import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import ProgressBar from '../../components/common/ProgressBar';
import {
  ScrollProgressBar,
  BackToTopButton,
  AnimatedCounter,
  RotatingWords,
  ParticleField,
  TiltCard,
  Magnetic,
  Marquee,
} from '../../components/home/HomeEffects';

const HERO_WORDS = ['Learning Platform', 'Cohort Manager', 'Exam Engine', 'Certificate Registry'];

const TECH_STACK = [
  { name: 'React 19', icon: Cpu, color: 'text-cyan-600 bg-cyan-50 border-cyan-200' },
  { name: 'Tailwind CSS 4', icon: Sparkles, color: 'text-sky-600 bg-sky-50 border-sky-200' },
  { name: 'FastAPI', icon: Globe, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  { name: 'SQLAlchemy 2.x', icon: Layers, color: 'text-rose-600 bg-rose-50 border-rose-200' },
  { name: 'MySQL 8', icon: BarChart3, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { name: 'JWT + RBAC', icon: Lock, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
  { name: 'ReportLab PDF', icon: FileText, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { name: 'Recharts', icon: BarChart3, color: 'text-violet-600 bg-violet-50 border-violet-200' },
  { name: 'Framer Motion', icon: PlayCircle, color: 'text-fuchsia-600 bg-fuchsia-50 border-fuchsia-200' },
  { name: 'AOS Animations', icon: Sparkles, color: 'text-teal-600 bg-teal-50 border-teal-200' },
];

const FEATURE_GRID = [
  { icon: Video, title: 'Video Lectures', text: 'Module-organised lectures with completion tracking synced to MySQL.', aos: 'fade-up', tint: 'from-indigo-500 to-violet-500' },
  { icon: FileText, title: 'Study Materials', text: 'Authorised PDF / PPTX / ZIP downloads with server-side validation.', aos: 'fade-down', tint: 'from-cyan-500 to-sky-500' },
  { icon: BrainCircuit, title: 'Timed Quizzes', text: 'Server-timed MCQ exams; answer keys never reach the browser.', aos: 'flip-up', tint: 'from-violet-500 to-fuchsia-500' },
  { icon: Clock, title: 'Attendance', text: 'Daily registers with holiday & approved-leave aware percentages.', aos: 'zoom-in', tint: 'from-emerald-500 to-teal-500' },
  { icon: CreditCard, title: 'Fees & Receipts', text: 'Installment ledger with instant PDF receipts and pending-fee reports.', aos: 'fade-right', tint: 'from-amber-500 to-orange-500' },
  { icon: Award, title: 'Certificates', text: 'ReportLab PDFs with unique numbers and a public verification page.', aos: 'fade-left', tint: 'from-rose-500 to-pink-500' },
];

const JOURNEY_STEPS = [
  { step: '01', title: 'Register & Enroll', text: 'Create an account, pick a program and join a capacity-controlled batch.', icon: GraduationCap },
  { step: '02', title: 'Learn & Submit', text: 'Watch lectures, download materials and upload assignments before deadlines.', icon: BookOpen },
  { step: '03', title: 'Get Assessed', text: 'Attempt server-graded quizzes and receive rubric feedback from faculty.', icon: ShieldCheck },
  { step: '04', title: 'Earn Certificate', text: 'Reach the completion threshold and download your verifiable certificate.', icon: Award },
];

const COURSE_FALLBACK_IMAGES = [
  '/images/course-fullstack.svg',
  '/images/course-genai.svg',
  '/images/course-cloud.svg',
  '/images/course-design.svg',
];

const INSTRUCTOR_FALLBACK_AVATARS = [
  '/images/instructor-marcus.svg',
  '/images/instructor-priya.svg',
  '/images/instructor-david.svg',
];

const ROLE_TOUR_TABS = [
  {
    id: 'admin',
    title: 'Administrator Portal',
    badge: '22 Enterprise Modules',
    credentials: 'admin@lms.com  •  Admin@123',
    accent: 'from-[#4F46E5] to-[#6366F1]',
    summary:
      'Complete institute-level command center with live Recharts revenue & enrollment analytics, faculty/student management, batch capacity controls, fee receipts, certificate issuance, and multi-format CSV/Excel/PDF reporting.',
    highlights: [
      'Executive Dashboard with 9 live MySQL KPI cards & Recharts analytics',
      'Full CRUD for Students, Instructors, Users, Courses, Categories & Modules',
      'Cohort Batch capacity enforcement, date validation & student roster assignment',
      'Manual & installment Fee Ledger with instant ReportLab PDF receipt generation',
      'Automated & manual ReportLab PDF Certificate issuance & revocation registry',
      'Multi-format Report Engine exporting CSV, Excel (.xlsx) & PDF tables',
    ],
    metrics: [
      { label: 'Admin Routes', value: '22 Pages' },
      { label: 'Database Tables', value: '31 MySQL Tables' },
      { label: 'Export Formats', value: 'CSV • XLSX • PDF' },
    ],
  },
  {
    id: 'instructor',
    title: 'Instructor Faculty Portal',
    badge: '15 Academic Modules',
    credentials: 'instructor@lms.com  •  Instructor@123',
    accent: 'from-[#06B6D4] to-[#0284C7]',
    summary:
      'Dedicated faculty workspace scoped strictly to assigned courses and cohorts. Publish lectures, upload study materials, author assignments, grade submissions with rubric feedback, build MCQ exam banks, and mark daily attendance.',
    highlights: [
      'Scoped access to assigned courses, modules, cohorts & student rosters',
      'Video lecture management & drag-and-drop Study Material uploads (PDF/PPTX/ZIP)',
      'Assignment creation with deadlines, late policies & rubric evaluation modal',
      'Timed MCQ Quiz & Question Bank builder with automated backend scoring',
      'Batch attendance marking (Present, Absent, Late, Approved Leave, Holiday)',
      'Real-time Student Progress tracker with 50/30/20 weighted completion formula',
    ],
    metrics: [
      { label: 'Faculty Routes', value: '15 Pages' },
      { label: 'Grading Engine', value: 'Rubric + Auto-MCQ' },
      { label: 'Attendance Audit', value: 'Full Audit Trail' },
    ],
  },
  {
    id: 'student',
    title: 'Student Learning Portal',
    badge: '17 Learning Modules',
    credentials: 'student@lms.com  •  Student@123',
    accent: 'from-[#8B5CF6] to-[#7C3AED]',
    summary:
      'Interactive scholar portal for watching video lectures, downloading study materials, submitting assignments, taking server-timed MCQ examinations, tracking attendance & completion progress, and downloading verified PDF certificates.',
    highlights: [
      'Interactive Course Syllabus player with real-time Lecture Completion toggle',
      'Authorized Study Material downloads & Assignment file dropzone submissions',
      'Server-timed MCQ Examination Room with live countdown & anti-cheat expiry',
      'Detailed Quiz Results transcript with question-by-question answer explanations',
      'Personal Attendance Ledger showing (Present / Eligible) × 100 formula breakdown',
      'One-click ReportLab PDF Certificate & Official Tuition Fee Receipt downloads',
    ],
    metrics: [
      { label: 'Scholar Routes', value: '17 Pages' },
      { label: 'Completion Formula', value: '50% Lec • 30% Asn • 20% Quiz' },
      { label: 'Credentials', value: 'Verifiable PDF' },
    ],
  },
];

const FAQ_ITEMS = [
  {
    q: 'How is the Student Course Completion Percentage calculated?',
    a: 'Course completion is calculated dynamically from real MySQL records using a weighted formula: 50% from completed video lectures, 30% from submitted/evaluated assignments, and 20% from attempted/passed quizzes. If a course only contains specific components, weights normalize automatically. Once a student reaches the course completion threshold (default 75%), their enrollment is marked completed and they unlock PDF certificate issuance.',
  },
  {
    q: 'How does the Server-Side Quiz & Examination Engine prevent score tampering?',
    a: 'When a student starts a quiz, the FastAPI backend records started_at and computes an authoritative expires_at timestamp. Correct answer flags (is_correct) are stripped from all student API responses before submission. When submitted, the backend validates the server timestamp and calculates marks strictly from the MySQL quiz_options table.',
  },
  {
    q: 'What is the Attendance Percentage formula and how are holidays handled?',
    a: 'Attendance Percentage = (Present Classes / Total Eligible Classes) × 100. Sessions marked as Institute Holiday or Cancelled Session, as well as student records marked as Approved Leave, are preserved in the audit log but excluded from the penalty denominator so students are never penalized for holidays or excused leave.',
  },
  {
    q: 'How can employers verify a NexusLMS Certificate?',
    a: 'Every certificate generated by Python ReportLab includes a unique Certificate Number (e.g., CERT-2026-01005-170B9E) and Verification Code. Anyone can verify authenticity instantly using the widget on this page or at /verify-certificate/:certificateId without logging in.',
  },
];

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [overview, setOverview] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [courseSearch, setCourseSearch] = useState('');
  const [previewCourse, setPreviewCourse] = useState(null);
  const [activeRoleTab, setActiveRoleTab] = useState('admin');
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  // Live Certificate Verification Widget state
  const [certQuery, setCertQuery] = useState('CERT-2026-01005');
  const [verifiedCert, setVerifiedCert] = useState(null);
  const [certError, setCertError] = useState('');
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    api
      .get('/public/overview')
      .then((res) => {
        setOverview(res.data);
        if (res.data?.sample_certificate?.certificate_number) {
          setCertQuery(res.data.sample_certificate.certificate_number);
          setVerifiedCert({
            ...res.data.sample_certificate,
            is_valid: !res.data.sample_certificate.is_revoked,
            institute_name: 'Nexus Institute of Technology & Training',
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleQuickVerify = async (e) => {
    if (e) e.preventDefault();
    if (!certQuery.trim()) return;
    setVerifying(true);
    setCertError('');
    try {
      const data = await paymentService.verifyCertificate(certQuery.trim());
      setVerifiedCert(data);
    } catch (err) {
      setVerifiedCert(null);
      setCertError(
        err.response?.data?.detail || 'No certificate matched that number or verification code.'
      );
    } finally {
      setVerifying(false);
    }
  };

  // All figures come from the live /public/overview endpoint; zeros until loaded.
  const stats = overview?.stats || {
    total_students: 0,
    total_instructors: 0,
    total_courses: 0,
    active_batches: 0,
    total_enrollments: 0,
    total_lectures: 0,
    certificates_issued: 0,
  };

  const courses = overview?.courses || [];
  const categories = overview?.categories || [];
  const batches = overview?.batches || [];
  const instructors = overview?.instructors || [];
  const announcements = overview?.announcements || [];

  const filteredCourses = courses.filter((c) => {
    const matchesCat =
      selectedCategory === 'all' || String(c.category_id) === String(selectedCategory);
    const matchesSearch =
      !courseSearch.trim() ||
      c.title.toLowerCase().includes(courseSearch.toLowerCase()) ||
      c.course_code.toLowerCase().includes(courseSearch.toLowerCase()) ||
      c.category_name.toLowerCase().includes(courseSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const currentRoleTour =
    ROLE_TOUR_TABS.find((t) => t.id === activeRoleTab) || ROLE_TOUR_TABS[0];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col selection:bg-[#4F46E5] selection:text-white">
      <ScrollProgressBar />
      <BackToTopButton />
      {/* Top Live Institute Announcement Bar */}
      <div className="bg-slate-950 text-slate-200 text-xs py-2.5 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 truncate">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold text-[11px] border border-indigo-400/30">
              <Megaphone className="w-3 h-3 text-cyan-400" /> LIVE NOTICE
            </span>
            <span className="font-medium text-slate-300 truncate">
              {announcements[0]?.title ||
                '2026 Enterprise Cohort Admissions Open — Live Lectures, Timed Exams & Verified ReportLab Certificates'}
            </span>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              MySQL 8.0 Connected ({stats.total_courses} Courses • {stats.active_batches} Active Cohorts)
            </span>
            <Link
              to="/verify-certificate/CERT-2026-01005"
              className="text-cyan-400 hover:underline font-bold hidden md:inline"
            >
              Verify Credential →
            </Link>
          </div>
        </div>
      </div>

      {/* Sticky Glassmorphism Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#4F46E5] via-[#8B5CF6] to-[#06B6D4] flex items-center justify-center text-white font-black text-lg shadow-md shadow-indigo-500/20">
              NX
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold text-slate-900 tracking-tight">
                  NexusLMS
                </span>
                <span className="hidden sm:inline-block px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-indigo-50 text-[#4F46E5] rounded-full border border-indigo-200/60">
                  Enterprise v1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Institute Learning &amp; Cohort Management Platform
              </p>
            </div>
          </Link>

          {/* Quick Section Navigation */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-bold text-slate-600">
            <a href="#programs" className="hover:text-[#4F46E5] transition-colors">
              Courses ({courses.length})
            </a>
            <a href="#cohorts" className="hover:text-[#4F46E5] transition-colors">
              Live Batches ({batches.length})
            </a>
            <a href="#platform-tour" className="hover:text-[#4F46E5] transition-colors">
              Role Portals
            </a>
            <a href="#faculty" className="hover:text-[#4F46E5] transition-colors">
              Faculty ({instructors.length})
            </a>
            <a href="#certificates" className="hover:text-[#4F46E5] transition-colors">
              Verify Certificate
            </a>
            <a href="#faq" className="hover:text-[#4F46E5] transition-colors">
              Policies &amp; FAQ
            </a>
          </nav>

          <div className="flex items-center gap-2.5">
            {user ? (
              <Link
                to={ROLE_HOME_PATHS[user.role] || '/student/dashboard'}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#4F46E5] to-[#6366F1] hover:opacity-95 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-500/20 transition-all"
              >
                Open {user.role.toUpperCase()} Portal <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-bold transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#4F46E5] via-[#6366F1] to-[#06B6D4] hover:opacity-95 text-white text-xs sm:text-sm font-bold shadow-md shadow-indigo-500/20 transition-all"
                >
                  Enroll Now <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* HERO SECTION WITH VISUAL DASHBOARD ILLUSTRATION & FLOATING GLASS CARDS */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-16 lg:pb-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-950 via-[#131136] to-[#0F172A] text-white">
        {/* Animated Aurora Glows, Grid & Particles */}
        <div className="pointer-events-none absolute inset-0 hero-grid animate-grid" />
        <div className="pointer-events-none absolute -top-24 -left-24 w-[28rem] h-[28rem] rounded-full bg-[#4F46E5]/30 blur-3xl animate-aurora" />
        <div className="pointer-events-none absolute top-1/3 right-0 w-[26rem] h-[26rem] rounded-full bg-[#06B6D4]/25 blur-3xl animate-aurora-slow" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 w-96 h-96 rounded-full bg-[#8B5CF6]/25 blur-3xl animate-aurora" />
        <ParticleField count={30} />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Left Hero Column */}
          <motion.div
            className="lg:col-span-6 space-y-6"
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12 } } }}
          >
            <motion.div
              variants={{ hidden: { opacity: 0, y: -14 }, show: { opacity: 1, y: 0 } }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-cyan-300 text-xs font-bold"
            >
              <span className="relative flex w-2 h-2">
                <span className="absolute inset-0 rounded-full bg-emerald-400 animate-pulse-ring" />
                <span className="relative w-2 h-2 rounded-full bg-emerald-400" />
              </span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              React 19 • Tailwind CSS 4 • FastAPI • SQLAlchemy 2.x • MySQL 8
            </motion.div>

            <motion.h1
              variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}
              className="text-4xl sm:text-5xl lg:text-[56px] font-extrabold tracking-tight leading-[1.1]"
            >
              The Enterprise{' '}
              <span className="block min-h-[1.2em] bg-gradient-to-r from-cyan-300 via-indigo-300 to-fuchsia-300 bg-clip-text text-transparent animate-gradient-pan">
                <RotatingWords words={HERO_WORDS} />
              </span>
              for Modern Institutes.
            </motion.h1>

            <motion.p
              variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }}
              className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl"
            >
              Empower your training institute with role-based Admin, Instructor, and Student portals. Deliver video lectures, study materials, rubric-graded assignments, server-timed MCQ exams, automated attendance, fee receipts, and verifiable ReportLab PDF certificates.
            </motion.p>

            {/* Feature Pills */}
            <motion.div
              variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }}
              className="grid grid-cols-2 gap-2.5 pt-1 max-w-lg text-xs font-semibold text-slate-200"
            >
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>31-Table MySQL 8 Persistence</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Server-Timed Anti-Cheat Exams</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                <CheckCircle2 className="w-4 h-4 text-violet-400 shrink-0" />
                <span>ReportLab PDF Certificates</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>CSV, Excel &amp; PDF Analytics</span>
              </div>
            </motion.div>

            {/* Hero CTA Buttons */}
            <motion.div
              variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }}
              className="flex flex-wrap items-center gap-3.5 pt-2"
            >
              <Magnetic>
                <Link
                  to="/login"
                  className="btn-shine inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#4F46E5] via-[#6366F1] to-[#06B6D4] animate-gradient-pan text-white font-extrabold text-sm shadow-xl shadow-indigo-500/40 hover:shadow-cyan-500/40 transition-shadow"
                >
                  Launch Role Portals (1-Click Demo) <ArrowRight className="w-4 h-4" />
                </Link>
              </Magnetic>
              <Magnetic>
                <a
                  href="#programs"
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-sm backdrop-blur-md transition-all"
                >
                  <BookOpen className="w-4 h-4 text-cyan-300" /> Browse Courses
                </a>
              </Magnetic>
            </motion.div>

            {/* One-Click Demo Role Quick Bar */}
            <motion.div
              variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } }}
              className="pt-4 border-t border-white/10"
            >
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2.5">
                Instant Demo Portal Access — Click Any Role to Sign In:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  {
                    role: 'Admin Portal',
                    cred: 'admin@lms.com',
                    sub: '22 Modules • Full Control',
                    cls: 'border-indigo-400/40 bg-indigo-500/15 hover:bg-indigo-500/25',
                  },
                  {
                    role: 'Instructor Portal',
                    cred: 'instructor@lms.com',
                    sub: '15 Modules • Cohort & Exams',
                    cls: 'border-cyan-400/40 bg-cyan-500/15 hover:bg-cyan-500/25',
                  },
                  {
                    role: 'Student Portal',
                    cred: 'student@lms.com',
                    sub: '17 Modules • Learn & Certs',
                    cls: 'border-violet-400/40 bg-violet-500/15 hover:bg-violet-500/25',
                  },
                ].map((d) => (
                  <motion.div key={d.role} whileHover={{ y: -4, scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    to="/login"
                    className={`p-3 rounded-xl border transition-all block ${d.cls}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-white">{d.role}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-cyan-300" />
                    </div>
                    <p className="text-[11px] font-mono text-cyan-200 mt-0.5">{d.cred}</p>
                    <p className="text-[10px] text-slate-300 mt-0.5">{d.sub}</p>
                  </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Right Hero Column — Visual Dashboard Preview SVG + Floating Animated Cards */}
          <motion.div
            className="lg:col-span-6 relative"
            initial={{ opacity: 0, x: 60, rotateY: -12 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: 'easeOut' }}
            style={{ perspective: 1200 }}
          >
            <div className="pointer-events-none absolute -inset-6 rounded-[2rem] border border-dashed border-cyan-400/20 animate-spin-slow" style={{ animationDuration: '40s' }} />
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="gradient-border relative rounded-3xl overflow-hidden shadow-2xl shadow-indigo-950/60 bg-slate-900/80"
            >
              <img
                src="/images/hero-dashboard.svg"
                alt="NexusLMS Executive Dashboard Preview"
                className="w-full h-auto object-cover"
              />
            </motion.div>

            {/* Floating Glass Card 1 — Verified Certificate Badge */}
            <motion.div
              initial={{ y: 0 }}
              animate={{ y: [-6, 6, -6] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="hidden sm:flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-emerald-400/40 shadow-xl absolute -bottom-6 -left-6"
            >
              <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400">
                  ReportLab Server PDF
                </span>
                <p className="text-xs font-bold text-white">Verifiable Completion Certificates</p>
                <p className="text-[11px] text-slate-400">Public Registry Lookup Included</p>
              </div>
            </motion.div>

            {/* Floating Glass Card 2 — Server-Side Quiz Timer */}
            <motion.div
              initial={{ y: 0 }}
              animate={{ y: [6, -6, 6] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
              className="hidden sm:flex items-center gap-3 p-3.5 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-cyan-400/40 shadow-xl absolute -top-5 -right-4"
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-300">
                  Zero Client Score Trust
                </span>
                <p className="text-xs font-bold text-white">Server-Graded MCQ Exams</p>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll cue */}
        <motion.a
          href="#kpis"
          aria-label="Scroll to statistics"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          className="hidden lg:flex absolute bottom-14 left-1/2 -translate-x-1/2 z-10 flex-col items-center gap-1 text-slate-400 text-[10px] font-bold uppercase tracking-widest"
        >
          Scroll <ChevronDown className="w-4 h-4" />
        </motion.a>
      </section>

      {/* LIVE DATABASE KPI METRICS RIBBON */}
      <section id="kpis" className="relative z-20 -mt-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div
          data-aos="zoom-in"
          className="gradient-border bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-indigo-500/10 p-6 sm:p-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6"
        >
          {[
            {
              label: 'Published Programs',
              value: stats.total_courses,
              sub: 'Industry-aligned curricula',
              icon: BookOpen,
              color: 'text-[#4F46E5] bg-indigo-50',
            },
            {
              label: 'Active Cohorts',
              value: stats.active_batches,
              sub: 'Live scheduled batches',
              icon: CalendarRange,
              color: 'text-[#06B6D4] bg-cyan-50',
            },
            {
              label: 'Enrolled Scholars',
              value: stats.total_students,
              sub: `${stats.total_enrollments} course enrollments`,
              icon: GraduationCap,
              color: 'text-[#8B5CF6] bg-violet-50',
            },
            {
              label: 'Expert Faculty',
              value: stats.total_instructors,
              sub: 'Ph.D. & Principal Architects',
              icon: Users,
              color: 'text-emerald-600 bg-emerald-50',
            },
            {
              label: 'Video Lectures',
              value: stats.total_lectures,
              sub: 'With downloadable PDFs',
              icon: Video,
              color: 'text-amber-600 bg-amber-50',
            },
            {
              label: 'Issued Certificates',
              value: stats.certificates_issued,
              sub: '100% publicly verifiable',
              icon: Award,
              color: 'text-rose-600 bg-rose-50',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              data-aos="flip-up"
              data-aos-delay={idx * 90}
              className="group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500">{item.label}</span>
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${item.color} group-hover:scale-110 group-hover:rotate-6 transition-transform`}
                >
                  <item.icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900">
                <AnimatedCounter value={item.value} />
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">{item.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TECHNOLOGY MARQUEE */}
      <section className="pt-14 pb-4 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8" data-aos="fade-up">
        <p className="text-center text-[11px] font-extrabold uppercase tracking-[0.25em] text-slate-400 mb-5">
          Built on a modern, production-grade stack
        </p>
        <Marquee>
          {TECH_STACK.map((t) => (
            <span
              key={t.name}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-sm font-bold whitespace-nowrap ${t.color}`}
            >
              <t.icon className="w-4 h-4" /> {t.name}
            </span>
          ))}
        </Marquee>
      </section>

      {/* FEATURE GRID WITH TILT + SPOTLIGHT CARDS */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-12" data-aos="fade-down">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 text-violet-700 text-xs font-extrabold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Everything In One Platform
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">
            One platform for the{' '}
            <span className="bg-gradient-to-r from-[#4F46E5] via-[#8B5CF6] to-[#06B6D4] bg-clip-text text-transparent animate-gradient-pan">
              whole learning lifecycle
            </span>
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Every module below is a real screen connected to the FastAPI backend and MySQL database.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURE_GRID.map((f, idx) => (
            <div key={f.title} data-aos={f.aos} data-aos-delay={idx * 80}>
              <TiltCard className="h-full bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs hover:shadow-2xl hover:shadow-indigo-500/10 transition-shadow">
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.tint} text-white flex items-center justify-center shadow-lg mb-4`}
                >
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-extrabold text-slate-900">{f.title}</h3>
                <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">{f.text}</p>
              </TiltCard>
            </div>
          ))}
        </div>
      </section>

      {/* LEARNING JOURNEY TIMELINE */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 border-y border-slate-200/80 relative overflow-hidden">
        <div className="pointer-events-none absolute -top-20 right-10 w-72 h-72 rounded-full bg-violet-300/20 blur-3xl animate-aurora" />
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center max-w-2xl mx-auto mb-12" data-aos="fade-up">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 text-xs font-extrabold uppercase tracking-wider border border-cyan-200">
              <GraduationCap className="w-3.5 h-3.5" /> Your Learning Journey
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-2">From enrollment to certification</h2>
          </div>
          <div className="relative grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="hidden md:block absolute top-9 left-[12%] right-[12%] h-1 rounded-full bg-gradient-to-r from-[#4F46E5] via-[#8B5CF6] to-[#06B6D4] animate-gradient-pan opacity-40" />
            {JOURNEY_STEPS.map((s, idx) => (
              <div
                key={s.step}
                data-aos={idx % 2 === 0 ? 'fade-up' : 'fade-down'}
                data-aos-delay={idx * 120}
                className="relative text-center"
              >
                <motion.div
                  whileHover={{ scale: 1.12, rotate: 6 }}
                  className="relative mx-auto w-[72px] h-[72px] rounded-3xl bg-white border-2 border-indigo-100 shadow-xl flex items-center justify-center text-[#4F46E5] z-10"
                >
                  <s.icon className="w-8 h-8" />
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gradient-to-br from-[#4F46E5] to-[#06B6D4] text-white text-[10px] font-black flex items-center justify-center shadow-md">
                    {s.step}
                  </span>
                </motion.div>
                <h3 className="text-base font-extrabold text-slate-900 mt-4">{s.title}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-[220px] mx-auto">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED COURSES CATALOG WITH THUMBNAIL ARTWORK, CATEGORY TABS & SYLLABUS MODAL */}
      <section id="programs" className="py-16 lg:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8" data-aos="fade-up">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-[#4F46E5] text-xs font-extrabold uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5" /> Live MySQL Course Catalog
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">
              Career-Defining Engineering Programs
            </h2>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              Every program includes structured modules, HD video lectures, downloadable PDF/PPTX handbooks, hands-on capstone assignments, server-graded MCQ exams, and an official ReportLab PDF certificate.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={courseSearch}
              onChange={(e) => setCourseSearch(e.target.value)}
              placeholder="Search courses or code..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-[#4F46E5]"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 mb-8" data-aos="fade-up">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#4F46E5] text-white shadow-md shadow-indigo-500/20'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            All Programs ({courses.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(String(cat.id))}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                String(selectedCategory) === String(cat.id)
                  ? 'bg-[#4F46E5] text-white shadow-md shadow-indigo-500/20'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {cat.name} ({cat.courses_count})
            </button>
          ))}
        </div>

        {/* Course Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredCourses.map((course, idx) => {
            const thumb =
              course.thumbnail_url ||
              COURSE_FALLBACK_IMAGES[idx % COURSE_FALLBACK_IMAGES.length];
            const avatar =
              INSTRUCTOR_FALLBACK_AVATARS[idx % INSTRUCTOR_FALLBACK_AVATARS.length];

            return (
              <div key={course.id} data-aos="zoom-in" data-aos-delay={idx * 70}>
              <TiltCard
                max={6}
                className="group h-full bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-2xl hover:shadow-indigo-500/15 transition-shadow duration-300 overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Course Cover Image */}
                  <div className="relative h-44 w-full overflow-hidden bg-slate-900">
                    <img
                      src={thumb}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-slate-900/80 text-cyan-300 backdrop-blur-md border border-white/15">
                        {course.category_name}
                      </span>
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/95 text-slate-900 shadow-xs">
                        {course.level}
                      </span>
                    </div>
                    <div className="absolute bottom-2.5 left-3">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-indigo-600/90 text-white">
                        {course.course_code}
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5">
                    <h3 className="text-base font-extrabold text-slate-900 line-clamp-2 group-hover:text-[#4F46E5] transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-3 mt-2 leading-relaxed">
                      {course.description}
                    </p>

                    {/* Instructor Mini Profile */}
                    <div className="flex items-center gap-2.5 mt-4 pt-3 border-t border-slate-100">
                      <img
                        src={avatar}
                        alt={course.instructor_name}
                        className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-100"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">
                          {course.instructor_name}
                        </p>
                        <p className="text-[10px] text-slate-500">Lead Cohort Faculty</p>
                      </div>
                    </div>

                    {/* Metrics Pills */}
                    <div className="grid grid-cols-3 gap-2 mt-4 p-2.5 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                      <div>
                        <p className="text-[10px] text-slate-400 font-semibold">Duration</p>
                        <p className="text-xs font-extrabold text-slate-800">
                          {course.duration_weeks}w ({course.duration_hours}h)
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-semibold">Modules</p>
                        <p className="text-xs font-extrabold text-[#4F46E5]">
                          {course.modules?.length || 3} Units
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-semibold">Scholars</p>
                        <p className="text-xs font-extrabold text-emerald-700">
                          {course.enrollments_count} Active
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Price & Action Footer */}
                <div className="px-5 pb-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">
                      Full Tuition
                    </span>
                    <span className="text-lg font-black text-slate-900">
                      {formatCurrency(course.fee)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setPreviewCourse(course)}
                      className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Syllabus
                    </button>
                    <Link
                      to={
                        user
                          ? user.role === 'student'
                            ? `/student/courses?enroll=${course.id}`
                            : `/${user.role}/courses`
                          : `/login?redirect=/student/courses?enroll=${course.id}`
                      }
                      className="px-3.5 py-2 rounded-xl bg-[#4F46E5] hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors"
                    >
                      Enroll →
                    </Link>
                  </div>
                </div>
              </TiltCard>
              </div>
            );
          })}
        </div>
        {filteredCourses.length === 0 && (
          <div className="text-center py-14 rounded-3xl border border-dashed border-slate-300 bg-white" data-aos="fade-up">
            <Search className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700 mt-2">
              {overview ? 'No programs match your search.' : 'Loading live course catalog…'}
            </p>
          </div>
        )}
      </section>

      {/* UPCOMING LIVE COHORTS & BATCH SCHEDULE SECTION */}
      <section
        id="cohorts"
        className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-y border-slate-200/80"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10" data-aos="fade-up">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 text-xs font-extrabold uppercase tracking-wider">
                <CalendarRange className="w-3.5 h-3.5" /> Live Cohort Schedule
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 mt-2">
                Active &amp; Upcoming Training Batches
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Strict capacity limits ensure personalized mentorship, live Q&amp;A, and daily attendance tracking.
              </p>
            </div>
            <Link
              to="/register"
              className="mt-4 sm:mt-0 inline-flex items-center gap-1.5 text-sm font-bold text-[#4F46E5] hover:underline"
            >
              Reserve Your Cohort Seat <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {batches.map((batch, idx) => {
              const occupancyPct = Math.round(
                ((batch.enrolled_count || 0) / Math.max(batch.capacity || 30, 1)) * 100
              );
              return (
                <div
                  key={batch.id}
                  data-aos="fade-up"
                  data-aos-delay={idx * 80}
                  className="rounded-3xl border border-slate-200/90 bg-[#F8FAFC] p-6 hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="font-mono text-xs font-extrabold text-[#4F46E5] bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200/60">
                        {batch.batch_code}
                      </span>
                      <StatusBadge status={batch.status} />
                    </div>
                    <h3 className="text-lg font-extrabold text-slate-900">{batch.name}</h3>
                    <p className="text-xs font-semibold text-[#4F46E5] mt-1">{batch.course_title}</p>

                    <div className="mt-4 space-y-2 text-xs text-slate-600 bg-white p-4 rounded-2xl border border-slate-200/70">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Faculty Lead:</span>
                        <span className="font-bold text-slate-800">{batch.instructor_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Class Days:</span>
                        <span className="font-bold text-slate-800">{batch.class_days}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Timing:</span>
                        <span className="font-bold text-slate-800">{batch.class_timing}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Term Dates:</span>
                        <span className="font-semibold text-slate-700">
                          {formatDate(batch.start_date)} → {formatDate(batch.end_date)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-200/70 space-y-3">
                    <ProgressBar
                      value={occupancyPct}
                      label={`Seat Occupancy (${batch.enrolled_count}/${batch.capacity})`}
                      color="indigo"
                      size="sm"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-700">
                        {batch.available_seats} Seats Remaining
                      </span>
                      <Link
                        to="/login"
                        className="px-4 py-2 rounded-xl bg-[#4F46E5] hover:bg-indigo-700 text-white text-xs font-bold transition-colors"
                      >
                        Join Cohort →
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* INTERACTIVE THREE-ROLE PLATFORM ARCHITECTURE TOUR */}
      <section id="platform-tour" className="py-16 lg:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-10" data-aos="fade-up">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 text-violet-700 text-xs font-extrabold uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5" /> Role-Based SaaS Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">
            Three Dedicated Portals. One Unified MySQL Database.
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Explore how Administrators, Faculty Instructors, and Enrolled Students collaborate seamlessly across 54 protected routes.
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-8" data-aos="fade-up">
          {ROLE_TOUR_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveRoleTab(tab.id)}
              className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
                activeRoleTab === tab.id
                  ? `bg-gradient-to-r ${tab.accent} text-white shadow-lg`
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>{tab.title}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] ${
                  activeRoleTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {tab.badge}
              </span>
            </button>
          ))}
        </div>

        {/* Active Role Detail Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentRoleTour.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12"
          >
            <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-indigo-50 text-[#4F46E5]">
                    {currentRoleTour.badge}
                  </span>
                  <code className="px-3 py-1 rounded-xl bg-slate-900 text-cyan-300 text-xs font-mono font-bold">
                    Demo: {currentRoleTour.credentials}
                  </code>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {currentRoleTour.title}
                </h3>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  {currentRoleTour.summary}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
                  {currentRoleTour.highlights.map((h, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/60 text-xs text-slate-700 font-medium"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-6">
                  {currentRoleTour.metrics.map((m, i) => (
                    <div key={i}>
                      <p className="text-[11px] font-semibold text-slate-400">{m.label}</p>
                      <p className="text-sm font-extrabold text-slate-900">{m.value}</p>
                    </div>
                  ))}
                </div>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#4F46E5] hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition-all"
                >
                  Test {currentRoleTour.title} Now <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 flex flex-col justify-between text-white">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-cyan-300">
                  Live Architecture Visual
                </span>
                <h4 className="text-lg font-extrabold mt-1">
                  Real FastAPI + MySQL 8 Integration
                </h4>
                <p className="text-xs text-slate-300 mt-1">
                  Every table, chart, form, file upload, and PDF download is wired directly to `/api/v1/*`.
                </p>
              </div>
              <img
                src="/images/hero-dashboard.svg"
                alt="Portal Architecture Visual"
                className="w-full h-auto rounded-2xl border border-white/15 my-4 shadow-lg"
              />
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>JWT Access + Refresh Rotation</span>
                <span className="text-emerald-400 font-bold">✓ RBAC Enforced</span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </section>

      {/* DISTINGUISHED FACULTY & MENTORS SECTION */}
      <section id="faculty" className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12" data-aos="fade-up">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-[#4F46E5] text-xs font-extrabold uppercase tracking-wider">
              <Users className="w-3.5 h-3.5" /> Distinguished Faculty
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-2">
              Learn From Principal Architects &amp; Researchers
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Our instructors bring real-world distributed systems, AI research, and cloud security expertise directly into your cohort.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {instructors.map((ins, idx) => {
              const avatar =
                ins.avatar_url ||
                INSTRUCTOR_FALLBACK_AVATARS[idx % INSTRUCTOR_FALLBACK_AVATARS.length];
              return (
                <div
                  key={ins.id}
                  data-aos="fade-up"
                  data-aos-delay={idx * 80}
                  className="bg-[#F8FAFC] rounded-3xl p-6 border border-slate-200/90 hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-4 mb-4">
                      <img
                        src={avatar}
                        alt={ins.full_name}
                        className="w-16 h-16 rounded-2xl object-cover ring-4 ring-white shadow-md"
                      />
                      <div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-[#4F46E5] border border-indigo-200/60">
                          {ins.designation || 'Principal Faculty'}
                        </span>
                        <h3 className="text-lg font-extrabold text-slate-900 mt-1">
                          {ins.full_name}
                        </h3>
                        <p className="text-xs text-slate-500">{ins.department}</p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white border border-slate-200/70 text-xs space-y-1.5">
                      <p className="text-slate-700">
                        <strong className="text-slate-900">Qualification:</strong>{' '}
                        {ins.qualification || 'Ph.D. / M.S. Computer Science'}
                      </p>
                      <p className="text-slate-700">
                        <strong className="text-slate-900">Specialization:</strong>{' '}
                        {ins.specialization}
                      </p>
                      <p className="text-slate-700">
                        <strong className="text-slate-900">Experience:</strong>{' '}
                        {ins.experience_years}+ Years Industry &amp; Teaching
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/70 flex items-center justify-between text-xs">
                    <span className="font-bold text-[#4F46E5]">
                      {ins.assigned_courses_count || 1} Active Program(s)
                    </span>
                    <span className="font-mono text-slate-400">{ins.employee_code}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* LIVE PUBLIC CERTIFICATE VERIFICATION & CREDENTIAL SHOWCASE */}
      <section
        id="certificates"
        className="py-16 lg:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white"
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Certificate Preview Illustration */}
          <div className="lg:col-span-6" data-aos="fade-right">
            <div className="rounded-3xl overflow-hidden border-2 border-indigo-400/40 shadow-2xl bg-white p-2">
              <img
                src="/images/certificate-preview.svg"
                alt="Official NexusLMS Certificate of Completion Preview"
                className="w-full h-auto rounded-2xl"
              />
            </div>
          </div>

          {/* Right Interactive Live Verification Widget */}
          <div className="lg:col-span-6 space-y-5" data-aos="fade-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-extrabold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" /> Instant Public Credential Registry
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Verifiable ReportLab PDF Certificates
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Every certificate is generated server-side by Python ReportLab with a unique cryptographic Certificate Number and Verification Code. Test our live MySQL verification engine right below:
            </p>

            <form onSubmit={handleQuickVerify} className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="text"
                value={certQuery}
                onChange={(e) => setCertQuery(e.target.value)}
                placeholder="Enter Certificate No (e.g. CERT-2026-01005)"
                className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-400 text-sm focus:outline-none focus:border-cyan-400"
              />
              <button
                type="submit"
                disabled={verifying}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#06B6D4] to-[#4F46E5] hover:opacity-95 text-white font-extrabold text-sm shadow-lg cursor-pointer"
              >
                {verifying ? 'Verifying...' : 'Verify Live →'}
              </button>
            </form>

            {certError && (
              <div className="p-4 rounded-2xl bg-red-500/20 border border-red-400/40 text-xs text-red-200 font-semibold">
                {certError}
              </div>
            )}

            {verifiedCert && (
              <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-emerald-400/40 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-300 block">
                      ✓ Authentic &amp; Active Record in MySQL
                    </span>
                    <h4 className="text-base font-extrabold text-white font-mono">
                      {verifiedCert.certificate_number}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={`${API_BASE_URL}/certificates/${verifiedCert.id}/download`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" /> Download PDF
                    </a>
                    <Link
                      to={`/verify-certificate/${verifiedCert.certificate_number}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold"
                    >
                      Full Page <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block">Recipient Scholar</span>
                    <span className="font-bold text-white">{verifiedCert.student_name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Final Grade &amp; Score</span>
                    <span className="font-bold text-emerald-300">
                      Grade {verifiedCert.grade} ({verifiedCert.final_percentage}%)
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Verification Code</span>
                    <span className="font-mono font-bold text-cyan-300">
                      {verifiedCert.verification_code}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* POLICIES & INTERACTIVE FAQ ACCORDION */}
      <section id="faq" className="py-16 lg:py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        <div className="text-center mb-10" data-aos="fade-up">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-[#4F46E5] text-xs font-extrabold uppercase tracking-wider">
            Academic Policies &amp; Architecture FAQ
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-2">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? -1 : idx)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="text-sm sm:text-base font-extrabold text-slate-900">
                    {item.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#4F46E5] shrink-0 transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                        {item.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* ANIMATED CALL-TO-ACTION BANNER */}
      <section className="px-4 sm:px-6 lg:px-8 pb-20 max-w-7xl mx-auto w-full">
        <div
          data-aos="zoom-in"
          className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-[#4F46E5] via-[#8B5CF6] to-[#06B6D4] animate-gradient-pan p-10 sm:p-14 text-white shadow-2xl shadow-indigo-500/30"
        >
          <div className="pointer-events-none absolute inset-0 hero-grid opacity-60" />
          <div className="pointer-events-none absolute -right-16 -top-16 w-72 h-72 rounded-full border-[28px] border-white/10 animate-spin-slow" />
          <div className="pointer-events-none absolute -left-10 -bottom-20 w-60 h-60 rounded-full bg-white/10 blur-2xl animate-aurora" />
          <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight" data-aos="fade-right">
                Ready to transform how your institute teaches?
              </h2>
              <p className="text-sm sm:text-base text-white/85 mt-3" data-aos="fade-right" data-aos-delay="100">
                Join <AnimatedCounter value={stats.total_students} /> scholars learning across{' '}
                <AnimatedCounter value={stats.total_courses} /> programs and{' '}
                <AnimatedCounter value={stats.active_batches} /> live cohorts today.
              </p>
            </div>
            <div className="flex flex-wrap gap-3" data-aos="fade-left">
              <Magnetic>
                <Link
                  to="/register"
                  className="btn-shine inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white text-[#4F46E5] font-extrabold text-sm shadow-xl hover:shadow-2xl transition-shadow"
                >
                  Create Free Account <ArrowRight className="w-4 h-4" />
                </Link>
              </Magnetic>
              <Magnetic>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl border-2 border-white/60 hover:bg-white/10 text-white font-bold text-sm transition-colors"
                >
                  Sign In
                </Link>
              </Magnetic>
            </div>
          </div>
        </div>
      </section>

      {/* ENTERPRISE FOOTER */}
      <footer className="bg-slate-950 text-slate-400 py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-800">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#4F46E5] to-[#06B6D4] flex items-center justify-center text-white font-black text-sm">
                NX
              </div>
              <span className="text-lg font-extrabold text-white">NexusLMS Enterprise</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Production-Ready Full-Stack Learning Management System built with React 19, Tailwind CSS 4, Python FastAPI, SQLAlchemy 2.x, and MySQL 8+.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white mb-3">
              Role Portals
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/login" className="hover:text-white">
                  Administrator Dashboard (/admin/dashboard)
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white">
                  Instructor Faculty Portal (/instructor/dashboard)
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white">
                  Student Learning Portal (/student/dashboard)
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white">
                  New Scholar Registration (/register)
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white mb-3">
              Verification &amp; APIs
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/verify-certificate/CERT-2026-01005" className="hover:text-white">
                  Public Certificate Verification
                </Link>
              </li>
              <li>
                <a href="http://localhost:8000/api/v1" target="_blank" rel="noreferrer" className="hover:text-white">
                  REST API v1 Root Index (:8000/api/v1)
                </a>
              </li>
              <li>
                <a href="http://localhost:8000/docs" target="_blank" rel="noreferrer" className="hover:text-white">
                  OpenAPI / Swagger UI (:8000/docs)
                </a>
              </li>
              <li>
                <a href="http://localhost:8000/api/v1/health" target="_blank" rel="noreferrer" className="hover:text-white">
                  System &amp; MySQL Health Check
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white mb-3">
              Institute Campus
            </h4>
            <p className="text-xs leading-relaxed">
              450 Innovation Way, Tech Park Suite 800
              <br />
              San Francisco, CA 94107
              <br />
              admissions@nexuslms.edu
              <br />
              +1 (800) 555-0199
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between text-xs gap-2">
          <span>© {new Date().getFullYear()} NexusLMS Enterprise. All rights reserved.</span>
          <span>React 19 • Vite • Tailwind CSS 4 • FastAPI • SQLAlchemy 2.x • MySQL 8</span>
        </div>
      </footer>

      {/* COURSE SYLLABUS PREVIEW MODAL */}
      <Modal
        isOpen={!!previewCourse}
        onClose={() => setPreviewCourse(null)}
        title={previewCourse?.title || 'Course Syllabus'}
        subtitle={`${previewCourse?.course_code || ''} • Instructor: ${previewCourse?.instructor_name || ''}`}
      >
        {previewCourse && (
          <div className="space-y-4">
            <img
              src={previewCourse.thumbnail_url || '/images/course-fullstack.svg'}
              alt={previewCourse.title}
              className="w-full h-44 object-cover rounded-2xl"
            />
            <p className="text-xs text-slate-600 leading-relaxed">{previewCourse.description}</p>
            <div className="space-y-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                Course Modules ({previewCourse.modules?.length || 0})
              </h4>
              {(previewCourse.modules || []).map((m) => (
                <div
                  key={m.id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80"
                >
                  <p className="text-sm font-bold text-slate-900">{m.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{m.description}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div>
                <span className="text-xs text-slate-400 block">Tuition Fee</span>
                <span className="text-xl font-black text-slate-900">
                  {formatCurrency(previewCourse.fee)}
                </span>
              </div>
              <Link
                to={
                  user
                    ? user.role === 'student'
                      ? `/student/courses?enroll=${previewCourse.id}`
                      : `/${user.role}/courses`
                    : `/login?redirect=/student/courses?enroll=${previewCourse.id}`
                }
                onClick={() => setPreviewCourse(null)}
                className="px-5 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all"
              >
                {user ? 'Enroll via Gateway (Test Key) →' : 'Sign In to Enroll →'}
              </Link>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

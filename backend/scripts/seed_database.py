"""Seed script populating synthetic demonstration records across all 31 tables in MySQL."""
from datetime import date, datetime, timedelta
from decimal import Decimal
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.core.security import hash_password
from app.database.session import SessionLocal
from app.models.announcement import Announcement
from app.models.assignment import Assignment
from app.models.attendance import Attendance
from app.models.batch import Batch, BatchStudent
from app.models.course import Course
from app.models.course_category import CourseCategory
from app.models.course_module import CourseModule
from app.models.enrollment import Enrollment
from app.models.lecture import Lecture, LectureProgress
from app.models.notification import Notification
from app.models.question import Question, QuizOption
from app.models.quiz import Quiz
from app.models.quiz_attempt import QuizAnswer, QuizAttempt, QuizAttemptEvent
from app.models.role import Role
from app.models.study_material import StudyMaterial
from app.models.submission import AssignmentFeedback, Submission
from app.models.user import InstructorProfile, SystemSetting, User
from app.services.lms_service import (
    create_or_update_payment_service,
    issue_certificate_service,
    recalculate_student_course_progress,
)


def seed_all() -> None:
    db = SessionLocal()
    try:
        # 1. Roles
        roles_map = {}
        for rname, rdesc in [
            ("admin", "Institute Administrator"),
            ("instructor", "Course & Cohort Instructor"),
            ("student", "Enrolled Student"),
        ]:
            r = db.query(Role).filter(Role.name == rname).first()
            if not r:
                r = Role(name=rname, description=rdesc)
                db.add(r)
                db.flush()
            roles_map[rname] = r

        # Check if already seeded
        if db.query(Course).count() > 0:
            print("[INFO] Database already contains seeded records. Skipping duplicate seed.")
            return

        # 2. Users (1 Admin, 3 Instructors, 6 Students)
        admin = User(
            role_id=roles_map["admin"].id,
            full_name="Dr. Eleanor Vance",
            email="admin@lms.com",
            phone="+1 (415) 890-1001",
            password_hash=hash_password("Admin@123"),
            bio="Director of Academic Operations & Enterprise Administration.",
            address="San Francisco, CA",
            is_active=True,
        )
        db.add(admin)
        db.flush()

        instructors_data = [
            (
                "Prof. Marcus Sterling",
                "instructor@lms.com",
                "+1 (415) 890-2001",
                "INS-2026-001",
                "Full Stack & Cloud Architecture",
                "Principal Faculty",
                "Ph.D. in Distributed Systems, Stanford",
                "React 19, FastAPI, Kubernetes, Microservices",
                9,
            ),
            (
                "Dr. Priya Nair",
                "priya.instructor@lms.com",
                "+1 (415) 890-2002",
                "INS-2026-002",
                "Artificial Intelligence & Data Science",
                "Senior AI Architect",
                "Ph.D. in Machine Learning, MIT",
                "Deep Learning, LLMs, PyTorch, MLOps",
                7,
            ),
            (
                "Prof. David Chen",
                "david.instructor@lms.com",
                "+1 (415) 890-2003",
                "INS-2026-003",
                "Cybersecurity & DevSecOps",
                "Lead Security Instructor",
                "M.S. Information Security, CMU",
                "Zero-Trust Architecture, Penetration Testing, IAM",
                8,
            ),
        ]
        instructors = []
        for fname, email, phone, emp_code, dept, desig, qual, spec, exp in instructors_data:
            u = User(
                role_id=roles_map["instructor"].id,
                full_name=fname,
                email=email,
                phone=phone,
                password_hash=hash_password("Instructor@123"),
                bio=f"{desig} in {dept}. Specializes in {spec}.",
                address="Silicon Valley Campus, CA",
                is_active=True,
            )
            db.add(u)
            db.flush()
            prof = InstructorProfile(
                user_id=u.id,
                employee_code=emp_code,
                department=dept,
                designation=desig,
                qualification=qual,
                specialization=spec,
                experience_years=exp,
                joining_date=date(2023, 1, 15),
            )
            db.add(prof)
            instructors.append(u)

        students_data = [
            ("Alex Rivera", "student@lms.com", "+1 (415) 890-3001", "STU-2026-0001"),
            ("Sophia Martinez", "sophia.student@lms.com", "+1 (415) 890-3002", "STU-2026-0002"),
            ("Liam O'Connor", "liam.student@lms.com", "+1 (415) 890-3003", "STU-2026-0003"),
            ("Aisha Patel", "aisha.student@lms.com", "+1 (415) 890-3004", "STU-2026-0004"),
            ("Noah Kim", "noah.student@lms.com", "+1 (415) 890-3005", "STU-2026-0005"),
            ("Emma Lindqvist", "emma.student@lms.com", "+1 (415) 890-3006", "STU-2026-0006"),
        ]
        students = []
        for fname, email, phone, scode in students_data:
            s = User(
                role_id=roles_map["student"].id,
                full_name=fname,
                email=email,
                phone=phone,
                student_code=scode,
                password_hash=hash_password("Student@123"),
                bio="Full-time Cohort Scholar at Nexus Institute.",
                address="San Jose, CA",
                is_active=True,
            )
            db.add(s)
            db.flush()
            students.append(s)

        # 3. Course Categories
        cats_data = [
            ("Full Stack Engineering", "full-stack-engineering", "Modern web apps with React 19, FastAPI, and MySQL.", "Code2"),
            ("AI & Data Science", "ai-data-science", "Machine learning, LLM fine-tuning, and production analytics.", "BrainCircuit"),
            ("Cloud & DevSecOps", "cloud-devsecops", "Docker, Kubernetes, CI/CD automation, and cloud security.", "CloudCog"),
            ("Product & UI/UX Design", "product-ui-ux-design", "Design systems, SaaS dashboards, and interaction engineering.", "Palette"),
        ]
        categories = []
        for cname, cslug, cdesc, cicon in cats_data:
            cat = CourseCategory(name=cname, slug=cslug, description=cdesc, icon=cicon, is_active=True)
            db.add(cat)
            db.flush()
            categories.append(cat)

        # 4. Courses
        courses_data = [
            (
                "CRS-FS-101",
                "Enterprise Full-Stack Architecture with React 19 & FastAPI",
                "enterprise-full-stack-react19-fastapi",
                categories[0].id,
                instructors[0].id,
                "Master production-ready SaaS development using React 19, Tailwind CSS 4, Python FastAPI, SQLAlchemy 2.x, MySQL 8, JWT authentication, and Docker deployment.",
                12,
                72,
                Decimal("1200.00"),
                "Advanced",
                "published",
                75,
            ),
            (
                "CRS-AI-201",
                "Applied Generative AI & Production LLM Engineering",
                "applied-generative-ai-llm-engineering",
                categories[1].id,
                instructors[1].id,
                "Design and deploy retrieval-augmented generation (RAG) pipelines, vector databases, multi-agent systems, and evaluation guardrails.",
                10,
                60,
                Decimal("1500.00"),
                "Advanced",
                "published",
                75,
            ),
            (
                "CRS-CL-301",
                "Cloud-Native Kubernetes & Zero-Trust Security",
                "cloud-native-kubernetes-zero-trust",
                categories[2].id,
                instructors[2].id,
                "Harden containerized microservices, automate infrastructure as code, and enforce RBAC and zero-trust security in production.",
                8,
                48,
                Decimal("950.00"),
                "Intermediate",
                "published",
                75,
            ),
            (
                "CRS-UX-401",
                "Design Systems & SaaS Dashboard Engineering",
                "design-systems-saas-dashboard-engineering",
                categories[3].id,
                instructors[0].id,
                "Craft Linear- and Stripe-inspired enterprise interfaces with accessible components, Tailwind CSS 4, Framer Motion, and data visualization.",
                6,
                36,
                Decimal("800.00"),
                "Beginner",
                "published",
                70,
            ),
        ]
        courses = []
        for code, title, slug, cat_id, ins_id, desc, weeks, hours, fee, lvl, st, thresh in courses_data:
            c = Course(
                course_code=code,
                title=title,
                slug=slug,
                category_id=cat_id,
                instructor_id=ins_id,
                description=desc,
                duration_weeks=weeks,
                duration_hours=hours,
                fee=fee,
                level=lvl,
                status=st,
                completion_threshold_pct=thresh,
            )
            db.add(c)
            db.flush()
            courses.append(c)

        # 5. Course Modules
        modules_by_course = {}
        for c in courses:
            m1 = CourseModule(
                course_id=c.id,
                title=f"Module 1: Core Foundations of {c.title.split(' ')[0]}",
                description="Architectural principles, environment setup, and foundational patterns.",
                sort_order=1,
                is_published=True,
            )
            m2 = CourseModule(
                course_id=c.id,
                title="Module 2: Production Implementation & Security",
                description="Database persistence, authentication, role-based access, and optimization.",
                sort_order=2,
                is_published=True,
            )
            m3 = CourseModule(
                course_id=c.id,
                title="Module 3: Testing, Analytics & Cloud Deployment",
                description="Automated test suites, telemetry, reporting, and production CI/CD.",
                sort_order=3,
                is_published=True,
            )
            db.add_all([m1, m2, m3])
            db.flush()
            modules_by_course[c.id] = [m1, m2, m3]

        # 6. Batches
        today = date.today()
        batches_data = [
            (
                "BAT-FS-2026A",
                "Full-Stack Cohort Alpha (Morning)",
                courses[0].id,
                instructors[0].id,
                today - timedelta(days=45),
                today + timedelta(days=45),
                "Mon, Wed, Fri",
                "09:30 AM - 11:30 AM EST",
                30,
                "active",
            ),
            (
                "BAT-AI-2026B",
                "GenAI Engineers Cohort Beta (Evening)",
                courses[1].id,
                instructors[1].id,
                today - timedelta(days=30),
                today + timedelta(days=60),
                "Tue, Thu, Sat",
                "06:00 PM - 08:00 PM EST",
                25,
                "active",
            ),
            (
                "BAT-CL-2026C",
                "DevSecOps Intensive Batch Gamma",
                courses[2].id,
                instructors[2].id,
                today - timedelta(days=20),
                today + timedelta(days=40),
                "Sat, Sun",
                "10:00 AM - 01:00 PM EST",
                20,
                "active",
            ),
        ]
        batches = []
        for bcode, bname, cid, ins_id, sdate, edate, cdays, ctime, cap, st in batches_data:
            b = Batch(
                batch_code=bcode,
                name=bname,
                course_id=cid,
                instructor_id=ins_id,
                start_date=sdate,
                end_date=edate,
                class_days=cdays,
                class_timing=ctime,
                capacity=cap,
                status=st,
            )
            db.add(b)
            db.flush()
            batches.append(b)

        # 7. Enrollments & Batch Students
        enrollment_pairs = [
            (students[0], courses[0], batches[0]),
            (students[0], courses[1], batches[1]),
            (students[1], courses[0], batches[0]),
            (students[2], courses[0], batches[0]),
            (students[3], courses[1], batches[1]),
            (students[4], courses[2], batches[2]),
            (students[5], courses[0], batches[0]),
        ]
        for idx, (stu, crs, bat) in enumerate(enrollment_pairs, start=1):
            db.add(BatchStudent(batch_id=bat.id, student_id=stu.id, status="active"))
            db.add(
                Enrollment(
                    enrollment_number=f"ENR-2026-{idx:04d}",
                    student_id=stu.id,
                    course_id=crs.id,
                    batch_id=bat.id,
                    status="active",
                    completion_percentage=0.0,
                )
            )
        db.flush()

        # 8. Lectures & Study Materials for Course 0 and Course 1
        c0_mods = modules_by_course[courses[0].id]
        lectures_c0 = [
            Lecture(
                course_id=courses[0].id,
                module_id=c0_mods[0].id,
                batch_id=batches[0].id,
                title="Lecture 1: Enterprise System Architecture & SQLAlchemy 2.x Declarative ORM",
                description="Deep dive into clean layered FastAPI architecture, connection pooling, and MySQL 8 indexing.",
                video_url="https://www.youtube.com/watch?v=0sOvCWFmrtA",
                duration_minutes=55,
                sort_order=1,
                scheduled_at=datetime.now() - timedelta(days=14),
                is_published=True,
                created_by=instructors[0].id,
            ),
            Lecture(
                course_id=courses[0].id,
                module_id=c0_mods[1].id,
                batch_id=batches[0].id,
                title="Lecture 2: Stateless JWT Access Tokens, Refresh Rotation & RBAC Guards",
                description="Implementing bcrypt password hashing, refresh token revocation, and resource-level authorization.",
                video_url="https://www.youtube.com/watch?v=7t2alSnE2-I",
                duration_minutes=60,
                sort_order=2,
                scheduled_at=datetime.now() - timedelta(days=10),
                is_published=True,
                created_by=instructors[0].id,
            ),
            Lecture(
                course_id=courses[0].id,
                module_id=c0_mods[2].id,
                batch_id=batches[0].id,
                title="Lecture 3: React 19 + Tailwind CSS 4 Design Systems & Recharts Analytics",
                description="Building Linear-inspired SaaS dashboards with responsive layouts, AOS animations, and live REST data.",
                video_url="https://www.youtube.com/watch?v=SqcY0GlETPk",
                duration_minutes=50,
                sort_order=3,
                scheduled_at=datetime.now() - timedelta(days=5),
                is_published=True,
                created_by=instructors[0].id,
            ),
        ]
        db.add_all(lectures_c0)

        c1_mods = modules_by_course[courses[1].id]
        lectures_c1 = [
            Lecture(
                course_id=courses[1].id,
                module_id=c1_mods[0].id,
                batch_id=batches[1].id,
                title="Lecture 1: Transformer Architectures & Enterprise RAG Pipelines",
                description="Understanding embeddings, semantic chunking, hybrid retrieval, and grounding evaluation.",
                video_url="https://www.youtube.com/watch?v=zjkBMFhNj_g",
                duration_minutes=65,
                sort_order=1,
                scheduled_at=datetime.now() - timedelta(days=12),
                is_published=True,
                created_by=instructors[1].id,
            ),
            Lecture(
                course_id=courses[1].id,
                module_id=c1_mods[1].id,
                batch_id=batches[1].id,
                title="Lecture 2: Agentic Workflows, Tool Calling & Production Guardrails",
                description="Building reliable multi-step AI agents with schema validation and latency optimization.",
                video_url="https://www.youtube.com/watch?v=sal78ACtGTc",
                duration_minutes=60,
                sort_order=2,
                scheduled_at=datetime.now() - timedelta(days=6),
                is_published=True,
                created_by=instructors[1].id,
            ),
        ]
        db.add_all(lectures_c1)
        db.flush()

        # Mark lectures completed for Alex Rivera (students[0]) and Sophia Martinez (students[1])
        for lec in lectures_c0:
            db.add(
                LectureProgress(
                    student_id=students[0].id,
                    lecture_id=lec.id,
                    course_id=courses[0].id,
                    is_completed=True,
                    watched_seconds=lec.duration_minutes * 60,
                    completed_at=datetime.now() - timedelta(days=2),
                )
            )
        for lec in lectures_c0[:2]:
            db.add(
                LectureProgress(
                    student_id=students[1].id,
                    lecture_id=lec.id,
                    course_id=courses[0].id,
                    is_completed=True,
                    watched_seconds=lec.duration_minutes * 60,
                    completed_at=datetime.now() - timedelta(days=1),
                )
            )

        # Study Materials
        materials = [
            StudyMaterial(
                course_id=courses[0].id,
                module_id=c0_mods[0].id,
                batch_id=batches[0].id,
                lecture_id=lectures_c0[0].id,
                title="FastAPI + SQLAlchemy 2.x Enterprise Reference Handbook (PDF)",
                description="Complete architectural guide with ERD patterns, Alembic migrations, and transaction strategies.",
                file_name="fastapi_sqlalchemy2_handbook.pdf",
                file_path="/uploads/materials/fastapi_sqlalchemy2_handbook.pdf",
                file_type="pdf",
                file_size_bytes=428500,
                uploaded_by=instructors[0].id,
            ),
            StudyMaterial(
                course_id=courses[0].id,
                module_id=c0_mods[1].id,
                batch_id=batches[0].id,
                lecture_id=lectures_c0[1].id,
                title="JWT Security, Refresh Rotation & OWASP Top 10 Slide Deck (PPTX)",
                description="Lecture slides covering token revocation, Argon2/bcrypt hashing, and RBAC permission matrices.",
                file_name="jwt_security_owasp_slides.pptx",
                file_path="/uploads/materials/jwt_security_owasp_slides.pptx",
                file_type="pptx",
                file_size_bytes=812400,
                uploaded_by=instructors[0].id,
            ),
            StudyMaterial(
                course_id=courses[1].id,
                module_id=c1_mods[0].id,
                batch_id=batches[1].id,
                lecture_id=lectures_c1[0].id,
                title="Production RAG & LLM Evaluation Cheat Sheet (PDF)",
                description="Reference architectures for vector indexing, reranking, and faithfulness scoring.",
                file_name="production_rag_cheatsheet.pdf",
                file_path="/uploads/materials/production_rag_cheatsheet.pdf",
                file_type="pdf",
                file_size_bytes=512000,
                uploaded_by=instructors[1].id,
            ),
        ]
        db.add_all(materials)
        db.flush()

        # 9. Assignments & Submissions
        a1 = Assignment(
            course_id=courses[0].id,
            batch_id=batches[0].id,
            module_id=c0_mods[1].id,
            title="Capstone Assignment 1: Build a Role-Protected REST API with SQLAlchemy 2.x",
            description="Design and implement a modular FastAPI service with MySQL persistence, JWT authentication, and pytest coverage.",
            instructions="1. Define declarative models with foreign keys.\n2. Implement JWT access + refresh endpoints.\n3. Submit GitHub repository notes or archive.",
            max_marks=100.0,
            passing_marks=40.0,
            due_date=datetime.now() + timedelta(days=7),
            allow_late_submission=True,
            status="published",
            created_by=instructors[0].id,
        )
        a2 = Assignment(
            course_id=courses[1].id,
            batch_id=batches[1].id,
            module_id=c1_mods[0].id,
            title="AI Lab 1: Semantic Retrieval & Prompt Guardrail Evaluation",
            description="Benchmark hybrid search recall and implement strict output schema validation using Pydantic v2.",
            instructions="Submit your evaluation metrics table and architectural reflection.",
            max_marks=100.0,
            passing_marks=50.0,
            due_date=datetime.now() + timedelta(days=10),
            allow_late_submission=True,
            status="published",
            created_by=instructors[1].id,
        )
        db.add_all([a1, a2])
        db.flush()

        sub1 = Submission(
            assignment_id=a1.id,
            student_id=students[0].id,
            submission_text="Implemented complete SQLAlchemy 2.x models, Alembic migrations, JWT refresh token rotation, and 100% passing pytest suite.",
            file_name="alex_rivera_fastapi_submission.pdf",
            file_path="/uploads/submissions/alex_rivera_fastapi_submission.pdf",
            submitted_at=datetime.now() - timedelta(days=2),
            is_late=False,
            status="evaluated",
            marks_obtained=94.0,
            evaluated_by=instructors[0].id,
            evaluated_at=datetime.now() - timedelta(days=1),
        )
        sub2 = Submission(
            assignment_id=a1.id,
            student_id=students[1].id,
            submission_text="Completed all endpoints and role-based middleware. Attached API test report and schema documentation.",
            file_name="sophia_martinez_api_project.zip",
            file_path="/uploads/submissions/sophia_martinez_api_project.zip",
            submitted_at=datetime.now() - timedelta(hours=14),
            is_late=False,
            status="submitted",
        )
        db.add_all([sub1, sub2])
        db.flush()

        db.add(
            AssignmentFeedback(
                submission_id=sub1.id,
                instructor_id=instructors[0].id,
                feedback_text="Exceptional architecture and clean separation between routers and service layer. Great work on token hashing!",
                rubric_notes="Code Quality: 48/50 | Security & RBAC: 46/50",
            )
        )

        # 10. Quizzes, Questions, Options & Attempt
        quiz1 = Quiz(
            course_id=courses[0].id,
            batch_id=batches[0].id,
            module_id=c0_mods[1].id,
            title="Full-Stack Architecture & FastAPI Security Examination",
            description="Comprehensive assessment covering React 19, Tailwind CSS 4, FastAPI, SQLAlchemy 2.x, and JWT security.",
            instructions="Answer all multiple-choice questions before the server timer expires. Scores are computed server-side.",
            total_marks=40.0,
            passing_marks=20.0,
            duration_minutes=20,
            max_attempts=3,
            allow_retake=True,
            status="published",
            created_by=instructors[0].id,
        )
        db.add(quiz1)
        db.flush()

        q_bank = [
            (
                "Which Vite plugin directive is required for the official Tailwind CSS 4 integration?",
                10.0,
                "Tailwind CSS 4 uses @tailwindcss/vite and @import 'tailwindcss'; without legacy tailwind.config.js.",
                [
                    ("@tailwindcss/vite with @import \"tailwindcss\";", True),
                    ("postcss-tailwind-v3 with tailwind.config.cjs", False),
                    ("webpack-tailwind-loader", False),
                    ("babel-plugin-tailwind", False),
                ],
            ),
            (
                "In SQLAlchemy 2.x, which typing construct is used to define modern declarative ORM columns?",
                10.0,
                "SQLAlchemy 2.x uses Mapped[T] and mapped_column() on DeclarativeBase subclasses.",
                [
                    ("Mapped[T] with mapped_column()", True),
                    ("Legacy raw Column() without type annotations", False),
                    ("ActiveRecord.define_field()", False),
                    ("Sequelize.DataTypes", False),
                ],
            ),
            (
                "Why must quiz examination scores always be calculated on the FastAPI backend?",
                10.0,
                "Browser requests can be tampered with; server-side scoring prevents unauthorized score manipulation and hides answer keys.",
                [
                    ("To prevent client-side tampering and protect answer keys before submission", True),
                    ("Because browsers cannot add floating-point numbers", False),
                    ("To avoid using JSON in HTTP requests", False),
                    ("Because React does not support state variables", False),
                ],
            ),
            (
                "How are refresh tokens stored securely in the database to prevent credential leakage?",
                10.0,
                "Storing a cryptographic hash (e.g., SHA-256 digest) ensures tokens cannot be replayed if the table is read.",
                [
                    ("As a cryptographic SHA-256 hash with expiry and revocation flags", True),
                    ("As unencrypted plain text in a public table", False),
                    ("Inside frontend CSS variables", False),
                    ("In URL query strings permanently", False),
                ],
            ),
        ]

        created_questions = []
        for idx, (qtext, qmarks, qexp, opts) in enumerate(q_bank, start=1):
            q = Question(
                quiz_id=quiz1.id,
                question_text=qtext,
                question_type="mcq",
                marks=qmarks,
                explanation=qexp,
                sort_order=idx,
            )
            db.add(q)
            db.flush()
            created_opts = []
            for oidx, (otext, is_corr) in enumerate(opts, start=1):
                opt = QuizOption(
                    question_id=q.id,
                    option_text=otext,
                    is_correct=is_corr,
                    sort_order=oidx,
                )
                db.add(opt)
                db.flush()
                created_opts.append(opt)
            created_questions.append((q, created_opts))

        # Record a completed quiz attempt for Alex Rivera (students[0])
        attempt1 = QuizAttempt(
            quiz_id=quiz1.id,
            student_id=students[0].id,
            attempt_number=1,
            started_at=datetime.now() - timedelta(days=1, minutes=15),
            expires_at=datetime.now() - timedelta(days=1) + timedelta(minutes=5),
            submitted_at=datetime.now() - timedelta(days=1),
            total_marks=40.0,
            obtained_marks=40.0,
            percentage=100.0,
            is_passed=True,
            status="evaluated",
        )
        db.add(attempt1)
        db.flush()
        for q, opts in created_questions:
            correct_opt = next(o for o in opts if o.is_correct)
            db.add(
                QuizAnswer(
                    attempt_id=attempt1.id,
                    question_id=q.id,
                    selected_option_id=correct_opt.id,
                    is_correct=True,
                    marks_awarded=q.marks,
                )
            )
        db.add(
            QuizAttemptEvent(
                attempt_id=attempt1.id,
                event_type="EXAM_SUBMITTED",
                event_data="Seeded full score 40/40 (100%)",
            )
        )

        # 11. Attendance Records across past 5 sessions
        for day_offset in (12, 10, 7, 5, 2):
            att_date = today - timedelta(days=day_offset)
            for s_idx, stu in enumerate([students[0], students[1], students[2], students[5]]):
                st = "present" if not (s_idx == 2 and day_offset == 5) else "absent"
                db.add(
                    Attendance(
                        batch_id=batches[0].id,
                        course_id=courses[0].id,
                        student_id=stu.id,
                        attendance_date=att_date,
                        session_status="scheduled",
                        status=st,
                        remarks="Regular cohort session",
                        marked_by=instructors[0].id,
                        updated_by=instructors[0].id,
                    )
                )
        db.flush()

        # 12. Recalculate Progress & Issue Certificate for Alex Rivera (students[0]) in Course 0
        recalculate_student_course_progress(db, student_id=students[0].id, course_id=courses[0].id)
        recalculate_student_course_progress(db, student_id=students[1].id, course_id=courses[0].id)
        db.commit()

        cert = issue_certificate_service(
            db=db,
            student_id=students[0].id,
            course_id=courses[0].id,
            issued_by_id=admin.id,
            force_issue=True,
        )

        # 13. Payments & Receipts
        create_or_update_payment_service(
            db=db,
            student_id=students[0].id,
            course_id=courses[0].id,
            paid_amount=1200.00,
            total_fee=1200.00,
            payment_method="bank_transfer",
            transaction_reference="TXN-NEXUS-9001",
            payment_date=today - timedelta(days=20),
            notes="Full tuition fee cleared",
            recorded_by_id=admin.id,
        )
        create_or_update_payment_service(
            db=db,
            student_id=students[1].id,
            course_id=courses[0].id,
            paid_amount=750.00,
            total_fee=1200.00,
            payment_method="card",
            transaction_reference="TXN-NEXUS-9002",
            payment_date=today - timedelta(days=12),
            notes="First installment paid; balance due next month",
            recorded_by_id=admin.id,
        )
        create_or_update_payment_service(
            db=db,
            student_id=students[2].id,
            course_id=courses[0].id,
            paid_amount=0.00,
            total_fee=1200.00,
            payment_method="online",
            transaction_reference="TXN-NEXUS-9003",
            payment_date=today - timedelta(days=5),
            notes="Awaiting scholarship wire clearance",
            recorded_by_id=admin.id,
        )
        create_or_update_payment_service(
            db=db,
            student_id=students[3].id,
            course_id=courses[1].id,
            paid_amount=1500.00,
            total_fee=1500.00,
            payment_method="upi",
            transaction_reference="TXN-NEXUS-9004",
            payment_date=today - timedelta(days=8),
            notes="GenAI Cohort full tuition",
            recorded_by_id=admin.id,
        )

        # 14. Announcements & System Settings
        db.add_all(
            [
                Announcement(
                    title="Welcome to the 2026 Enterprise Cohort Term!",
                    content="All live lecture recordings, downloadable PDF handbooks, and timed quizzes are now active in your dashboard. Ensure minimum 75% attendance and coursework completion for automatic certificate eligibility.",
                    target_role="all",
                    is_pinned=True,
                    is_active=True,
                    published_by=admin.id,
                ),
                Announcement(
                    title="Capstone Assignment 1 Submission Window Open",
                    content="Full-Stack Cohort Alpha students: please upload your FastAPI + React 19 project archives under My Assignments before the deadline.",
                    target_role="student",
                    course_id=courses[0].id,
                    batch_id=batches[0].id,
                    is_pinned=False,
                    is_active=True,
                    published_by=instructors[0].id,
                ),
            ]
        )

        default_settings = [
            ("institute_name", "Nexus Institute of Technology & Training", "general"),
            ("institute_tagline", "Empowering Enterprise Engineering & Data Leaders", "general"),
            ("institute_email", "admissions@nexuslms.edu", "general"),
            ("institute_phone", "+1 (800) 555-0199", "general"),
            ("currency_symbol", "$", "billing"),
            ("certificate_completion_threshold", "75", "academic"),
            ("attendance_minimum_threshold", "75", "academic"),
        ]
        for skey, sval, sgrp in default_settings:
            if not db.query(SystemSetting).filter(SystemSetting.setting_key == skey).first():
                db.add(SystemSetting(setting_key=skey, setting_value=sval, setting_group=sgrp, updated_by=admin.id))

        db.commit()
        print(f"[OK] Seeded complete LMS database! Sample Certificate: {cert.certificate_number}")
    finally:
        db.close()


if __name__ == "__main__":
    seed_all()

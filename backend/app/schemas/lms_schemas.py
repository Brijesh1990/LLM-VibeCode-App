"""Pydantic v2 Request and Response Schemas for NexusLMS REST API."""
from datetime import date, datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=4)


class RegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=150)
    email: EmailStr
    phone: Optional[str] = None
    password: str = Field(..., min_length=6)
    role: str = Field(default="student")


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=6)


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=6)


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class ProfileUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None
    address: Optional[str] = None
    avatar_url: Optional[str] = None
    department: Optional[str] = None
    designation: Optional[str] = None
    qualification: Optional[str] = None
    specialization: Optional[str] = None
    experience_years: Optional[int] = None


class UserCreateUpdateRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=150)
    email: EmailStr
    phone: Optional[str] = None
    password: Optional[str] = Field(default="Welcome@123", min_length=6)
    role: str = "student"
    bio: Optional[str] = None
    address: Optional[str] = None
    is_active: bool = True
    # Instructor profile fields
    department: Optional[str] = None
    designation: Optional[str] = None
    qualification: Optional[str] = None
    specialization: Optional[str] = None
    experience_years: Optional[int] = 0
    joining_date: Optional[date] = None


class CategoryCreateUpdate(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    description: Optional[str] = None
    icon: Optional[str] = "BookOpen"
    is_active: bool = True


class CourseCreateUpdate(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    course_code: Optional[str] = None
    category_id: int
    instructor_id: Optional[int] = None
    description: str
    duration_weeks: int = 12
    duration_hours: int = 60
    fee: float = 0.0
    thumbnail_url: Optional[str] = None
    level: str = "Intermediate"
    status: str = "published"
    completion_threshold_pct: int = 75


class CourseModuleCreateUpdate(BaseModel):
    course_id: int
    title: str = Field(..., min_length=2, max_length=200)
    description: Optional[str] = None
    sort_order: int = 1
    is_published: bool = True


class BatchCreateUpdate(BaseModel):
    name: str = Field(..., min_length=2, max_length=180)
    batch_code: Optional[str] = None
    course_id: int
    instructor_id: Optional[int] = None
    start_date: date
    end_date: date
    class_days: str = "Mon, Wed, Fri"
    class_timing: str = "10:00 AM - 12:00 PM"
    capacity: int = Field(default=30, ge=1)
    status: str = "active"


class BatchStudentAssignRequest(BaseModel):
    student_id: int


class EnrollmentCreateUpdate(BaseModel):
    student_id: int
    course_id: int
    batch_id: Optional[int] = None
    status: str = "active"


class LectureCreateUpdate(BaseModel):
    course_id: int
    module_id: Optional[int] = None
    batch_id: Optional[int] = None
    title: str = Field(..., min_length=2, max_length=220)
    description: Optional[str] = None
    video_url: Optional[str] = None
    duration_minutes: int = 45
    sort_order: int = 1
    scheduled_at: Optional[datetime] = None
    is_published: bool = True


class LectureCompleteRequest(BaseModel):
    is_completed: bool = True
    watched_seconds: int = 0


class AssignmentCreateUpdate(BaseModel):
    course_id: int
    batch_id: Optional[int] = None
    module_id: Optional[int] = None
    title: str = Field(..., min_length=2, max_length=220)
    description: str
    instructions: Optional[str] = None
    max_marks: float = Field(default=100.0, gt=0)
    passing_marks: float = Field(default=40.0, ge=0)
    due_date: datetime
    allow_late_submission: bool = True
    status: str = "published"


class SubmissionEvaluateRequest(BaseModel):
    marks_obtained: float = Field(..., ge=0)
    feedback_text: str = Field(..., min_length=2)
    rubric_notes: Optional[str] = None


class QuizOptionInput(BaseModel):
    option_text: str
    is_correct: bool = False
    sort_order: int = 1


class QuestionCreateUpdate(BaseModel):
    question_text: str
    question_type: str = "mcq"
    marks: float = Field(default=10.0, gt=0)
    explanation: Optional[str] = None
    sort_order: int = 1
    options: List[QuizOptionInput] = []


class QuizCreateUpdate(BaseModel):
    course_id: int
    batch_id: Optional[int] = None
    module_id: Optional[int] = None
    title: str = Field(..., min_length=2, max_length=220)
    description: Optional[str] = None
    instructions: Optional[str] = None
    total_marks: float = 100.0
    passing_marks: float = 40.0
    duration_minutes: int = Field(default=30, ge=1)
    available_from: Optional[datetime] = None
    available_until: Optional[datetime] = None
    max_attempts: int = Field(default=2, ge=1)
    allow_retake: bool = True
    shuffle_questions: bool = False
    status: str = "published"
    questions: Optional[List[QuestionCreateUpdate]] = None


class QuizAnswerSubmitItem(BaseModel):
    question_id: int
    selected_option_id: Optional[int] = None


class QuizSubmitRequest(BaseModel):
    answers: List[QuizAnswerSubmitItem]


class AttendanceRecordItem(BaseModel):
    student_id: int
    status: str = "present"  # present, absent, late, approved_leave
    remarks: Optional[str] = None


class AttendanceBulkMarkRequest(BaseModel):
    batch_id: int
    course_id: Optional[int] = None
    attendance_date: date
    session_status: str = "scheduled"  # scheduled, holiday, cancelled
    records: List[AttendanceRecordItem]


class CertificateIssueRequest(BaseModel):
    student_id: int
    course_id: int
    force_issue: bool = True


class PaymentCreateUpdate(BaseModel):
    student_id: int
    course_id: int
    total_fee: Optional[float] = None
    paid_amount: float = Field(..., ge=0)
    payment_date: Optional[date] = None
    payment_method: str = "bank_transfer"
    transaction_reference: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None


class PaymentGatewayOrderRequest(BaseModel):
    course_id: int
    batch_id: Optional[int] = None
    amount: Optional[float] = None
    payment_type: str = "full"


class PaymentGatewayVerifyRequest(BaseModel):
    order_id: str
    payment_id: str
    signature: Optional[str] = None
    course_id: int
    batch_id: Optional[int] = None
    amount: float
    payment_method: str = "card"
    existing_payment_id: Optional[int] = None


class PaymentPayPendingRequest(BaseModel):
    payment_id: int
    amount: float
    payment_method: str = "card"
    transaction_reference: Optional[str] = None


class AnnouncementCreateUpdate(BaseModel):
    title: str = Field(..., min_length=2, max_length=220)
    content: str = Field(..., min_length=2)
    target_role: str = "all"
    course_id: Optional[int] = None
    batch_id: Optional[int] = None
    is_pinned: bool = False
    is_active: bool = True


class NotificationCreateRequest(BaseModel):
    user_id: Optional[int] = None
    role_target: Optional[str] = None
    title: str
    message: str
    notification_type: str = "general"


class SystemSettingUpdateRequest(BaseModel):
    settings: Dict[str, str]

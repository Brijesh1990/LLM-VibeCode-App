# Environment Variables & Configuration Guide (`env-guide.md`)

**Document Version:** 1.0.0  
**Project:** Enterprise LMS  

---

## 1. Backend Environment Variables (`backend/.env`)

Create `backend/.env` by copying `backend/.env.example`:

```dotenv
# --- Application Core ---
APP_NAME="Enterprise LMS API"
APP_ENV="development"                  # development | staging | production
DEBUG=true
API_V1_STR="/api/v1"
HOST="0.0.0.0"
PORT=8000

# --- Database (MySQL 8.0+ Primary / SQLite Fallback for Local Testing) ---
# Production MySQL 8 Connection String:
DATABASE_URL="mysql+pymysql://lms_user:StrongPassword123!@localhost:3306/enterprise_lms?charset=utf8mb4"
DB_POOL_SIZE=10
DB_MAX_OVERFLOW=20
DB_ECHO=false

# --- JWT & Cryptography Security ---
SECRET_KEY="replace-with-64-char-cryptographically-random-hex-secret-key"
JWT_ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
PASSWORD_RESET_EXPIRE_MINUTES=30
BCRYPT_ROUNDS=12

# --- CORS & Frontend Origin ---
ALLOWED_ORIGINS="http://localhost:5173,http://127.0.0.1:5173"

# --- File Upload & Storage ---
STORAGE_BACKEND="local"                # local | s3
UPLOAD_DIR="./uploads"
MAX_MATERIAL_SIZE_MB=50
MAX_SUBMISSION_SIZE_MB=25

# --- Default Business Policy Thresholds ---
DEFAULT_MIN_ATTENDANCE_PCT=75.0
DEFAULT_MIN_COMPLETION_PCT=80.0
WEIGHT_LECTURES_PCT=50.0
WEIGHT_ASSIGNMENTS_PCT=30.0
WEIGHT_QUIZZES_PCT=20.0
QUIZ_GRACE_PERIOD_SECONDS=30
```

---

## 2. Frontend Environment Variables (`frontend/.env`)

Create `frontend/.env` by copying `frontend/.env.example`:

```dotenv
VITE_API_BASE_URL="http://localhost:8000/api/v1"
VITE_APP_TITLE="Enterprise LMS"
VITE_PUBLIC_VERIFY_URL="http://localhost:5173/verify"
```

---

## 3. Generating a Production `SECRET_KEY`
Never commit real secrets to Git. Generate a fresh 256-bit secret key using Python:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

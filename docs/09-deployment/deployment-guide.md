# Production Deployment Guide (`deployment-guide.md`)

**Document Version:** 1.0.0  
**Supported Platforms:** Windows 10/11 & Windows Server, Ubuntu/Debian Linux, Docker Compose, Vercel/Netlify + Render + Managed MySQL 8  

---

## 1. Local Development & Windows Setup

### 1.1 Prerequisites
- **Python:** 3.11 or 3.12+
- **Node.js:** 20.x or 22.x LTS (with `npm`)
- **MySQL Server:** MySQL 8.0+ (listening on port `3306`)

### 1.2 Step-by-Step Windows PowerShell Setup
```powershell
# 1. Provision MySQL 8 Database
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS enterprise_lms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 2. Setup Backend Virtual Environment & Dependencies
cd d:\LLM-VibeCoding\backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt

# 3. Configure Environment & Seed Demo Data (31 Tables)
Copy-Item .env.example .env
python -m scripts.seed_db

# 4. Start FastAPI Backend Server (Port 8000)
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# 5. In a second terminal, install & start React 19 Frontend (Port 5173)
cd d:\LLM-VibeCoding\frontend
npm install
npm run dev
```
- **Frontend UI:** `http://localhost:5173`
- **Swagger OpenAPI Docs:** `http://localhost:8000/docs`
- **Health Check:** `http://localhost:8000/api/v1/health`

---

## 2. Linux Production Deployment (Ubuntu 24.04 LTS + systemd + Nginx)

### 2.1 Systemd Service (`/etc/systemd/system/enterprise-lms.service`)
```ini
[Unit]
Description=Enterprise LMS FastAPI Backend (Gunicorn + Uvicorn Workers)
After=network.target mysql.service

[Service]
User=www-data
Group=www-data
WorkingDirectory=/opt/enterprise-lms/backend
EnvironmentFile=/opt/enterprise-lms/backend/.env
ExecStart=/opt/enterprise-lms/backend/.venv/bin/gunicorn app.main:app \
    --workers 4 \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind 127.0.0.1:8000 \
    --access-logfile -
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

### 2.2 Nginx Reverse Proxy (`/etc/nginx/sites-available/enterprise-lms`)
```nginx
server {
    listen 80;
    server_name lms.example.edu;

    client_max_body_size 55M;

    # Serve compiled React 19 Vite SPA
    root /opt/enterprise-lms/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy REST API v1 to FastAPI
    location /api/v1/ {
        proxy_pass http://127.0.0.1:8000/api/v1/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 3. Cloud PaaS Deployment (Vercel/Netlify + Render + Managed MySQL)

1. **Managed MySQL 8 (Aiven / AWS RDS / PlanetScale / DigitalOcean):**
   - Provision a MySQL 8 instance with `utf8mb4` encoding.
   - Copy the connection URI (`mysql+pymysql://user:pass@host:port/dbname`).
2. **Backend on Render / Railway:**
   - **Root Directory:** `backend`
   - **Build Command:** `pip install -r requirements.txt && python -m scripts.seed_db`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Environment Variables:** Set `DATABASE_URL`, `SECRET_KEY`, `ALLOWED_ORIGINS=https://your-lms.vercel.app`.
3. **Frontend on Vercel / Netlify:**
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Environment Variables:** Set `VITE_API_BASE_URL=https://your-lms-api.onrender.com/api/v1`.

---

## 4. Docker & Docker Compose Deployment

```yaml
version: "3.9"
services:
  mysql:
    image: mysql:8.0
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: enterprise_lms
      MYSQL_USER: lms_user
      MYSQL_PASSWORD: lms_password
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

  backend:
    build: ./backend
    restart: unless-stopped
    depends_on:
      - mysql
    environment:
      DATABASE_URL: "mysql+pymysql://lms_user:lms_password@mysql:3306/enterprise_lms?charset=utf8mb4"
      SECRET_KEY: "production-docker-secret-key-change-me"
      ALLOWED_ORIGINS: "http://localhost:5173,http://localhost:3000"
    ports:
      - "8000:8000"

  frontend:
    build: ./frontend
    restart: unless-stopped
    depends_on:
      - backend
    ports:
      - "5173:80"

volumes:
  mysql_data:
```

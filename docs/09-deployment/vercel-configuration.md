# Vercel Deployment & Environment Variables Configuration Guide
**Project Repository:** [`https://github.com/Brijesh1990/LLM-VibeCode-App.git`](https://github.com/Brijesh1990/LLM-VibeCode-App.git)  
**Platform:** Vercel (Edge & Serverless Python Runtime + Static React 19 Frontend)  
**Configuration File:** `vercel.json` (Root)  
**Serverless Entry Point:** `api/index.py` (Root)  

---

## 1. Complete Vercel Environment Variables Matrix

Copy and paste these environment variables into your Vercel Project Settings under:  
**Vercel Dashboard -> Project Settings -> Environment Variables** (Apply to **Production**, **Preview**, and **Development**):

| Variable Name | Recommended Value / Template | Category | Sensitivity |
| :--- | :--- | :--- | :---: |
| `APP_NAME` | `NexusLMS Enterprise` | General | Low |
| `APP_ENV` | `production` | General | Low |
| `DEBUG` | `false` | General | Low |
| `SECRET_KEY` | `sk_live_nexus_lms_super_secret_production_key_2026_hs256_vibe` | Security | **High (Secret)** |
| `JWT_SECRET_KEY` | `jwt_live_nexus_lms_signing_secret_key_2026_hs256_enterprise` | Security | **High (Secret)** |
| `JWT_ALGORITHM` | `HS256` | Security | Low |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `60` | Security | Low |
| `REFRESH_TOKEN_EXPIRE_DAYS` | `7` | Security | Low |
| `DATABASE_URL` | `mysql+pymysql://<user>:<password>@<cloud-host>:3306/<db_name>?ssl_ca=/etc/ssl/certs/ca-certificates.crt` | Database | **High (Secret)** |
| `DB_HOST` | `your-cloud-mysql-host.com` | Database | Medium |
| `DB_PORT` | `3306` | Database | Low |
| `DB_NAME` | `lms_db` | Database | Low |
| `DB_USER` | `your_db_username` | Database | Medium |
| `DB_PASSWORD` | `your_db_secure_password` | Database | **High (Secret)** |
| `FRONTEND_URL` | `https://llm-vibe-code-app.vercel.app` (or your custom domain) | Network | Low |
| `BACKEND_URL` | `https://llm-vibe-code-app.vercel.app` | Network | Low |
| `CORS_ORIGINS` | `https://llm-vibe-code-app.vercel.app,http://localhost:5173` | Network | Low |
| `SMTP_HOST` | `smtp.sendgrid.net` (or Gmail/Mailgun) | Email | Medium |
| `SMTP_PORT` | `587` | Email | Low |
| `SMTP_USER` | `apikey` (or your email) | Email | Medium |
| `SMTP_PASSWORD` | `your_smtp_api_key_or_app_password` | Email | **High (Secret)** |
| `SMTP_FROM_EMAIL` | `noreply@nexuslms.edu` | Email | Low |
| `STORAGE_PROVIDER` | `local` (or `s3` / `r2`) | Storage | Low |
| `STORAGE_BUCKET` | `nexuslms-storage` | Storage | Low |
| `STORAGE_ACCESS_KEY` | `your_s3_or_r2_access_key` | Storage | **High (Secret)** |
| `STORAGE_SECRET_KEY` | `your_s3_or_r2_secret_key` | Storage | **High (Secret)** |
| `STORAGE_REGION` | `us-east-1` | Storage | Low |
| `MAX_UPLOAD_SIZE_MB` | `50` | Storage | Low |
| `ALLOWED_FILE_EXTENSIONS`| `pdf,ppt,pptx,doc,docx,zip,jpg,jpeg,png,mp4` | Storage | Low |
| `PAYMENT_GATEWAY` | `razorpay_test` | Payments | Low |
| `PAYMENT_KEY_ID` | `rzp_test_NexusLms2026Key` | Payments | Medium (Test Key) |
| `PAYMENT_KEY_SECRET` | `rzp_test_secret_nexus2026` | Payments | **High (Secret)** |
| `PAYMENT_CURRENCY` | `USD` | Payments | Low |
| `VITE_APP_NAME` | `NexusLMS Enterprise` | Frontend | Low |
| `VITE_API_BASE_URL` | `/api/v1` | Frontend | Low |
| `VITE_APP_ENV` | `production` | Frontend | Low |
| `VITE_PAYMENT_KEY_ID` | `rzp_test_NexusLms2026Key` | Frontend | Low |
| `VITE_PAYMENT_GATEWAY` | `razorpay_test` | Frontend | Low |
| `VITE_PAYMENT_CURRENCY` | `USD` | Frontend | Low |
| `LOG_LEVEL` | `INFO` | Logging | Low |

---

## 2. Cloud Database Setup for Vercel Serverless

Because Vercel runs stateless serverless functions, the database cannot run on `localhost`. Use any of the following standard cloud MySQL/PostgreSQL providers:

1. **TiDB Serverless (Free 25GB MySQL-Compatible):**
   - Sign up at [https://tidbcloud.com](https://tidbcloud.com)
   - Create a free Serverless Cluster.
   - Copy connection string: `mysql+pymysql://<user>:<password>@<gateway-host>:4000/lms_db?ssl_verify_cert=true`
2. **Aiven for MySQL / PlanetScale / Railway:**
   - Create a managed MySQL 8 instance.
   - Set `DATABASE_URL` in Vercel to your connection URI.
3. **Instant Zero-Config SQLite Fallback:**
   - If running a test deploy on Vercel without a cloud MySQL instance, set:
     `DATABASE_URL=sqlite:////tmp/lms_db.db`
   - The engine automatically runs in thread-safe mode without connection pool crashes.

---

## 3. How to Deploy on Vercel with GitHub

1. Log in to [https://vercel.com](https://vercel.com) using your GitHub account (`Brijesh1990`).
2. Click **"Add New..." -> "Project"**.
3. Under **"Import Git Repository"**, select **`Brijesh1990/LLM-VibeCode-App`**.
4. In the **Configure Project** screen:
   - **Framework Preset:** Vite (or Other)
   - **Root Directory:** `./` (Leave as root)
   - **Build Command:** `cd frontend && npm install && npm run build` (Pre-configured in `vercel.json`)
   - **Output Directory:** `frontend/dist` (Pre-configured in `vercel.json`)
5. Open the **"Environment Variables"** accordion:
   - Copy the values from Section 1 above and paste them.
6. Click **"Deploy"**.
7. Vercel will:
   - Compile React 19 frontend into `frontend/dist`.
   - Package Python 3.12 FastAPI serverless functions via `api/index.py`.
   - Provide a live production URL: `https://llm-vibecode-app.vercel.app`.

---

## 4. Verification & Testing

Once deployed on Vercel:
* **API Health Check:** `https://<your-vercel-domain>/api/v1/health` -> Expects `{"status": "healthy", "database": "connected"}`.
* **Public Course Catalog:** `https://<your-vercel-domain>/api/v1/public/overview` -> Expects 4 published engineering courses.
* **Payment Gateway Config:** `https://<your-vercel-domain>/api/v1/payments/gateway/config` -> Expects `{ "gateway": "razorpay_test", "key_id": "rzp_test_NexusLms2026Key" }`.
* **Frontend SPA Navigation:** Direct link to `https://<your-vercel-domain>/student/courses` loads without 404 due to `vercel.json` rewrites.

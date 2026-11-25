# Database & Media Backup and Disaster Recovery Guide (`backup-restore.md`)

**Document Version:** 1.0.0  
**Project:** Enterprise LMS  

---

## 1. Backup Strategy Overview (3-2-1 Rule)

| Asset Type | Storage Location | Backup Frequency | Retention Window | Recovery Point Objective (RPO) |
| :--- | :--- | :--- | :--- | :--- |
| **MySQL 8 Database (31 Tables)** | Primary MySQL Server + Encrypted Offsite S3 Bucket | Daily full dump + 6-hour incremental binlogs | 30 Days Daily, 12 Months Monthly | `< 1 Hour` |
| **Uploaded Media & Generated PDFs** | `backend/uploads/` (Materials, Submissions, Certificates, Receipts) | Daily incremental sync (`rsync` / `aws s3 sync`) | 90 Days | `< 24 Hours` |
| **Environment & Secrets** | Secure Vault / Secret Manager | On every configuration change | Versioned indefinitely | Immediate |

---

## 2. Automated MySQL 8 Backup Commands

### 2.1 Logical Consistent Snapshot (`mysqldump`)
Use `--single-transaction` for zero-downtime consistent InnoDB backups across all 31 tables:

```bash
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="/backups/mysql/enterprise_lms_${TIMESTAMP}.sql.gz"

mysqldump \
  --host=localhost \
  --port=3306 \
  --user=lms_backup_user \
  --password="${MYSQL_BACKUP_PASSWORD}" \
  --single-transaction \
  --routines \
  --triggers \
  --events \
  --set-gtid-purged=OFF \
  enterprise_lms | gzip -9 > "${BACKUP_FILE}"
```

### 2.2 Windows PowerShell Scheduled Backup
```powershell
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$BackupDir = "D:\Backups\EnterpriseLMS"
New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null

mysqldump -u root -p --single-transaction enterprise_lms > "$BackupDir\enterprise_lms_$Timestamp.sql"
Compress-Archive -Path "d:\LLM-VibeCoding\backend\uploads" -DestinationPath "$BackupDir\uploads_$Timestamp.zip"
```

---

## 3. Step-by-Step Restore Procedure

### 3.1 Restoring MySQL 8 Schema & Data
```bash
# 1. Put application in maintenance mode (or stop backend workers)
sudo systemctl stop enterprise-lms

# 2. Recreate clean target database if recovering from corruption
mysql -u root -p -e "DROP DATABASE IF EXISTS enterprise_lms; CREATE DATABASE enterprise_lms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 3. Stream compressed backup into MySQL 8
gunzip < /backups/mysql/enterprise_lms_20261125_020000.sql.gz | mysql -u root -p enterprise_lms

# 4. Verify all 31 tables are restored
mysql -u root -p -e "SELECT COUNT(*) AS table_count FROM information_schema.tables WHERE table_schema='enterprise_lms';"

# 5. Restart backend service & verify health endpoint
sudo systemctl start enterprise-lms
curl -f http://localhost:8000/api/v1/health
```

### 3.2 Post-Restore Integrity Verification Checklist
1. Confirm `/api/v1/health` returns `"status": "healthy"` and `"database": "connected"`.
2. Verify financial invariant query returns zero discrepancies:
   ```sql
   SELECT COUNT(*) FROM enrollments
   WHERE (total_fee - discount_amount) != (paid_amount + pending_amount);
   ```
3. Verify public certificate verification `/api/v1/certificates/verify/{code}` resolves issued credentials.

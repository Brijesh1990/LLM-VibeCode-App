-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: localhost    Database: lms_db
-- ------------------------------------------------------
-- Server version	8.0.40

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `lms_db`
--

/*!40000 DROP DATABASE IF EXISTS `lms_db`*/;

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `lms_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `lms_db`;

--
-- Table structure for table `alembic_version`
--

DROP TABLE IF EXISTS `alembic_version`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `alembic_version` (
  `version_num` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`version_num`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alembic_version`
--

LOCK TABLES `alembic_version` WRITE;
/*!40000 ALTER TABLE `alembic_version` DISABLE KEYS */;
INSERT INTO `alembic_version` VALUES ('4b122385304d');
/*!40000 ALTER TABLE `alembic_version` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `announcements`
--

DROP TABLE IF EXISTS `announcements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `announcements` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(220) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `target_role` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `course_id` int DEFAULT NULL,
  `batch_id` int DEFAULT NULL,
  `is_pinned` tinyint(1) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `published_by` int DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT (now()),
  `updated_at` datetime NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  KEY `published_by` (`published_by`),
  KEY `ix_announcements_batch_id` (`batch_id`),
  KEY `ix_announcements_course_id` (`course_id`),
  KEY `ix_announcements_target_role` (`target_role`),
  KEY `ix_announcements_title` (`title`),
  CONSTRAINT `announcements_ibfk_1` FOREIGN KEY (`batch_id`) REFERENCES `batches` (`id`) ON DELETE SET NULL,
  CONSTRAINT `announcements_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE SET NULL,
  CONSTRAINT `announcements_ibfk_3` FOREIGN KEY (`published_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `announcements`
--

LOCK TABLES `announcements` WRITE;
/*!40000 ALTER TABLE `announcements` DISABLE KEYS */;
INSERT INTO `announcements` VALUES (1,'Welcome to the 2026 Enterprise Cohort Term!','All live lecture recordings, downloadable PDF handbooks, and timed quizzes are now active in your dashboard. Ensure minimum 75% attendance and coursework completion for automatic certificate eligibility.','all',NULL,NULL,1,1,1,'2026-11-25 14:23:58','2026-11-25 14:23:58'),(2,'Capstone Assignment 1 Submission Window Open','Full-Stack Cohort Alpha students: please upload your FastAPI + React 19 project archives under My Assignments before the deadline.','student',1,1,0,1,2,'2026-11-25 14:23:58','2026-11-25 14:23:58');
/*!40000 ALTER TABLE `announcements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `assignment_feedback`
--

DROP TABLE IF EXISTS `assignment_feedback`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assignment_feedback` (
  `id` int NOT NULL AUTO_INCREMENT,
  `submission_id` int NOT NULL,
  `instructor_id` int DEFAULT NULL,
  `feedback_text` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `rubric_notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime NOT NULL DEFAULT (now()),
  `updated_at` datetime NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  KEY `instructor_id` (`instructor_id`),
  KEY `ix_assignment_feedback_submission_id` (`submission_id`),
  CONSTRAINT `assignment_feedback_ibfk_1` FOREIGN KEY (`instructor_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `assignment_feedback_ibfk_2` FOREIGN KEY (`submission_id`) REFERENCES `submissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assignment_feedback`
--

LOCK TABLES `assignment_feedback` WRITE;
/*!40000 ALTER TABLE `assignment_feedback` DISABLE KEYS */;
INSERT INTO `assignment_feedback` VALUES (1,1,2,'Exceptional architecture and clean separation between routers and service layer. Great work on token hashing!','Code Quality: 48/50 | Security & RBAC: 46/50','2026-11-25 14:23:57','2026-11-25 14:23:57');
/*!40000 ALTER TABLE `assignment_feedback` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `assignments`
--

DROP TABLE IF EXISTS `assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assignments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `course_id` int NOT NULL,
  `batch_id` int DEFAULT NULL,
  `module_id` int DEFAULT NULL,
  `title` varchar(220) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `instructions` text COLLATE utf8mb4_unicode_ci,
  `reference_file_path` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `max_marks` float NOT NULL,
  `passing_marks` float NOT NULL,
  `due_date` datetime NOT NULL,
  `allow_late_submission` tinyint(1) NOT NULL,
  `status` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_by` int DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT (now()),
  `updated_at` datetime NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  KEY `ix_assignments_batch_id` (`batch_id`),
  KEY `ix_assignments_course_id` (`course_id`),
  KEY `ix_assignments_due_date` (`due_date`),
  KEY `ix_assignments_module_id` (`module_id`),
  KEY `ix_assignments_status` (`status`),
  KEY `ix_assignments_title` (`title`),
  CONSTRAINT `assignments_ibfk_1` FOREIGN KEY (`batch_id`) REFERENCES `batches` (`id`) ON DELETE SET NULL,
  CONSTRAINT `assignments_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `assignments_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `assignments_ibfk_4` FOREIGN KEY (`module_id`) REFERENCES `course_modules` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assignments`
--

LOCK TABLES `assignments` WRITE;
/*!40000 ALTER TABLE `assignments` DISABLE KEYS */;
INSERT INTO `assignments` VALUES (1,1,1,2,'Capstone Assignment 1: Build a Role-Protected REST API with SQLAlchemy 2.x','Design and implement a modular FastAPI service with MySQL persistence, JWT authentication, and pytest coverage.','1. Define declarative models with foreign keys.\n2. Implement JWT access + refresh endpoints.\n3. Submit GitHub repository notes or archive.',NULL,100,40,'2026-12-02 14:23:58',1,'published',2,'2026-11-25 14:23:57','2026-11-25 14:23:57'),(2,2,2,4,'AI Lab 1: Semantic Retrieval & Prompt Guardrail Evaluation','Benchmark hybrid search recall and implement strict output schema validation using Pydantic v2.','Submit your evaluation metrics table and architectural reflection.',NULL,100,50,'2026-12-05 14:23:58',1,'published',3,'2026-11-25 14:23:57','2026-11-25 14:23:57');
/*!40000 ALTER TABLE `assignments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `attendance`
--

DROP TABLE IF EXISTS `attendance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `attendance` (
  `id` int NOT NULL AUTO_INCREMENT,
  `batch_id` int NOT NULL,
  `course_id` int NOT NULL,
  `student_id` int NOT NULL,
  `attendance_date` date NOT NULL,
  `session_status` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `remarks` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `marked_by` int DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT (now()),
  `updated_at` datetime NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_batch_student_date_attendance` (`batch_id`,`student_id`,`attendance_date`),
  KEY `marked_by` (`marked_by`),
  KEY `updated_by` (`updated_by`),
  KEY `ix_attendance_attendance_date` (`attendance_date`),
  KEY `ix_attendance_batch_id` (`batch_id`),
  KEY `ix_attendance_course_id` (`course_id`),
  KEY `ix_attendance_status` (`status`),
  KEY `ix_attendance_student_id` (`student_id`),
  CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`batch_id`) REFERENCES `batches` (`id`) ON DELETE CASCADE,
  CONSTRAINT `attendance_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `attendance_ibfk_3` FOREIGN KEY (`marked_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `attendance_ibfk_4` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `attendance_ibfk_5` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendance`
--

LOCK TABLES `attendance` WRITE;
/*!40000 ALTER TABLE `attendance` DISABLE KEYS */;
INSERT INTO `attendance` VALUES (1,1,1,5,'2026-11-13','scheduled','present','Regular cohort session',2,2,'2026-11-25 14:23:57','2026-11-25 14:23:57'),(2,1,1,6,'2026-11-13','scheduled','present','Regular cohort session',2,2,'2026-11-25 14:23:57','2026-11-25 14:23:57'),(3,1,1,7,'2026-11-13','scheduled','present','Regular cohort session',2,2,'2026-11-25 14:23:57','2026-11-25 14:23:57'),(4,1,1,10,'2026-11-13','scheduled','present','Regular cohort session',2,2,'2026-11-25 14:23:57','2026-11-25 14:23:57'),(5,1,1,5,'2026-11-15','scheduled','present','Regular cohort session',2,2,'2026-11-25 14:23:57','2026-11-25 14:23:57'),(6,1,1,6,'2026-11-15','scheduled','present','Regular cohort session',2,2,'2026-11-25 14:23:57','2026-11-25 14:23:57'),(7,1,1,7,'2026-11-15','scheduled','present','Regular cohort session',2,2,'2026-11-25 14:23:57','2026-11-25 14:23:57'),(8,1,1,10,'2026-11-15','scheduled','present','Regular cohort session',2,2,'2026-11-25 14:23:57','2026-11-25 14:23:57'),(9,1,1,5,'2026-11-18','scheduled','present','Regular cohort session',2,2,'2026-11-25 14:23:57','2026-11-25 14:23:57'),(10,1,1,6,'2026-11-18','scheduled','present','Regular cohort session',2,2,'2026-11-25 14:23:57','2026-11-25 14:23:57'),(11,1,1,7,'2026-11-18','scheduled','present','Regular cohort session',2,2,'2026-11-25 14:23:57','2026-11-25 14:23:57'),(12,1,1,10,'2026-11-18','scheduled','present','Regular cohort session',2,2,'2026-11-25 14:23:57','2026-11-25 14:23:57'),(13,1,1,5,'2026-11-20','scheduled','present','Regular cohort session',2,2,'2026-11-25 14:23:57','2026-11-25 14:23:57'),(14,1,1,6,'2026-11-20','scheduled','present','Regular cohort session',2,2,'2026-11-25 14:23:57','2026-11-25 14:23:57'),(15,1,1,7,'2026-11-20','scheduled','absent','Regular cohort session',2,2,'2026-11-25 14:23:57','2026-11-25 14:23:57'),(16,1,1,10,'2026-11-20','scheduled','present','Regular cohort session',2,2,'2026-11-25 14:23:57','2026-11-25 14:23:57'),(17,1,1,5,'2026-11-23','scheduled','present','Regular cohort session',2,2,'2026-11-25 14:23:57','2026-11-25 14:23:57'),(18,1,1,6,'2026-11-23','scheduled','present','Regular cohort session',2,2,'2026-11-25 14:23:57','2026-11-25 14:23:57'),(19,1,1,7,'2026-11-23','scheduled','present','Regular cohort session',2,2,'2026-11-25 14:23:57','2026-11-25 14:23:57'),(20,1,1,10,'2026-11-23','scheduled','present','Regular cohort session',2,2,'2026-11-25 14:23:57','2026-11-25 14:23:57');
/*!40000 ALTER TABLE `attendance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `action` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_id` int DEFAULT NULL,
  `old_values` text COLLATE utf8mb4_unicode_ci,
  `new_values` text COLLATE utf8mb4_unicode_ci,
  `ip_address` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  KEY `ix_audit_logs_action` (`action`),
  KEY `ix_audit_logs_entity_type` (`entity_type`),
  KEY `ix_audit_logs_user_id` (`user_id`),
  CONSTRAINT `audit_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
INSERT INTO `audit_logs` VALUES (1,1,'USER_LOGIN','User',1,NULL,NULL,'127.0.0.1','2026-11-25 16:35:28'),(2,2,'USER_LOGIN','User',2,NULL,NULL,'127.0.0.1','2026-11-25 16:37:54'),(3,1,'USER_LOGIN','User',1,NULL,NULL,'127.0.0.1','2026-11-25 16:38:15'),(4,5,'USER_LOGIN','User',5,NULL,NULL,'127.0.0.1','2026-11-25 16:38:34'),(5,5,'USER_LOGIN','User',5,NULL,NULL,'127.0.0.1','2026-11-25 16:40:08'),(6,11,'CREATE_ENROLLMENT','Enrollment',8,NULL,NULL,NULL,'2026-11-25 16:44:14'),(7,1,'USER_LOGIN','User',1,NULL,NULL,'127.0.0.1','2026-11-25 17:01:29'),(8,2,'USER_LOGIN','User',2,NULL,NULL,'127.0.0.1','2026-11-25 17:01:29'),(9,5,'USER_LOGIN','User',5,NULL,NULL,'127.0.0.1','2026-11-25 17:01:29');
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `batch_students`
--

DROP TABLE IF EXISTS `batch_students`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `batch_students` (
  `id` int NOT NULL AUTO_INCREMENT,
  `batch_id` int NOT NULL,
  `student_id` int NOT NULL,
  `joined_at` datetime NOT NULL DEFAULT (now()),
  `status` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_batch_student` (`batch_id`,`student_id`),
  KEY `ix_batch_students_batch_id` (`batch_id`),
  KEY `ix_batch_students_student_id` (`student_id`),
  CONSTRAINT `batch_students_ibfk_1` FOREIGN KEY (`batch_id`) REFERENCES `batches` (`id`) ON DELETE CASCADE,
  CONSTRAINT `batch_students_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `batch_students`
--

LOCK TABLES `batch_students` WRITE;
/*!40000 ALTER TABLE `batch_students` DISABLE KEYS */;
INSERT INTO `batch_students` VALUES (1,1,5,'2026-11-25 14:23:57','active'),(2,2,5,'2026-11-25 14:23:57','active'),(3,1,6,'2026-11-25 14:23:57','active'),(4,1,7,'2026-11-25 14:23:57','active'),(5,2,8,'2026-11-25 14:23:57','active'),(6,3,9,'2026-11-25 14:23:57','active'),(7,1,10,'2026-11-25 14:23:57','active'),(8,2,11,'2026-11-25 16:44:14','active');
/*!40000 ALTER TABLE `batch_students` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `batches`
--

DROP TABLE IF EXISTS `batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `batches` (
  `id` int NOT NULL AUTO_INCREMENT,
  `batch_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(180) COLLATE utf8mb4_unicode_ci NOT NULL,
  `course_id` int NOT NULL,
  `instructor_id` int DEFAULT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `class_days` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `class_timing` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `capacity` int NOT NULL,
  `status` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL DEFAULT (now()),
  `updated_at` datetime NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ix_batches_batch_code` (`batch_code`),
  KEY `ix_batches_course_id` (`course_id`),
  KEY `ix_batches_instructor_id` (`instructor_id`),
  KEY `ix_batches_name` (`name`),
  KEY `ix_batches_status` (`status`),
  CONSTRAINT `batches_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `batches_ibfk_2` FOREIGN KEY (`instructor_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `batches`
--

LOCK TABLES `batches` WRITE;
/*!40000 ALTER TABLE `batches` DISABLE KEYS */;
INSERT INTO `batches` VALUES (1,'BAT-FS-2026A','Full-Stack Cohort Alpha (Morning)',1,2,'2026-10-11','2027-01-09','Mon, Wed, Fri','09:30 AM - 11:30 AM EST',30,'active','2026-11-25 14:23:57','2026-11-25 14:23:57'),(2,'BAT-AI-2026B','GenAI Engineers Cohort Beta (Evening)',2,3,'2026-10-26','2027-01-24','Tue, Thu, Sat','06:00 PM - 08:00 PM EST',25,'active','2026-11-25 14:23:57','2026-11-25 14:23:57'),(3,'BAT-CL-2026C','DevSecOps Intensive Batch Gamma',3,4,'2026-11-05','2027-01-04','Sat, Sun','10:00 AM - 01:00 PM EST',20,'active','2026-11-25 14:23:57','2026-11-25 14:23:57');
/*!40000 ALTER TABLE `batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `certificates`
--

DROP TABLE IF EXISTS `certificates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `certificates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `certificate_number` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `verification_code` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `student_id` int NOT NULL,
  `course_id` int NOT NULL,
  `batch_id` int DEFAULT NULL,
  `enrollment_id` int DEFAULT NULL,
  `issue_date` date NOT NULL,
  `completion_date` date NOT NULL,
  `grade` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `final_percentage` float NOT NULL,
  `pdf_file_path` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `issued_by` int DEFAULT NULL,
  `is_revoked` tinyint(1) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT (now()),
  `updated_at` datetime NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_student_course_certificate` (`student_id`,`course_id`),
  UNIQUE KEY `ix_certificates_certificate_number` (`certificate_number`),
  UNIQUE KEY `ix_certificates_verification_code` (`verification_code`),
  KEY `batch_id` (`batch_id`),
  KEY `enrollment_id` (`enrollment_id`),
  KEY `issued_by` (`issued_by`),
  KEY `ix_certificates_course_id` (`course_id`),
  KEY `ix_certificates_student_id` (`student_id`),
  CONSTRAINT `certificates_ibfk_1` FOREIGN KEY (`batch_id`) REFERENCES `batches` (`id`) ON DELETE SET NULL,
  CONSTRAINT `certificates_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `certificates_ibfk_3` FOREIGN KEY (`enrollment_id`) REFERENCES `enrollments` (`id`) ON DELETE SET NULL,
  CONSTRAINT `certificates_ibfk_4` FOREIGN KEY (`issued_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `certificates_ibfk_5` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `certificates`
--

LOCK TABLES `certificates` WRITE;
/*!40000 ALTER TABLE `certificates` DISABLE KEYS */;
INSERT INTO `certificates` VALUES (1,'CERT-2026-01005-170B9E','NXV-93467D3EB4',5,1,1,1,'2026-11-25','2026-11-25','A+',98,'/uploads/certificates/certificate_CERT-2026-01005-170B9E.pdf',1,0,'2026-11-25 14:23:57','2026-11-25 14:23:57');
/*!40000 ALTER TABLE `certificates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `course_categories`
--

DROP TABLE IF EXISTS `course_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `course_categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(140) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `icon` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT (now()),
  `updated_at` datetime NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ix_course_categories_name` (`name`),
  UNIQUE KEY `ix_course_categories_slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course_categories`
--

LOCK TABLES `course_categories` WRITE;
/*!40000 ALTER TABLE `course_categories` DISABLE KEYS */;
INSERT INTO `course_categories` VALUES (1,'Full Stack Engineering','full-stack-engineering','Modern web apps with React 19, FastAPI, and MySQL.','Code2',1,'2026-11-25 14:23:57','2026-11-25 14:23:57'),(2,'AI & Data Science','ai-data-science','Machine learning, LLM fine-tuning, and production analytics.','BrainCircuit',1,'2026-11-25 14:23:57','2026-11-25 14:23:57'),(3,'Cloud & DevSecOps','cloud-devsecops','Docker, Kubernetes, CI/CD automation, and cloud security.','CloudCog',1,'2026-11-25 14:23:57','2026-11-25 14:23:57'),(4,'Product & UI/UX Design','product-ui-ux-design','Design systems, SaaS dashboards, and interaction engineering.','Palette',1,'2026-11-25 14:23:57','2026-11-25 14:23:57');
/*!40000 ALTER TABLE `course_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `course_modules`
--

DROP TABLE IF EXISTS `course_modules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `course_modules` (
  `id` int NOT NULL AUTO_INCREMENT,
  `course_id` int NOT NULL,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `sort_order` int NOT NULL,
  `is_published` tinyint(1) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT (now()),
  `updated_at` datetime NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  KEY `ix_course_modules_course_id` (`course_id`),
  CONSTRAINT `course_modules_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `course_modules`
--

LOCK TABLES `course_modules` WRITE;
/*!40000 ALTER TABLE `course_modules` DISABLE KEYS */;
INSERT INTO `course_modules` VALUES (1,1,'Module 1: Core Foundations of Enterprise','Architectural principles, environment setup, and foundational patterns.',1,1,'2026-11-25 14:23:57','2026-11-25 14:23:57'),(2,1,'Module 2: Production Implementation & Security','Database persistence, authentication, role-based access, and optimization.',2,1,'2026-11-25 14:23:57','2026-11-25 14:23:57'),(3,1,'Module 3: Testing, Analytics & Cloud Deployment','Automated test suites, telemetry, reporting, and production CI/CD.',3,1,'2026-11-25 14:23:57','2026-11-25 14:23:57'),(4,2,'Module 1: Core Foundations of Applied','Architectural principles, environment setup, and foundational patterns.',1,1,'2026-11-25 14:23:57','2026-11-25 14:23:57'),(5,2,'Module 2: Production Implementation & Security','Database persistence, authentication, role-based access, and optimization.',2,1,'2026-11-25 14:23:57','2026-11-25 14:23:57'),(6,2,'Module 3: Testing, Analytics & Cloud Deployment','Automated test suites, telemetry, reporting, and production CI/CD.',3,1,'2026-11-25 14:23:57','2026-11-25 14:23:57'),(7,3,'Module 1: Core Foundations of Cloud-Native','Architectural principles, environment setup, and foundational patterns.',1,1,'2026-11-25 14:23:57','2026-11-25 14:23:57'),(8,3,'Module 2: Production Implementation & Security','Database persistence, authentication, role-based access, and optimization.',2,1,'2026-11-25 14:23:57','2026-11-25 14:23:57'),(9,3,'Module 3: Testing, Analytics & Cloud Deployment','Automated test suites, telemetry, reporting, and production CI/CD.',3,1,'2026-11-25 14:23:57','2026-11-25 14:23:57'),(10,4,'Module 1: Core Foundations of Design','Architectural principles, environment setup, and foundational patterns.',1,1,'2026-11-25 14:23:57','2026-11-25 14:23:57'),(11,4,'Module 2: Production Implementation & Security','Database persistence, authentication, role-based access, and optimization.',2,1,'2026-11-25 14:23:57','2026-11-25 14:23:57'),(12,4,'Module 3: Testing, Analytics & Cloud Deployment','Automated test suites, telemetry, reporting, and production CI/CD.',3,1,'2026-11-25 14:23:57','2026-11-25 14:23:57');
/*!40000 ALTER TABLE `course_modules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `courses`
--

DROP TABLE IF EXISTS `courses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `courses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `course_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(220) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category_id` int NOT NULL,
  `instructor_id` int DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `duration_weeks` int NOT NULL,
  `duration_hours` int NOT NULL,
  `fee` decimal(12,2) NOT NULL,
  `thumbnail_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `level` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `completion_threshold_pct` int NOT NULL,
  `is_deleted` tinyint(1) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT (now()),
  `updated_at` datetime NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ix_courses_course_code` (`course_code`),
  UNIQUE KEY `ix_courses_slug` (`slug`),
  KEY `ix_courses_category_id` (`category_id`),
  KEY `ix_courses_instructor_id` (`instructor_id`),
  KEY `ix_courses_is_deleted` (`is_deleted`),
  KEY `ix_courses_status` (`status`),
  KEY `ix_courses_title` (`title`),
  CONSTRAINT `courses_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `course_categories` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `courses_ibfk_2` FOREIGN KEY (`instructor_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `courses`
--

LOCK TABLES `courses` WRITE;
/*!40000 ALTER TABLE `courses` DISABLE KEYS */;
INSERT INTO `courses` VALUES (1,'CRS-FS-101','Enterprise Full-Stack Architecture with React 19 & FastAPI','enterprise-full-stack-react19-fastapi',1,2,'Master production-ready SaaS development using React 19, Tailwind CSS 4, Python FastAPI, SQLAlchemy 2.x, MySQL 8, JWT authentication, and Docker deployment.',12,72,1200.00,'/images/course-fullstack.svg','Advanced','published',75,0,'2026-11-25 14:23:57','2026-11-25 17:01:20'),(2,'CRS-AI-201','Applied Generative AI & Production LLM Engineering','applied-generative-ai-llm-engineering',2,3,'Design and deploy retrieval-augmented generation (RAG) pipelines, vector databases, multi-agent systems, and evaluation guardrails.',10,60,1500.00,'/images/course-genai.svg','Advanced','published',75,0,'2026-11-25 14:23:57','2026-11-25 17:01:20'),(3,'CRS-CL-301','Cloud-Native Kubernetes & Zero-Trust Security','cloud-native-kubernetes-zero-trust',3,4,'Harden containerized microservices, automate infrastructure as code, and enforce RBAC and zero-trust security in production.',8,48,950.00,'/images/course-cloud.svg','Intermediate','published',75,0,'2026-11-25 14:23:57','2026-11-25 17:01:20'),(4,'CRS-UX-401','Design Systems & SaaS Dashboard Engineering','design-systems-saas-dashboard-engineering',4,2,'Craft Linear- and Stripe-inspired enterprise interfaces with accessible components, Tailwind CSS 4, Framer Motion, and data visualization.',6,36,800.00,'/images/course-design.svg','Beginner','published',70,0,'2026-11-25 14:23:57','2026-11-25 17:01:20');
/*!40000 ALTER TABLE `courses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `enrollments`
--

DROP TABLE IF EXISTS `enrollments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `enrollments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `enrollment_number` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `student_id` int NOT NULL,
  `course_id` int NOT NULL,
  `batch_id` int DEFAULT NULL,
  `enrolled_at` datetime NOT NULL DEFAULT (now()),
  `status` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `completion_percentage` float NOT NULL,
  `completed_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT (now()),
  `updated_at` datetime NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_student_course_enrollment` (`student_id`,`course_id`),
  UNIQUE KEY `ix_enrollments_enrollment_number` (`enrollment_number`),
  KEY `ix_enrollments_batch_id` (`batch_id`),
  KEY `ix_enrollments_course_id` (`course_id`),
  KEY `ix_enrollments_status` (`status`),
  KEY `ix_enrollments_student_id` (`student_id`),
  CONSTRAINT `enrollments_ibfk_1` FOREIGN KEY (`batch_id`) REFERENCES `batches` (`id`) ON DELETE SET NULL,
  CONSTRAINT `enrollments_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `enrollments_ibfk_3` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `enrollments`
--

LOCK TABLES `enrollments` WRITE;
/*!40000 ALTER TABLE `enrollments` DISABLE KEYS */;
INSERT INTO `enrollments` VALUES (1,'ENR-2026-0001',5,1,1,'2026-11-25 14:23:57','completed',100,'2026-11-25 14:23:58','2026-11-25 14:23:57','2026-11-25 14:23:57'),(2,'ENR-2026-0002',5,2,2,'2026-11-25 14:23:57','active',0,NULL,'2026-11-25 14:23:57','2026-11-25 16:40:36'),(3,'ENR-2026-0003',6,1,1,'2026-11-25 14:23:57','active',63.3,NULL,'2026-11-25 14:23:57','2026-11-25 14:23:57'),(4,'ENR-2026-0004',7,1,1,'2026-11-25 14:23:57','active',0,NULL,'2026-11-25 14:23:57','2026-11-25 14:23:57'),(5,'ENR-2026-0005',8,2,2,'2026-11-25 14:23:57','active',0,NULL,'2026-11-25 14:23:57','2026-11-25 14:23:57'),(6,'ENR-2026-0006',9,3,3,'2026-11-25 14:23:57','active',0,NULL,'2026-11-25 14:23:57','2026-11-25 14:23:57'),(7,'ENR-2026-0007',10,1,1,'2026-11-25 14:23:57','active',0,NULL,'2026-11-25 14:23:57','2026-11-25 14:23:57'),(8,'ENR-2C1783D3',11,2,2,'2026-11-25 16:44:14','active',0,NULL,'2026-11-25 16:44:14','2026-11-25 16:44:14');
/*!40000 ALTER TABLE `enrollments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `instructors`
--

DROP TABLE IF EXISTS `instructors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `instructors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `employee_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `department` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `designation` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `qualification` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `specialization` varchar(250) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `experience_years` int NOT NULL,
  `joining_date` date DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT (now()),
  `updated_at` datetime NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ix_instructors_employee_code` (`employee_code`),
  UNIQUE KEY `ix_instructors_user_id` (`user_id`),
  CONSTRAINT `instructors_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `instructors`
--

LOCK TABLES `instructors` WRITE;
/*!40000 ALTER TABLE `instructors` DISABLE KEYS */;
INSERT INTO `instructors` VALUES (1,2,'INS-2026-001','Full Stack & Cloud Architecture','Principal Faculty','Ph.D. in Distributed Systems, Stanford','React 19, FastAPI, Kubernetes, Microservices',9,'2023-01-15','2026-11-25 14:23:56','2026-11-25 14:23:56'),(2,3,'INS-2026-002','Artificial Intelligence & Data Science','Senior AI Architect','Ph.D. in Machine Learning, MIT','Deep Learning, LLMs, PyTorch, MLOps',7,'2023-01-15','2026-11-25 14:23:56','2026-11-25 14:23:56'),(3,4,'INS-2026-003','Cybersecurity & DevSecOps','Lead Security Instructor','M.S. Information Security, CMU','Zero-Trust Architecture, Penetration Testing, IAM',8,'2023-01-15','2026-11-25 14:23:56','2026-11-25 14:23:56');
/*!40000 ALTER TABLE `instructors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lecture_progress`
--

DROP TABLE IF EXISTS `lecture_progress`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lecture_progress` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `lecture_id` int NOT NULL,
  `course_id` int NOT NULL,
  `is_completed` tinyint(1) NOT NULL,
  `watched_seconds` int NOT NULL,
  `completed_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT (now()),
  `updated_at` datetime NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_student_lecture_progress` (`student_id`,`lecture_id`),
  KEY `ix_lecture_progress_course_id` (`course_id`),
  KEY `ix_lecture_progress_lecture_id` (`lecture_id`),
  KEY `ix_lecture_progress_student_id` (`student_id`),
  CONSTRAINT `lecture_progress_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `lecture_progress_ibfk_2` FOREIGN KEY (`lecture_id`) REFERENCES `lectures` (`id`) ON DELETE CASCADE,
  CONSTRAINT `lecture_progress_ibfk_3` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lecture_progress`
--

LOCK TABLES `lecture_progress` WRITE;
/*!40000 ALTER TABLE `lecture_progress` DISABLE KEYS */;
INSERT INTO `lecture_progress` VALUES (1,5,1,1,1,3300,'2026-11-23 14:23:58','2026-11-25 14:23:57','2026-11-25 14:23:57'),(2,5,2,1,1,3600,'2026-11-23 14:23:58','2026-11-25 14:23:57','2026-11-25 14:23:57'),(3,5,3,1,1,3000,'2026-11-23 14:23:58','2026-11-25 14:23:57','2026-11-25 14:23:57'),(4,6,1,1,1,3300,'2026-11-24 14:23:58','2026-11-25 14:23:57','2026-11-25 14:23:57'),(5,6,2,1,1,3600,'2026-11-24 14:23:58','2026-11-25 14:23:57','2026-11-25 14:23:57'),(6,5,4,2,0,0,NULL,'2026-11-25 16:40:29','2026-11-25 16:40:36');
/*!40000 ALTER TABLE `lecture_progress` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lectures`
--

DROP TABLE IF EXISTS `lectures`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lectures` (
  `id` int NOT NULL AUTO_INCREMENT,
  `course_id` int NOT NULL,
  `module_id` int DEFAULT NULL,
  `batch_id` int DEFAULT NULL,
  `title` varchar(220) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `video_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `video_file_path` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `duration_minutes` int NOT NULL,
  `sort_order` int NOT NULL,
  `scheduled_at` datetime DEFAULT NULL,
  `is_published` tinyint(1) NOT NULL,
  `created_by` int DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT (now()),
  `updated_at` datetime NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  KEY `ix_lectures_batch_id` (`batch_id`),
  KEY `ix_lectures_course_id` (`course_id`),
  KEY `ix_lectures_module_id` (`module_id`),
  KEY `ix_lectures_title` (`title`),
  CONSTRAINT `lectures_ibfk_1` FOREIGN KEY (`batch_id`) REFERENCES `batches` (`id`) ON DELETE SET NULL,
  CONSTRAINT `lectures_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `lectures_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `lectures_ibfk_4` FOREIGN KEY (`module_id`) REFERENCES `course_modules` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lectures`
--

LOCK TABLES `lectures` WRITE;
/*!40000 ALTER TABLE `lectures` DISABLE KEYS */;
INSERT INTO `lectures` VALUES (1,1,1,1,'Lecture 1: Enterprise System Architecture & SQLAlchemy 2.x Declarative ORM','Deep dive into clean layered FastAPI architecture, connection pooling, and MySQL 8 indexing.','https://www.youtube.com/watch?v=0sOvCWFmrtA',NULL,55,1,'2026-11-11 14:23:58',1,2,'2026-11-25 14:23:57','2026-11-25 14:23:57'),(2,1,2,1,'Lecture 2: Stateless JWT Access Tokens, Refresh Rotation & RBAC Guards','Implementing bcrypt password hashing, refresh token revocation, and resource-level authorization.','https://www.youtube.com/watch?v=7t2alSnE2-I',NULL,60,2,'2026-11-15 14:23:58',1,2,'2026-11-25 14:23:57','2026-11-25 14:23:57'),(3,1,3,1,'Lecture 3: React 19 + Tailwind CSS 4 Design Systems & Recharts Analytics','Building Linear-inspired SaaS dashboards with responsive layouts, AOS animations, and live REST data.','https://www.youtube.com/watch?v=SqcY0GlETPk',NULL,50,3,'2026-11-20 14:23:58',1,2,'2026-11-25 14:23:57','2026-11-25 14:23:57'),(4,2,4,2,'Lecture 1: Transformer Architectures & Enterprise RAG Pipelines','Understanding embeddings, semantic chunking, hybrid retrieval, and grounding evaluation.','https://www.youtube.com/watch?v=zjkBMFhNj_g',NULL,65,1,'2026-11-13 14:23:58',1,3,'2026-11-25 14:23:57','2026-11-25 14:23:57'),(5,2,5,2,'Lecture 2: Agentic Workflows, Tool Calling & Production Guardrails','Building reliable multi-step AI agents with schema validation and latency optimization.','https://www.youtube.com/watch?v=sal78ACtGTc',NULL,60,2,'2026-11-19 14:23:58',1,3,'2026-11-25 14:23:57','2026-11-25 14:23:57');
/*!40000 ALTER TABLE `lectures` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `role_target` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `title` varchar(220) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `notification_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reference_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reference_id` int DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL,
  `read_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  KEY `ix_notifications_created_at` (`created_at`),
  KEY `ix_notifications_is_read` (`is_read`),
  KEY `ix_notifications_role_target` (`role_target`),
  KEY `ix_notifications_user_id` (`user_id`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES (1,5,NULL,'Course Certificate Issued!','Congratulations! Your certificate (CERT-2026-01005-170B9E) for Enterprise Full-Stack Architecture with React 19 & FastAPI is now available for download.','general','certificate',NULL,0,NULL,'2026-11-25 14:23:57'),(2,5,NULL,'Fee Payment Recorded','A payment of $1,200.00 for Enterprise Full-Stack Architecture with React 19 & FastAPI (Invoice INV-2026-56773F55) has been recorded. Status: Paid.','payment','payment',1,0,NULL,'2026-11-25 14:23:57'),(3,6,NULL,'Fee Payment Recorded','A payment of $750.00 for Enterprise Full-Stack Architecture with React 19 & FastAPI (Invoice INV-2026-D649FC29) has been recorded. Status: Partially Paid.','payment','payment',2,0,NULL,'2026-11-25 14:23:58'),(4,7,NULL,'Fee Payment Recorded','A payment of $0.00 for Enterprise Full-Stack Architecture with React 19 & FastAPI (Invoice INV-2026-D55C3443) has been recorded. Status: Pending.','payment','payment',3,0,NULL,'2026-11-25 14:23:58'),(5,8,NULL,'Fee Payment Recorded','A payment of $1,500.00 for Applied Generative AI & Production LLM Engineering (Invoice INV-2026-D3EFE964) has been recorded. Status: Paid.','payment','payment',4,0,NULL,'2026-11-25 14:23:58'),(6,11,NULL,'Welcome to NexusLMS Enterprise!','Hi brijesh kumar pandey, your student account has been activated.','general',NULL,NULL,0,NULL,'2026-11-25 16:43:26'),(7,11,NULL,'Enrolled in Applied Generative AI & Production LLM Engineering','You have been enrolled in \'Applied Generative AI & Production LLM Engineering\' (Enrollment #ENR-2C1783D3).','course','enrollment',8,0,NULL,'2026-11-25 16:44:14');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `token_hash` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` datetime NOT NULL,
  `is_used` tinyint(1) NOT NULL,
  `used_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ix_password_reset_tokens_token_hash` (`token_hash`),
  KEY `ix_password_reset_tokens_user_id` (`user_id`),
  CONSTRAINT `password_reset_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment_receipts`
--

DROP TABLE IF EXISTS `payment_receipts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_receipts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `payment_id` int NOT NULL,
  `receipt_number` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `pdf_file_path` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `generated_at` datetime NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ix_payment_receipts_receipt_number` (`receipt_number`),
  KEY `ix_payment_receipts_payment_id` (`payment_id`),
  CONSTRAINT `payment_receipts_ibfk_1` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_receipts`
--

LOCK TABLES `payment_receipts` WRITE;
/*!40000 ALTER TABLE `payment_receipts` DISABLE KEYS */;
INSERT INTO `payment_receipts` VALUES (1,1,'RCP-2026-0001-E0D5',1200.00,'/uploads/receipts/receipt_RCP-2026-0001-E0D5.pdf','2026-11-25 14:23:57'),(2,2,'RCP-2026-0002-748B',750.00,'/uploads/receipts/receipt_RCP-2026-0002-748B.pdf','2026-11-25 14:23:58'),(3,3,'RCP-2026-0003-9ED3',0.00,'/uploads/receipts/receipt_RCP-2026-0003-9ED3.pdf','2026-11-25 14:23:58'),(4,4,'RCP-2026-0004-A952',1500.00,'/uploads/receipts/receipt_RCP-2026-0004-A952.pdf','2026-11-25 14:23:58');
/*!40000 ALTER TABLE `payment_receipts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `invoice_number` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `student_id` int NOT NULL,
  `course_id` int NOT NULL,
  `enrollment_id` int DEFAULT NULL,
  `total_fee` decimal(12,2) NOT NULL,
  `paid_amount` decimal(12,2) NOT NULL,
  `pending_amount` decimal(12,2) NOT NULL,
  `payment_date` date NOT NULL,
  `payment_method` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `transaction_reference` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `recorded_by` int DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT (now()),
  `updated_at` datetime NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ix_payments_invoice_number` (`invoice_number`),
  KEY `recorded_by` (`recorded_by`),
  KEY `ix_payments_course_id` (`course_id`),
  KEY `ix_payments_enrollment_id` (`enrollment_id`),
  KEY `ix_payments_payment_date` (`payment_date`),
  KEY `ix_payments_status` (`status`),
  KEY `ix_payments_student_id` (`student_id`),
  KEY `ix_payments_transaction_reference` (`transaction_reference`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `payments_ibfk_2` FOREIGN KEY (`enrollment_id`) REFERENCES `enrollments` (`id`) ON DELETE SET NULL,
  CONSTRAINT `payments_ibfk_3` FOREIGN KEY (`recorded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `payments_ibfk_4` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` VALUES (1,'INV-2026-56773F55',5,1,1,1200.00,1200.00,0.00,'2026-11-05','bank_transfer','TXN-NEXUS-9001','paid','Full tuition fee cleared',1,'2026-11-25 14:23:57','2026-11-25 14:23:57'),(2,'INV-2026-D649FC29',6,1,3,1200.00,750.00,450.00,'2026-11-13','card','TXN-NEXUS-9002','partially_paid','First installment paid; balance due next month',1,'2026-11-25 14:23:58','2026-11-25 14:23:58'),(3,'INV-2026-D55C3443',7,1,4,1200.00,0.00,1200.00,'2026-11-20','online','TXN-NEXUS-9003','pending','Awaiting scholarship wire clearance',1,'2026-11-25 14:23:58','2026-11-25 14:23:58'),(4,'INV-2026-D3EFE964',8,2,5,1500.00,1500.00,0.00,'2026-11-17','upi','TXN-NEXUS-9004','paid','GenAI Cohort full tuition',1,'2026-11-25 14:23:58','2026-11-25 14:23:58');
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `questions`
--

DROP TABLE IF EXISTS `questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `questions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `quiz_id` int NOT NULL,
  `question_text` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `question_type` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `marks` float NOT NULL,
  `explanation` text COLLATE utf8mb4_unicode_ci,
  `sort_order` int NOT NULL,
  `created_at` datetime NOT NULL DEFAULT (now()),
  `updated_at` datetime NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  KEY `ix_questions_quiz_id` (`quiz_id`),
  CONSTRAINT `questions_ibfk_1` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `questions`
--

LOCK TABLES `questions` WRITE;
/*!40000 ALTER TABLE `questions` DISABLE KEYS */;
INSERT INTO `questions` VALUES (1,1,'Which Vite plugin directive is required for the official Tailwind CSS 4 integration?','mcq',10,'Tailwind CSS 4 uses @tailwindcss/vite and @import \'tailwindcss\'; without legacy tailwind.config.js.',1,'2026-11-25 14:23:57','2026-11-25 14:23:57'),(2,1,'In SQLAlchemy 2.x, which typing construct is used to define modern declarative ORM columns?','mcq',10,'SQLAlchemy 2.x uses Mapped[T] and mapped_column() on DeclarativeBase subclasses.',2,'2026-11-25 14:23:57','2026-11-25 14:23:57'),(3,1,'Why must quiz examination scores always be calculated on the FastAPI backend?','mcq',10,'Browser requests can be tampered with; server-side scoring prevents unauthorized score manipulation and hides answer keys.',3,'2026-11-25 14:23:57','2026-11-25 14:23:57'),(4,1,'How are refresh tokens stored securely in the database to prevent credential leakage?','mcq',10,'Storing a cryptographic hash (e.g., SHA-256 digest) ensures tokens cannot be replayed if the table is read.',4,'2026-11-25 14:23:57','2026-11-25 14:23:57');
/*!40000 ALTER TABLE `questions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quiz_answers`
--

DROP TABLE IF EXISTS `quiz_answers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `quiz_answers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `attempt_id` int NOT NULL,
  `question_id` int NOT NULL,
  `selected_option_id` int DEFAULT NULL,
  `is_correct` tinyint(1) NOT NULL,
  `marks_awarded` float NOT NULL,
  `answered_at` datetime NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  KEY `selected_option_id` (`selected_option_id`),
  KEY `ix_quiz_answers_attempt_id` (`attempt_id`),
  KEY `ix_quiz_answers_question_id` (`question_id`),
  CONSTRAINT `quiz_answers_ibfk_1` FOREIGN KEY (`attempt_id`) REFERENCES `quiz_attempts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `quiz_answers_ibfk_2` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `quiz_answers_ibfk_3` FOREIGN KEY (`selected_option_id`) REFERENCES `quiz_options` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quiz_answers`
--

LOCK TABLES `quiz_answers` WRITE;
/*!40000 ALTER TABLE `quiz_answers` DISABLE KEYS */;
INSERT INTO `quiz_answers` VALUES (1,1,1,1,1,10,'2026-11-25 14:23:57'),(2,1,2,5,1,10,'2026-11-25 14:23:57'),(3,1,3,9,1,10,'2026-11-25 14:23:57'),(4,1,4,13,1,10,'2026-11-25 14:23:57');
/*!40000 ALTER TABLE `quiz_answers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quiz_attempt_events`
--

DROP TABLE IF EXISTS `quiz_attempt_events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `quiz_attempt_events` (
  `id` int NOT NULL AUTO_INCREMENT,
  `attempt_id` int NOT NULL,
  `event_type` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `event_data` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  KEY `ix_quiz_attempt_events_attempt_id` (`attempt_id`),
  CONSTRAINT `quiz_attempt_events_ibfk_1` FOREIGN KEY (`attempt_id`) REFERENCES `quiz_attempts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quiz_attempt_events`
--

LOCK TABLES `quiz_attempt_events` WRITE;
/*!40000 ALTER TABLE `quiz_attempt_events` DISABLE KEYS */;
INSERT INTO `quiz_attempt_events` VALUES (1,1,'EXAM_SUBMITTED','Seeded full score 40/40 (100%)','2026-11-25 14:23:57');
/*!40000 ALTER TABLE `quiz_attempt_events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quiz_attempts`
--

DROP TABLE IF EXISTS `quiz_attempts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `quiz_attempts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `quiz_id` int NOT NULL,
  `student_id` int NOT NULL,
  `attempt_number` int NOT NULL,
  `started_at` datetime NOT NULL DEFAULT (now()),
  `expires_at` datetime NOT NULL,
  `submitted_at` datetime DEFAULT NULL,
  `total_marks` float NOT NULL,
  `obtained_marks` float NOT NULL,
  `percentage` float NOT NULL,
  `is_passed` tinyint(1) NOT NULL,
  `status` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime NOT NULL DEFAULT (now()),
  `updated_at` datetime NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  KEY `ix_quiz_attempts_quiz_id` (`quiz_id`),
  KEY `ix_quiz_attempts_status` (`status`),
  KEY `ix_quiz_attempts_student_id` (`student_id`),
  CONSTRAINT `quiz_attempts_ibfk_1` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `quiz_attempts_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quiz_attempts`
--

LOCK TABLES `quiz_attempts` WRITE;
/*!40000 ALTER TABLE `quiz_attempts` DISABLE KEYS */;
INSERT INTO `quiz_attempts` VALUES (1,1,5,1,'2026-11-24 14:08:58','2026-11-24 14:28:58','2026-11-24 14:23:58',40,40,100,1,'evaluated','2026-11-25 14:23:57','2026-11-25 14:23:57');
/*!40000 ALTER TABLE `quiz_attempts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quiz_options`
--

DROP TABLE IF EXISTS `quiz_options`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `quiz_options` (
  `id` int NOT NULL AUTO_INCREMENT,
  `question_id` int NOT NULL,
  `option_text` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_correct` tinyint(1) NOT NULL,
  `sort_order` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_quiz_options_question_id` (`question_id`),
  CONSTRAINT `quiz_options_ibfk_1` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quiz_options`
--

LOCK TABLES `quiz_options` WRITE;
/*!40000 ALTER TABLE `quiz_options` DISABLE KEYS */;
INSERT INTO `quiz_options` VALUES (1,1,'@tailwindcss/vite with @import \"tailwindcss\";',1,1),(2,1,'postcss-tailwind-v3 with tailwind.config.cjs',0,2),(3,1,'webpack-tailwind-loader',0,3),(4,1,'babel-plugin-tailwind',0,4),(5,2,'Mapped[T] with mapped_column()',1,1),(6,2,'Legacy raw Column() without type annotations',0,2),(7,2,'ActiveRecord.define_field()',0,3),(8,2,'Sequelize.DataTypes',0,4),(9,3,'To prevent client-side tampering and protect answer keys before submission',1,1),(10,3,'Because browsers cannot add floating-point numbers',0,2),(11,3,'To avoid using JSON in HTTP requests',0,3),(12,3,'Because React does not support state variables',0,4),(13,4,'As a cryptographic SHA-256 hash with expiry and revocation flags',1,1),(14,4,'As unencrypted plain text in a public table',0,2),(15,4,'Inside frontend CSS variables',0,3),(16,4,'In URL query strings permanently',0,4);
/*!40000 ALTER TABLE `quiz_options` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quizzes`
--

DROP TABLE IF EXISTS `quizzes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `quizzes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `course_id` int NOT NULL,
  `batch_id` int DEFAULT NULL,
  `module_id` int DEFAULT NULL,
  `title` varchar(220) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `instructions` text COLLATE utf8mb4_unicode_ci,
  `total_marks` float NOT NULL,
  `passing_marks` float NOT NULL,
  `duration_minutes` int NOT NULL,
  `available_from` datetime DEFAULT NULL,
  `available_until` datetime DEFAULT NULL,
  `max_attempts` int NOT NULL,
  `allow_retake` tinyint(1) NOT NULL,
  `shuffle_questions` tinyint(1) NOT NULL,
  `status` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_by` int DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT (now()),
  `updated_at` datetime NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  KEY `ix_quizzes_batch_id` (`batch_id`),
  KEY `ix_quizzes_course_id` (`course_id`),
  KEY `ix_quizzes_module_id` (`module_id`),
  KEY `ix_quizzes_status` (`status`),
  KEY `ix_quizzes_title` (`title`),
  CONSTRAINT `quizzes_ibfk_1` FOREIGN KEY (`batch_id`) REFERENCES `batches` (`id`) ON DELETE SET NULL,
  CONSTRAINT `quizzes_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `quizzes_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `quizzes_ibfk_4` FOREIGN KEY (`module_id`) REFERENCES `course_modules` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quizzes`
--

LOCK TABLES `quizzes` WRITE;
/*!40000 ALTER TABLE `quizzes` DISABLE KEYS */;
INSERT INTO `quizzes` VALUES (1,1,1,2,'Full-Stack Architecture & FastAPI Security Examination','Comprehensive assessment covering React 19, Tailwind CSS 4, FastAPI, SQLAlchemy 2.x, and JWT security.','Answer all multiple-choice questions before the server timer expires. Scores are computed server-side.',40,20,20,NULL,NULL,3,1,0,'published',2,'2026-11-25 14:23:57','2026-11-25 14:23:57');
/*!40000 ALTER TABLE `quizzes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `refresh_tokens`
--

DROP TABLE IF EXISTS `refresh_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `refresh_tokens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `token_hash` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` datetime NOT NULL,
  `is_revoked` tinyint(1) NOT NULL,
  `revoked_at` datetime DEFAULT NULL,
  `user_agent` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ip_address` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ix_refresh_tokens_token_hash` (`token_hash`),
  KEY `ix_refresh_tokens_user_id` (`user_id`),
  CONSTRAINT `refresh_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `refresh_tokens`
--

LOCK TABLES `refresh_tokens` WRITE;
/*!40000 ALTER TABLE `refresh_tokens` DISABLE KEYS */;
INSERT INTO `refresh_tokens` VALUES (1,1,'04e62c2ca7c7d5415a61d77a202b73ebf0e29f4e8293edbf677f8ada0b9e1433','2026-12-02 11:05:29',0,NULL,'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.19041.6456','127.0.0.1','2026-11-25 16:35:28'),(2,2,'d83b194c9e05924564e4a798c1598795af74e7203d1bd3ee759c3ffdd358b40d','2026-12-02 11:07:55',1,'2026-11-25 16:38:13','Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1','127.0.0.1','2026-11-25 16:37:54'),(3,1,'6159c9ea2f1080911c2e6178c36aadc01516b244a0c2eb1cee16d3a7ebb58740','2026-12-02 11:08:16',1,'2026-11-25 16:38:29','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:160.0) Gecko/20100101 Firefox/160.0','127.0.0.1','2026-11-25 16:38:15'),(4,5,'ac0bb3e0655ee18153b98f75dcdbb371ced0d560f3280bbaaafb2bfad9deda81','2026-12-02 11:08:35',1,'2026-11-25 16:38:48','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:160.0) Gecko/20100101 Firefox/160.0','127.0.0.1','2026-11-25 16:38:34'),(5,5,'bde17d041e19adbaa496ce61b0bc52969bd9adf83db829f80bb613d4f3adfbaa','2026-12-02 11:10:08',1,'2026-11-25 16:42:06','Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:160.0) Gecko/20100101 Firefox/160.0','127.0.0.1','2026-11-25 16:40:08'),(6,11,'ee4a117d3761e61835e4afd0c6f48e3c0bddff633261b995fbaeaa99ce640a78','2026-12-02 11:13:27',1,'2026-11-25 16:45:44',NULL,'127.0.0.1','2026-11-25 16:43:26'),(7,1,'25f3c51137e60c96cf9accf27f263cd95df1dae5094c9d3e61a321e09683ff3b','2026-12-02 11:31:29',0,NULL,'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.19041.6456','127.0.0.1','2026-11-25 17:01:29'),(8,2,'8b7bc7b1b631aee107df819f3d11c4bfd4404c910e2bf41e0e5384e86e26ad9f','2026-12-02 11:31:29',0,NULL,'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.19041.6456','127.0.0.1','2026-11-25 17:01:29'),(9,5,'a8ab873d16a57d416e34ff64e1805894b03d114e70bc0539667b95fffc2963ef','2026-12-02 11:31:30',0,NULL,'Mozilla/5.0 (Windows NT; Windows NT 10.0; en-IN) WindowsPowerShell/5.1.19041.6456','127.0.0.1','2026-11-25 17:01:29');
/*!40000 ALTER TABLE `refresh_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime NOT NULL DEFAULT (now()),
  `updated_at` datetime NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ix_roles_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'admin','Institute Administrator','2026-11-25 14:23:55','2026-11-25 14:23:55'),(2,'instructor','Course & Cohort Instructor','2026-11-25 14:23:55','2026-11-25 14:23:55'),(3,'student','Enrolled Student','2026-11-25 14:23:55','2026-11-25 14:23:55');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `study_materials`
--

DROP TABLE IF EXISTS `study_materials`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `study_materials` (
  `id` int NOT NULL AUTO_INCREMENT,
  `course_id` int NOT NULL,
  `module_id` int DEFAULT NULL,
  `batch_id` int DEFAULT NULL,
  `lecture_id` int DEFAULT NULL,
  `title` varchar(220) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `file_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_path` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_size_bytes` int NOT NULL,
  `uploaded_by` int DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT (now()),
  `updated_at` datetime NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  KEY `uploaded_by` (`uploaded_by`),
  KEY `ix_study_materials_batch_id` (`batch_id`),
  KEY `ix_study_materials_course_id` (`course_id`),
  KEY `ix_study_materials_lecture_id` (`lecture_id`),
  KEY `ix_study_materials_module_id` (`module_id`),
  KEY `ix_study_materials_title` (`title`),
  CONSTRAINT `study_materials_ibfk_1` FOREIGN KEY (`batch_id`) REFERENCES `batches` (`id`) ON DELETE SET NULL,
  CONSTRAINT `study_materials_ibfk_2` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  CONSTRAINT `study_materials_ibfk_3` FOREIGN KEY (`lecture_id`) REFERENCES `lectures` (`id`) ON DELETE SET NULL,
  CONSTRAINT `study_materials_ibfk_4` FOREIGN KEY (`module_id`) REFERENCES `course_modules` (`id`) ON DELETE SET NULL,
  CONSTRAINT `study_materials_ibfk_5` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `study_materials`
--

LOCK TABLES `study_materials` WRITE;
/*!40000 ALTER TABLE `study_materials` DISABLE KEYS */;
INSERT INTO `study_materials` VALUES (1,1,1,1,1,'FastAPI + SQLAlchemy 2.x Enterprise Reference Handbook (PDF)','Complete architectural guide with ERD patterns, Alembic migrations, and transaction strategies.','fastapi_sqlalchemy2_handbook.pdf','/uploads/materials/fastapi_sqlalchemy2_handbook.pdf','pdf',428500,2,'2026-11-25 14:23:57','2026-11-25 14:23:57'),(2,1,2,1,2,'JWT Security, Refresh Rotation & OWASP Top 10 Slide Deck (PPTX)','Lecture slides covering token revocation, Argon2/bcrypt hashing, and RBAC permission matrices.','jwt_security_owasp_slides.pptx','/uploads/materials/jwt_security_owasp_slides.pptx','pptx',812400,2,'2026-11-25 14:23:57','2026-11-25 14:23:57'),(3,2,4,2,4,'Production RAG & LLM Evaluation Cheat Sheet (PDF)','Reference architectures for vector indexing, reranking, and faithfulness scoring.','production_rag_cheatsheet.pdf','/uploads/materials/production_rag_cheatsheet.pdf','pdf',512000,3,'2026-11-25 14:23:57','2026-11-25 14:23:57');
/*!40000 ALTER TABLE `study_materials` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `submissions`
--

DROP TABLE IF EXISTS `submissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `submissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `assignment_id` int NOT NULL,
  `student_id` int NOT NULL,
  `submission_text` text COLLATE utf8mb4_unicode_ci,
  `file_path` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `submitted_at` datetime NOT NULL DEFAULT (now()),
  `is_late` tinyint(1) NOT NULL,
  `status` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `marks_obtained` float DEFAULT NULL,
  `evaluated_by` int DEFAULT NULL,
  `evaluated_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT (now()),
  `updated_at` datetime NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_assignment_student_submission` (`assignment_id`,`student_id`),
  KEY `evaluated_by` (`evaluated_by`),
  KEY `ix_submissions_assignment_id` (`assignment_id`),
  KEY `ix_submissions_status` (`status`),
  KEY `ix_submissions_student_id` (`student_id`),
  CONSTRAINT `submissions_ibfk_1` FOREIGN KEY (`assignment_id`) REFERENCES `assignments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `submissions_ibfk_2` FOREIGN KEY (`evaluated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `submissions_ibfk_3` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `submissions`
--

LOCK TABLES `submissions` WRITE;
/*!40000 ALTER TABLE `submissions` DISABLE KEYS */;
INSERT INTO `submissions` VALUES (1,1,5,'Implemented complete SQLAlchemy 2.x models, Alembic migrations, JWT refresh token rotation, and 100% passing pytest suite.','/uploads/submissions/alex_rivera_fastapi_submission.pdf','alex_rivera_fastapi_submission.pdf','2026-11-23 14:23:58',0,'evaluated',94,2,'2026-11-24 14:23:58','2026-11-25 14:23:57','2026-11-25 14:23:57'),(2,1,6,'Completed all endpoints and role-based middleware. Attached API test report and schema documentation.','/uploads/submissions/sophia_martinez_api_project.zip','sophia_martinez_api_project.zip','2026-11-25 00:23:58',0,'submitted',NULL,NULL,NULL,'2026-11-25 14:23:57','2026-11-25 14:23:57');
/*!40000 ALTER TABLE `submissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_settings`
--

DROP TABLE IF EXISTS `system_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `setting_value` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `setting_group` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `updated_at` datetime NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ix_system_settings_setting_key` (`setting_key`),
  KEY `updated_by` (`updated_by`),
  CONSTRAINT `system_settings_ibfk_1` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_settings`
--

LOCK TABLES `system_settings` WRITE;
/*!40000 ALTER TABLE `system_settings` DISABLE KEYS */;
INSERT INTO `system_settings` VALUES (1,'institute_name','Nexus Institute of Technology & Training','general',NULL,1,'2026-11-25 14:23:58'),(2,'institute_tagline','Empowering Enterprise Engineering & Data Leaders','general',NULL,1,'2026-11-25 14:23:58'),(3,'institute_email','admissions@nexuslms.edu','general',NULL,1,'2026-11-25 14:23:58'),(4,'institute_phone','+1 (800) 555-0199','general',NULL,1,'2026-11-25 14:23:58'),(5,'currency_symbol','$','billing',NULL,1,'2026-11-25 14:23:58'),(6,'certificate_completion_threshold','75','academic',NULL,1,'2026-11-25 14:23:58'),(7,'attendance_minimum_threshold','75','academic',NULL,1,'2026-11-25 14:23:58');
/*!40000 ALTER TABLE `system_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `role_id` int NOT NULL,
  `full_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `avatar_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bio` text COLLATE utf8mb4_unicode_ci,
  `address` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `student_code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL,
  `is_deleted` tinyint(1) NOT NULL,
  `last_login_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT (now()),
  `updated_at` datetime NOT NULL DEFAULT (now()),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ix_users_email` (`email`),
  UNIQUE KEY `ix_users_student_code` (`student_code`),
  KEY `ix_users_full_name` (`full_name`),
  KEY `ix_users_is_active` (`is_active`),
  KEY `ix_users_is_deleted` (`is_deleted`),
  KEY `ix_users_role_id` (`role_id`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,1,'Dr. Eleanor Vance','admin@lms.com','+1 (415) 890-1001','$2b$12$FbQh8W9moluQvVqkw8CBYO47Umm9jUJz9E74Ujq3YWj6/mpFRQNzq',NULL,'Director of Academic Operations & Enterprise Administration.','San Francisco, CA',NULL,1,0,'2026-11-25 17:01:29','2026-11-25 14:23:55','2026-11-25 17:01:29'),(2,2,'Prof. Marcus Sterling','instructor@lms.com','+1 (415) 890-2001','$2b$12$7jJI0mVyLNGV3c54xxN5LOLK0UpeQOeLdjotr3AWRHvspxBWVkJXm','/images/instructor-marcus.svg','Principal Faculty in Full Stack & Cloud Architecture. Specializes in React 19, FastAPI, Kubernetes, Microservices.','Silicon Valley Campus, CA',NULL,1,0,'2026-11-25 17:01:29','2026-11-25 14:23:55','2026-11-25 17:01:29'),(3,2,'Dr. Priya Nair','priya.instructor@lms.com','+1 (415) 890-2002','$2b$12$A4FQY3ht7n2J7J912FCe0.sHS.cbb.Wwuf/YPXVeuEW7UNUXG2yKm','/images/instructor-priya.svg','Senior AI Architect in Artificial Intelligence & Data Science. Specializes in Deep Learning, LLMs, PyTorch, MLOps.','Silicon Valley Campus, CA',NULL,1,0,NULL,'2026-11-25 14:23:56','2026-11-25 17:01:20'),(4,2,'Prof. David Chen','david.instructor@lms.com','+1 (415) 890-2003','$2b$12$IsKBT76/GP.ouISbWTNoae0yZUjy2qET48i8PVqL8jBXfvYiAMczO','/images/instructor-david.svg','Lead Security Instructor in Cybersecurity & DevSecOps. Specializes in Zero-Trust Architecture, Penetration Testing, IAM.','Silicon Valley Campus, CA',NULL,1,0,NULL,'2026-11-25 14:23:56','2026-11-25 17:01:20'),(5,3,'Alex Rivera','student@lms.com','+1 (415) 890-3001','$2b$12$Ib7Of2ZAb9vp3EmLJCZWDe51fpcwhy29PwZK68cg386NmE0A1Tv4e',NULL,'Full-time Cohort Scholar at Nexus Institute.','San Jose, CA','STU-2026-0001',1,0,'2026-11-25 17:01:30','2026-11-25 14:23:56','2026-11-25 17:01:29'),(6,3,'Sophia Martinez','sophia.student@lms.com','+1 (415) 890-3002','$2b$12$gHsE8ZMkyHAaJ6LbzQW21eBC3L21Hoawm4fOcsUaSxHICGy5/sU46',NULL,'Full-time Cohort Scholar at Nexus Institute.','San Jose, CA','STU-2026-0002',1,0,NULL,'2026-11-25 14:23:56','2026-11-25 14:23:56'),(7,3,'Liam O\'Connor','liam.student@lms.com','+1 (415) 890-3003','$2b$12$eWLhTrigHuNa.R..XcQudORVclR0CW4BlLLBg6i3K0HCUOL6vh69y',NULL,'Full-time Cohort Scholar at Nexus Institute.','San Jose, CA','STU-2026-0003',1,0,NULL,'2026-11-25 14:23:56','2026-11-25 14:23:56'),(8,3,'Aisha Patel','aisha.student@lms.com','+1 (415) 890-3004','$2b$12$4cxDW2gTpx1VcQfgScFbjOiVluKSYjtei9RTGutOEQPS6JiSpkMcK',NULL,'Full-time Cohort Scholar at Nexus Institute.','San Jose, CA','STU-2026-0004',1,0,NULL,'2026-11-25 14:23:57','2026-11-25 14:23:57'),(9,3,'Noah Kim','noah.student@lms.com','+1 (415) 890-3005','$2b$12$FOvC2CkM4Jr1m9SkS/UIXu5tvZ/kMhlN0geqsSxx4Hb.Kdeg73D8G',NULL,'Full-time Cohort Scholar at Nexus Institute.','San Jose, CA','STU-2026-0005',1,0,NULL,'2026-11-25 14:23:57','2026-11-25 14:23:57'),(10,3,'Emma Lindqvist','emma.student@lms.com','+1 (415) 890-3006','$2b$12$L5YAjeQlW.gIybbGCbyVkOF7rt23MZjeFyqeppS4oV6D1/akBJ9MK',NULL,'Full-time Cohort Scholar at Nexus Institute.','San Jose, CA','STU-2026-0006',1,0,NULL,'2026-11-25 14:23:57','2026-11-25 14:23:57'),(11,3,'brijesh kumar pandey','bkpandey.pandey@gmail.com','9998003879','$2b$12$WEm25O9qdgNZyJ92CuXxru3kFJAjdr20CiKLlx9bimAQXwPacCq9K',NULL,NULL,NULL,'STU-2026-0011',1,0,NULL,'2026-11-25 16:43:26','2026-11-25 16:43:26');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'lms_db'
--

--
-- Dumping routines for database 'lms_db'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-25 17:02:58

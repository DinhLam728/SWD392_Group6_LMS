-- LMS Group 6 - Database v4 (MySQL 8.0+)
-- SCHEMA ONLY. Run this first, then seed_enrollment_demo.sql if sample data is needed.
-- WARNING: DROP DATABASE deletes ALL existing lms_g6 accounts and payments.
-- Current schema: 10 tables, courses.created_at, registration expiry and payment fields.
-- Registration expiry (24 hours) is set by application code, not a SQL scheduler.
-- Scores use 0..10; default passing_score is 5.00.

SET NAMES utf8mb4;

DROP DATABASE IF EXISTS lms_g6;
CREATE DATABASE lms_g6
    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE lms_g6;

-- 1. Accounts: login by email/password or Google.
CREATE TABLE users (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NULL,
    google_id VARCHAR(150) NULL UNIQUE,
    role ENUM('STUDENT', 'TEACHER') NOT NULL,
    status ENUM('PENDING', 'ACTIVE', 'LOCKED') NOT NULL DEFAULT 'PENDING'
);

-- 2. Courses managed by teachers; price is used for enrollment payment.
CREATE TABLE courses (
    course_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    teacher_id BIGINT NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT NULL,
    thumbnail_url VARCHAR(500) NULL,
    price DECIMAL(12, 2) NOT NULL,
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_courses_teacher
        FOREIGN KEY (teacher_id) REFERENCES users(user_id),
    CONSTRAINT ck_course_price CHECK (price > 0)
);

-- 3. Required by the new Course -> Module -> Lesson scope.
CREATE TABLE modules (
    module_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    course_id BIGINT NOT NULL,
    title VARCHAR(150) NOT NULL,
    position INT NOT NULL,
    CONSTRAINT fk_modules_course
        FOREIGN KEY (course_id) REFERENCES courses(course_id),
    CONSTRAINT uq_module_position UNIQUE (course_id, position)
);

-- 4. Learning material belonging to a module.
CREATE TABLE lessons (
    lesson_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    module_id BIGINT NOT NULL,
    title VARCHAR(150) NOT NULL,
    content TEXT NULL,
    position INT NOT NULL,
    CONSTRAINT fk_lessons_module
        FOREIGN KEY (module_id) REFERENCES modules(module_id),
    CONSTRAINT uq_lesson_position UNIQUE (module_id, position)
);

-- 5. Practice quizzes associated with modules.
CREATE TABLE quizzes (
    quiz_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    module_id BIGINT NOT NULL,
    title VARCHAR(150) NOT NULL,
    status ENUM('DRAFT', 'ACTIVE') NOT NULL DEFAULT 'DRAFT',
    CONSTRAINT fk_quizzes_module
        FOREIGN KEY (module_id) REFERENCES modules(module_id)
);

-- 6. Per-quiz configuration (quiz 1 -> 0..1 quiz_config).
-- question_count = NULL means use all questions assigned to that quiz.
-- When random_questions = TRUE and question_count is not NULL, choose
-- a random subset from questions WHERE quiz_id = current quiz.
-- shuffle_questions changes display order; shuffle_options changes choice order.
-- At attempt start, persist the chosen question IDs in attempt_answers
-- (submitted_answer remains NULL until the student answers).
CREATE TABLE quiz_configs (
    config_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    quiz_id BIGINT NOT NULL UNIQUE,
    duration_minutes INT NOT NULL DEFAULT 30,
    max_attempts INT NOT NULL DEFAULT 1,
    passing_score DECIMAL(5, 2) NOT NULL DEFAULT 5.00,
    question_count INT NULL DEFAULT NULL,
    random_questions BOOLEAN NOT NULL DEFAULT FALSE,
    shuffle_questions BOOLEAN NOT NULL DEFAULT FALSE,
    shuffle_options BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_quiz_configs_quiz
        FOREIGN KEY (quiz_id) REFERENCES quizzes(quiz_id),
    CONSTRAINT ck_config_duration CHECK (duration_minutes > 0),
    CONSTRAINT ck_config_attempts CHECK (max_attempts > 0),
    CONSTRAINT ck_config_passing_score CHECK (passing_score BETWEEN 0 AND 10),
    CONSTRAINT ck_config_question_count CHECK (question_count IS NULL OR question_count > 0)
);

-- 7. Course question bank. quiz_id=NULL means not yet assigned to a quiz.
CREATE TABLE questions (
    question_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    course_id BIGINT NOT NULL,
    quiz_id BIGINT NULL,
    content TEXT NOT NULL,
    question_type VARCHAR(30) NOT NULL,
    options_json JSON NULL,
    correct_answer TEXT NOT NULL,
    CONSTRAINT fk_questions_course
        FOREIGN KEY (course_id) REFERENCES courses(course_id),
    CONSTRAINT fk_questions_quiz
        FOREIGN KEY (quiz_id) REFERENCES quizzes(quiz_id)
);

-- 8. Student course registrations with embedded payment information.
CREATE TABLE registrations (
    registration_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    status ENUM('PENDING', 'ACTIVE', 'EXPIRED') NOT NULL DEFAULT 'PENDING',
    registered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    payment_code VARCHAR(50) NULL UNIQUE,
    transaction_ref VARCHAR(100) NULL UNIQUE,
    payment_status ENUM('PENDING', 'SUCCESS', 'FAILED') NOT NULL DEFAULT 'PENDING',
    paid_at DATETIME NULL,
    CONSTRAINT fk_registrations_student
        FOREIGN KEY (student_id) REFERENCES users(user_id),
    CONSTRAINT fk_registrations_course
        FOREIGN KEY (course_id) REFERENCES courses(course_id),
    INDEX idx_registration_student_course (student_id, course_id)
);

-- 9. Each student attempt to take a quiz.
CREATE TABLE quiz_attempts (
    attempt_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    quiz_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    score DECIMAL(5, 2) NULL,
    status ENUM('IN_PROGRESS', 'SUBMITTED', 'GRADED') NOT NULL DEFAULT 'IN_PROGRESS',
    started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    submitted_at DATETIME NULL,
    CONSTRAINT ck_attempt_score CHECK (score IS NULL OR score BETWEEN 0 AND 10),
    CONSTRAINT fk_attempts_quiz
        FOREIGN KEY (quiz_id) REFERENCES quizzes(quiz_id),
    CONSTRAINT fk_attempts_student
        FOREIGN KEY (student_id) REFERENCES users(user_id)
);

-- 10. Submitted answers for an individual attempt.
CREATE TABLE attempt_answers (
    answer_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    attempt_id BIGINT NOT NULL,
    question_id BIGINT NOT NULL,
    submitted_answer TEXT NULL,
    is_correct BOOLEAN NULL,
    CONSTRAINT fk_answers_attempt
        FOREIGN KEY (attempt_id) REFERENCES quiz_attempts(attempt_id),
    CONSTRAINT fk_answers_question
        FOREIGN KEY (question_id) REFERENCES questions(question_id),
    CONSTRAINT uq_attempt_question UNIQUE (attempt_id, question_id)
);

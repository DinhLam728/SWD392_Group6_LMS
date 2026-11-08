-- LMS Group 6 - Student practice quizzes: who created a quiz.
-- Run ONCE on a database created from an older lms_g6_v4.sql (the shared TiDB already has it).
-- lms_g6_v4.sql already includes this column for new databases.
-- created_by NULL = quiz of the teacher/seed; otherwise the student who created the practice quiz.
SET NAMES utf8mb4;
USE lms_g6;

ALTER TABLE quizzes ADD COLUMN created_by BIGINT NULL;
ALTER TABLE quizzes ADD CONSTRAINT fk_quizzes_creator FOREIGN KEY (created_by) REFERENCES users(user_id);

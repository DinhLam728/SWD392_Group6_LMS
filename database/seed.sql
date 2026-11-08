-- =====================================================================
-- LMS Group 6 - Demo data (run after schema.sql)
--   mysql -u root -p < database/seed.sql
--
-- Demo accounts (no email OTP needed):
--   Teacher (owns all sample courses): teacher.enrollment@example.test / Teacher@123
--   Teacher (no courses yet):          teacher.test@example.test       / Teacher@123
--   Student:                           student.demo@example.test       / Student@123
--
-- 18 published courses, 24 modules, 72 lessons, 24 teacher quizzes, course cover images.
-- Course "Git và GitHub cho làm việc nhóm": real lesson content and 10 questions;
-- the demo student is already enrolled (paid) in this course.
-- =====================================================================

SET NAMES utf8mb4;
USE lms_g6;
SET @old_safe_updates = @@SQL_SAFE_UPDATES;
SET SQL_SAFE_UPDATES = 0;

START TRANSACTION;
-- Local demo login only: teacher.test@example.test / Teacher@123
INSERT INTO users (full_name, email, password_hash, role, status)
SELECT 'Giảng viên Test', 'teacher.test@example.test', '$2a$10$6Zo1eya9JbH3.a0PZz21a.78E/rvgDvLTXJWD95D.9zm76UmyN4PG', 'TEACHER', 'ACTIVE'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email='teacher.test@example.test');

INSERT INTO users (full_name, email, role, status)
SELECT 'Giảng viên LMS Demo', 'teacher.enrollment@example.test', 'TEACHER', 'ACTIVE'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'teacher.enrollment@example.test');
SET @teacher_id = (SELECT user_id FROM users WHERE email = 'teacher.enrollment@example.test' AND role = 'TEACHER');

INSERT INTO courses (teacher_id, title, description, price, is_published, created_at)
SELECT @teacher_id, 'Java căn bản cho người mới bắt đầu', 'Làm quen Java, biến, điều kiện, vòng lặp và lập trình hướng đối tượng qua các bài thực hành nhỏ.', 10000, TRUE, DATE_ADD('2026-10-01 09:00:00', INTERVAL 0 DAY)
WHERE @teacher_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM courses WHERE teacher_id = @teacher_id AND title = 'Java căn bản cho người mới bắt đầu');
SET @course_id = (SELECT MIN(course_id) FROM courses WHERE teacher_id = @teacher_id AND title = 'Java căn bản cho người mới bắt đầu');
INSERT INTO modules (course_id, title, position)
SELECT @course_id, 'Làm quen với Java', 1
WHERE @course_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM modules WHERE course_id = @course_id AND position = 1);
SET @module_id = (SELECT module_id FROM modules WHERE course_id = @course_id AND position = 1);
INSERT INTO lessons (module_id, title, content, position)
SELECT @module_id, 'Giới thiệu: Làm quen với Java', 'Nội dung minh họa để xem cấu trúc khóa học. Chức năng học bài thuộc phần triển khai riêng.', 1
WHERE @module_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM lessons WHERE module_id = @module_id AND position = 1);
INSERT INTO modules (course_id, title, position)
SELECT @course_id, 'Lập trình hướng đối tượng', 2
WHERE @course_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM modules WHERE course_id = @course_id AND position = 2);
SET @module_id = (SELECT module_id FROM modules WHERE course_id = @course_id AND position = 2);
INSERT INTO lessons (module_id, title, content, position)
SELECT @module_id, 'Giới thiệu: Lập trình hướng đối tượng', 'Nội dung minh họa để xem cấu trúc khóa học. Chức năng học bài thuộc phần triển khai riêng.', 1
WHERE @module_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM lessons WHERE module_id = @module_id AND position = 1);

INSERT INTO courses (teacher_id, title, description, price, is_published, created_at)
SELECT @teacher_id, 'ReactJS: xây dựng giao diện web', 'Thực hành component, props, state và gọi REST API để xây dựng ứng dụng React.', 20000, TRUE, DATE_ADD('2026-10-01 09:00:00', INTERVAL 1 DAY)
WHERE @teacher_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM courses WHERE teacher_id = @teacher_id AND title = 'ReactJS: xây dựng giao diện web');
SET @course_id = (SELECT MIN(course_id) FROM courses WHERE teacher_id = @teacher_id AND title = 'ReactJS: xây dựng giao diện web');
INSERT INTO modules (course_id, title, position)
SELECT @course_id, 'Component và JSX', 1
WHERE @course_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM modules WHERE course_id = @course_id AND position = 1);
SET @module_id = (SELECT module_id FROM modules WHERE course_id = @course_id AND position = 1);
INSERT INTO lessons (module_id, title, content, position)
SELECT @module_id, 'Giới thiệu: Component và JSX', 'Nội dung minh họa để xem cấu trúc khóa học. Chức năng học bài thuộc phần triển khai riêng.', 1
WHERE @module_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM lessons WHERE module_id = @module_id AND position = 1);
INSERT INTO modules (course_id, title, position)
SELECT @course_id, 'State, hooks và REST API', 2
WHERE @course_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM modules WHERE course_id = @course_id AND position = 2);
SET @module_id = (SELECT module_id FROM modules WHERE course_id = @course_id AND position = 2);
INSERT INTO lessons (module_id, title, content, position)
SELECT @module_id, 'Giới thiệu: State, hooks và REST API', 'Nội dung minh họa để xem cấu trúc khóa học. Chức năng học bài thuộc phần triển khai riêng.', 1
WHERE @module_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM lessons WHERE module_id = @module_id AND position = 1);

INSERT INTO courses (teacher_id, title, description, price, is_published, created_at)
SELECT @teacher_id, 'Spring Boot REST API cơ bản', 'Tìm hiểu controller, service, repository và cách xây dựng REST API với Spring Boot.', 30000, TRUE, DATE_ADD('2026-10-01 09:00:00', INTERVAL 2 DAY)
WHERE @teacher_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM courses WHERE teacher_id = @teacher_id AND title = 'Spring Boot REST API cơ bản');
SET @course_id = (SELECT MIN(course_id) FROM courses WHERE teacher_id = @teacher_id AND title = 'Spring Boot REST API cơ bản');
INSERT INTO modules (course_id, title, position)
SELECT @course_id, 'Khởi tạo Spring Boot', 1
WHERE @course_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM modules WHERE course_id = @course_id AND position = 1);
SET @module_id = (SELECT module_id FROM modules WHERE course_id = @course_id AND position = 1);
INSERT INTO lessons (module_id, title, content, position)
SELECT @module_id, 'Giới thiệu: Khởi tạo Spring Boot', 'Nội dung minh họa để xem cấu trúc khóa học. Chức năng học bài thuộc phần triển khai riêng.', 1
WHERE @module_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM lessons WHERE module_id = @module_id AND position = 1);
INSERT INTO modules (course_id, title, position)
SELECT @course_id, 'REST API và cơ sở dữ liệu', 2
WHERE @course_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM modules WHERE course_id = @course_id AND position = 2);
SET @module_id = (SELECT module_id FROM modules WHERE course_id = @course_id AND position = 2);
INSERT INTO lessons (module_id, title, content, position)
SELECT @module_id, 'Giới thiệu: REST API và cơ sở dữ liệu', 'Nội dung minh họa để xem cấu trúc khóa học. Chức năng học bài thuộc phần triển khai riêng.', 1
WHERE @module_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM lessons WHERE module_id = @module_id AND position = 1);

INSERT INTO courses (teacher_id, title, description, price, is_published, created_at)
SELECT @teacher_id, 'MySQL và thiết kế cơ sở dữ liệu', 'Học câu lệnh SQL, quan hệ giữa các bảng, JOIN và thiết kế database cho ứng dụng web.', 15000, TRUE, DATE_ADD('2026-10-01 09:00:00', INTERVAL 3 DAY)
WHERE @teacher_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM courses WHERE teacher_id = @teacher_id AND title = 'MySQL và thiết kế cơ sở dữ liệu');
SET @course_id = (SELECT MIN(course_id) FROM courses WHERE teacher_id = @teacher_id AND title = 'MySQL và thiết kế cơ sở dữ liệu');
INSERT INTO modules (course_id, title, position)
SELECT @course_id, 'Truy vấn SQL cơ bản', 1
WHERE @course_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM modules WHERE course_id = @course_id AND position = 1);
SET @module_id = (SELECT module_id FROM modules WHERE course_id = @course_id AND position = 1);
INSERT INTO lessons (module_id, title, content, position)
SELECT @module_id, 'Giới thiệu: Truy vấn SQL cơ bản', 'Nội dung minh họa để xem cấu trúc khóa học. Chức năng học bài thuộc phần triển khai riêng.', 1
WHERE @module_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM lessons WHERE module_id = @module_id AND position = 1);
INSERT INTO modules (course_id, title, position)
SELECT @course_id, 'Quan hệ và JOIN', 2
WHERE @course_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM modules WHERE course_id = @course_id AND position = 2);
SET @module_id = (SELECT module_id FROM modules WHERE course_id = @course_id AND position = 2);
INSERT INTO lessons (module_id, title, content, position)
SELECT @module_id, 'Giới thiệu: Quan hệ và JOIN', 'Nội dung minh họa để xem cấu trúc khóa học. Chức năng học bài thuộc phần triển khai riêng.', 1
WHERE @module_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM lessons WHERE module_id = @module_id AND position = 1);

INSERT INTO courses (teacher_id, title, description, price, is_published, created_at)
SELECT @teacher_id, 'Git và GitHub cho làm việc nhóm', 'Thực hành commit, branch, pull request và xử lý conflict trong dự án nhóm.', 5000, TRUE, DATE_ADD('2026-10-01 09:00:00', INTERVAL 4 DAY)
WHERE @teacher_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM courses WHERE teacher_id = @teacher_id AND title = 'Git và GitHub cho làm việc nhóm');
SET @course_id = (SELECT MIN(course_id) FROM courses WHERE teacher_id = @teacher_id AND title = 'Git và GitHub cho làm việc nhóm');
INSERT INTO modules (course_id, title, position)
SELECT @course_id, 'Commit và branch', 1
WHERE @course_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM modules WHERE course_id = @course_id AND position = 1);
SET @module_id = (SELECT module_id FROM modules WHERE course_id = @course_id AND position = 1);
INSERT INTO lessons (module_id, title, content, position)
SELECT @module_id, 'Giới thiệu: Commit và branch', 'Nội dung minh họa để xem cấu trúc khóa học. Chức năng học bài thuộc phần triển khai riêng.', 1
WHERE @module_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM lessons WHERE module_id = @module_id AND position = 1);
INSERT INTO modules (course_id, title, position)
SELECT @course_id, 'Merge và xử lý conflict', 2
WHERE @course_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM modules WHERE course_id = @course_id AND position = 2);
SET @module_id = (SELECT module_id FROM modules WHERE course_id = @course_id AND position = 2);
INSERT INTO lessons (module_id, title, content, position)
SELECT @module_id, 'Giới thiệu: Merge và xử lý conflict', 'Nội dung minh họa để xem cấu trúc khóa học. Chức năng học bài thuộc phần triển khai riêng.', 1
WHERE @module_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM lessons WHERE module_id = @module_id AND position = 1);

INSERT INTO courses (teacher_id, title, description, price, is_published, created_at)
SELECT @teacher_id, 'JavaScript thực hành cho frontend', 'Ôn tập JavaScript hiện đại, xử lý bất đồng bộ và thao tác dữ liệu trước khi học React.', 25000, TRUE, DATE_ADD('2026-10-01 09:00:00', INTERVAL 5 DAY)
WHERE @teacher_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM courses WHERE teacher_id = @teacher_id AND title = 'JavaScript thực hành cho frontend');
SET @course_id = (SELECT MIN(course_id) FROM courses WHERE teacher_id = @teacher_id AND title = 'JavaScript thực hành cho frontend');
INSERT INTO modules (course_id, title, position)
SELECT @course_id, 'JavaScript hiện đại', 1
WHERE @course_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM modules WHERE course_id = @course_id AND position = 1);
SET @module_id = (SELECT module_id FROM modules WHERE course_id = @course_id AND position = 1);
INSERT INTO lessons (module_id, title, content, position)
SELECT @module_id, 'Giới thiệu: JavaScript hiện đại', 'Nội dung minh họa để xem cấu trúc khóa học. Chức năng học bài thuộc phần triển khai riêng.', 1
WHERE @module_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM lessons WHERE module_id = @module_id AND position = 1);
INSERT INTO modules (course_id, title, position)
SELECT @course_id, 'Promise và async/await', 2
WHERE @course_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM modules WHERE course_id = @course_id AND position = 2);
SET @module_id = (SELECT module_id FROM modules WHERE course_id = @course_id AND position = 2);
INSERT INTO lessons (module_id, title, content, position)
SELECT @module_id, 'Giới thiệu: Promise và async/await', 'Nội dung minh họa để xem cấu trúc khóa học. Chức năng học bài thuộc phần triển khai riêng.', 1
WHERE @module_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM lessons WHERE module_id = @module_id AND position = 1);
INSERT INTO courses (teacher_id, title, description, price, is_published, created_at)
SELECT @teacher_id, 'HTML và CSS: thiết kế web responsive', 'Khóa học thực hành: HTML và CSS: thiết kế web responsive. Học qua ví dụ và bài tập trong dự án web.', 35000, TRUE, DATE_ADD('2026-10-01 09:00:00', INTERVAL 6 DAY)
WHERE @teacher_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM courses WHERE teacher_id=@teacher_id AND title='HTML và CSS: thiết kế web responsive');
SET @course_id=(SELECT MIN(course_id) FROM courses WHERE teacher_id=@teacher_id AND title='HTML và CSS: thiết kế web responsive');
INSERT INTO modules (course_id,title,position)
SELECT @course_id,'Kiến thức nền tảng và thực hành',1 WHERE @course_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM modules WHERE course_id=@course_id AND position=1);
INSERT INTO lessons (module_id,title,content,position)
SELECT module_id,'Giới thiệu khóa học','Bài học mẫu để kiểm tra giao diện khóa học.',1 FROM modules m WHERE m.course_id=@course_id AND m.position=1 AND NOT EXISTS (SELECT 1 FROM lessons l WHERE l.module_id=m.module_id AND l.position=1);
INSERT INTO courses (teacher_id, title, description, price, is_published, created_at)
SELECT @teacher_id, 'TypeScript cho lập trình viên JavaScript', 'Khóa học thực hành: TypeScript cho lập trình viên JavaScript. Học qua ví dụ và bài tập trong dự án web.', 40000, TRUE, DATE_ADD('2026-10-01 09:00:00', INTERVAL 7 DAY)
WHERE @teacher_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM courses WHERE teacher_id=@teacher_id AND title='TypeScript cho lập trình viên JavaScript');
SET @course_id=(SELECT MIN(course_id) FROM courses WHERE teacher_id=@teacher_id AND title='TypeScript cho lập trình viên JavaScript');
INSERT INTO modules (course_id,title,position)
SELECT @course_id,'Kiến thức nền tảng và thực hành',1 WHERE @course_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM modules WHERE course_id=@course_id AND position=1);
INSERT INTO lessons (module_id,title,content,position)
SELECT module_id,'Giới thiệu khóa học','Bài học mẫu để kiểm tra giao diện khóa học.',1 FROM modules m WHERE m.course_id=@course_id AND m.position=1 AND NOT EXISTS (SELECT 1 FROM lessons l WHERE l.module_id=m.module_id AND l.position=1);
INSERT INTO courses (teacher_id, title, description, price, is_published, created_at)
SELECT @teacher_id, 'Node.js và Express REST API', 'Khóa học thực hành: Node.js và Express REST API. Học qua ví dụ và bài tập trong dự án web.', 45000, TRUE, DATE_ADD('2026-10-01 09:00:00', INTERVAL 8 DAY)
WHERE @teacher_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM courses WHERE teacher_id=@teacher_id AND title='Node.js và Express REST API');
SET @course_id=(SELECT MIN(course_id) FROM courses WHERE teacher_id=@teacher_id AND title='Node.js và Express REST API');
INSERT INTO modules (course_id,title,position)
SELECT @course_id,'Kiến thức nền tảng và thực hành',1 WHERE @course_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM modules WHERE course_id=@course_id AND position=1);
INSERT INTO lessons (module_id,title,content,position)
SELECT module_id,'Giới thiệu khóa học','Bài học mẫu để kiểm tra giao diện khóa học.',1 FROM modules m WHERE m.course_id=@course_id AND m.position=1 AND NOT EXISTS (SELECT 1 FROM lessons l WHERE l.module_id=m.module_id AND l.position=1);
INSERT INTO courses (teacher_id, title, description, price, is_published, created_at)
SELECT @teacher_id, 'Kiểm thử phần mềm với JUnit', 'Khóa học thực hành: Kiểm thử phần mềm với JUnit. Học qua ví dụ và bài tập trong dự án web.', 50000, TRUE, DATE_ADD('2026-10-01 09:00:00', INTERVAL 9 DAY)
WHERE @teacher_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM courses WHERE teacher_id=@teacher_id AND title='Kiểm thử phần mềm với JUnit');
SET @course_id=(SELECT MIN(course_id) FROM courses WHERE teacher_id=@teacher_id AND title='Kiểm thử phần mềm với JUnit');
INSERT INTO modules (course_id,title,position)
SELECT @course_id,'Kiến thức nền tảng và thực hành',1 WHERE @course_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM modules WHERE course_id=@course_id AND position=1);
INSERT INTO lessons (module_id,title,content,position)
SELECT module_id,'Giới thiệu khóa học','Bài học mẫu để kiểm tra giao diện khóa học.',1 FROM modules m WHERE m.course_id=@course_id AND m.position=1 AND NOT EXISTS (SELECT 1 FROM lessons l WHERE l.module_id=m.module_id AND l.position=1);
INSERT INTO courses (teacher_id, title, description, price, is_published, created_at)
SELECT @teacher_id, 'Docker cơ bản cho dự án web', 'Khóa học thực hành: Docker cơ bản cho dự án web. Học qua ví dụ và bài tập trong dự án web.', 55000, TRUE, DATE_ADD('2026-10-01 09:00:00', INTERVAL 10 DAY)
WHERE @teacher_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM courses WHERE teacher_id=@teacher_id AND title='Docker cơ bản cho dự án web');
SET @course_id=(SELECT MIN(course_id) FROM courses WHERE teacher_id=@teacher_id AND title='Docker cơ bản cho dự án web');
INSERT INTO modules (course_id,title,position)
SELECT @course_id,'Kiến thức nền tảng và thực hành',1 WHERE @course_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM modules WHERE course_id=@course_id AND position=1);
INSERT INTO lessons (module_id,title,content,position)
SELECT module_id,'Giới thiệu khóa học','Bài học mẫu để kiểm tra giao diện khóa học.',1 FROM modules m WHERE m.course_id=@course_id AND m.position=1 AND NOT EXISTS (SELECT 1 FROM lessons l WHERE l.module_id=m.module_id AND l.position=1);
INSERT INTO courses (teacher_id, title, description, price, is_published, created_at)
SELECT @teacher_id, 'Thiết kế API và xử lý exception', 'Khóa học thực hành: Thiết kế API và xử lý exception. Học qua ví dụ và bài tập trong dự án web.', 60000, TRUE, DATE_ADD('2026-10-01 09:00:00', INTERVAL 11 DAY)
WHERE @teacher_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM courses WHERE teacher_id=@teacher_id AND title='Thiết kế API và xử lý exception');
SET @course_id=(SELECT MIN(course_id) FROM courses WHERE teacher_id=@teacher_id AND title='Thiết kế API và xử lý exception');
INSERT INTO modules (course_id,title,position)
SELECT @course_id,'Kiến thức nền tảng và thực hành',1 WHERE @course_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM modules WHERE course_id=@course_id AND position=1);
INSERT INTO lessons (module_id,title,content,position)
SELECT module_id,'Giới thiệu khóa học','Bài học mẫu để kiểm tra giao diện khóa học.',1 FROM modules m WHERE m.course_id=@course_id AND m.position=1 AND NOT EXISTS (SELECT 1 FROM lessons l WHERE l.module_id=m.module_id AND l.position=1);
INSERT INTO courses (teacher_id, title, description, price, is_published, created_at)
SELECT @teacher_id, 'Spring Security và JWT', 'Khóa học thực hành: Spring Security và JWT. Học qua ví dụ và bài tập trong dự án web.', 65000, TRUE, DATE_ADD('2026-10-01 09:00:00', INTERVAL 12 DAY)
WHERE @teacher_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM courses WHERE teacher_id=@teacher_id AND title='Spring Security và JWT');
SET @course_id=(SELECT MIN(course_id) FROM courses WHERE teacher_id=@teacher_id AND title='Spring Security và JWT');
INSERT INTO modules (course_id,title,position)
SELECT @course_id,'Kiến thức nền tảng và thực hành',1 WHERE @course_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM modules WHERE course_id=@course_id AND position=1);
INSERT INTO lessons (module_id,title,content,position)
SELECT module_id,'Giới thiệu khóa học','Bài học mẫu để kiểm tra giao diện khóa học.',1 FROM modules m WHERE m.course_id=@course_id AND m.position=1 AND NOT EXISTS (SELECT 1 FROM lessons l WHERE l.module_id=m.module_id AND l.position=1);
INSERT INTO courses (teacher_id, title, description, price, is_published, created_at)
SELECT @teacher_id, 'Cấu trúc dữ liệu và giải thuật', 'Khóa học thực hành: Cấu trúc dữ liệu và giải thuật. Học qua ví dụ và bài tập trong dự án web.', 70000, TRUE, DATE_ADD('2026-10-01 09:00:00', INTERVAL 13 DAY)
WHERE @teacher_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM courses WHERE teacher_id=@teacher_id AND title='Cấu trúc dữ liệu và giải thuật');
SET @course_id=(SELECT MIN(course_id) FROM courses WHERE teacher_id=@teacher_id AND title='Cấu trúc dữ liệu và giải thuật');
INSERT INTO modules (course_id,title,position)
SELECT @course_id,'Kiến thức nền tảng và thực hành',1 WHERE @course_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM modules WHERE course_id=@course_id AND position=1);
INSERT INTO lessons (module_id,title,content,position)
SELECT module_id,'Giới thiệu khóa học','Bài học mẫu để kiểm tra giao diện khóa học.',1 FROM modules m WHERE m.course_id=@course_id AND m.position=1 AND NOT EXISTS (SELECT 1 FROM lessons l WHERE l.module_id=m.module_id AND l.position=1);
INSERT INTO courses (teacher_id, title, description, price, is_published, created_at)
SELECT @teacher_id, 'SQL nâng cao và tối ưu truy vấn', 'Khóa học thực hành: SQL nâng cao và tối ưu truy vấn. Học qua ví dụ và bài tập trong dự án web.', 75000, TRUE, DATE_ADD('2026-10-01 09:00:00', INTERVAL 14 DAY)
WHERE @teacher_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM courses WHERE teacher_id=@teacher_id AND title='SQL nâng cao và tối ưu truy vấn');
SET @course_id=(SELECT MIN(course_id) FROM courses WHERE teacher_id=@teacher_id AND title='SQL nâng cao và tối ưu truy vấn');
INSERT INTO modules (course_id,title,position)
SELECT @course_id,'Kiến thức nền tảng và thực hành',1 WHERE @course_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM modules WHERE course_id=@course_id AND position=1);
INSERT INTO lessons (module_id,title,content,position)
SELECT module_id,'Giới thiệu khóa học','Bài học mẫu để kiểm tra giao diện khóa học.',1 FROM modules m WHERE m.course_id=@course_id AND m.position=1 AND NOT EXISTS (SELECT 1 FROM lessons l WHERE l.module_id=m.module_id AND l.position=1);
INSERT INTO courses (teacher_id, title, description, price, is_published, created_at)
SELECT @teacher_id, 'UI UX cơ bản cho lập trình viên', 'Khóa học thực hành: UI UX cơ bản cho lập trình viên. Học qua ví dụ và bài tập trong dự án web.', 80000, TRUE, DATE_ADD('2026-10-01 09:00:00', INTERVAL 15 DAY)
WHERE @teacher_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM courses WHERE teacher_id=@teacher_id AND title='UI UX cơ bản cho lập trình viên');
SET @course_id=(SELECT MIN(course_id) FROM courses WHERE teacher_id=@teacher_id AND title='UI UX cơ bản cho lập trình viên');
INSERT INTO modules (course_id,title,position)
SELECT @course_id,'Kiến thức nền tảng và thực hành',1 WHERE @course_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM modules WHERE course_id=@course_id AND position=1);
INSERT INTO lessons (module_id,title,content,position)
SELECT module_id,'Giới thiệu khóa học','Bài học mẫu để kiểm tra giao diện khóa học.',1 FROM modules m WHERE m.course_id=@course_id AND m.position=1 AND NOT EXISTS (SELECT 1 FROM lessons l WHERE l.module_id=m.module_id AND l.position=1);
INSERT INTO courses (teacher_id, title, description, price, is_published, created_at)
SELECT @teacher_id, 'React Hooks và quản lý state', 'Khóa học thực hành: React Hooks và quản lý state. Học qua ví dụ và bài tập trong dự án web.', 85000, TRUE, DATE_ADD('2026-10-01 09:00:00', INTERVAL 16 DAY)
WHERE @teacher_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM courses WHERE teacher_id=@teacher_id AND title='React Hooks và quản lý state');
SET @course_id=(SELECT MIN(course_id) FROM courses WHERE teacher_id=@teacher_id AND title='React Hooks và quản lý state');
INSERT INTO modules (course_id,title,position)
SELECT @course_id,'Kiến thức nền tảng và thực hành',1 WHERE @course_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM modules WHERE course_id=@course_id AND position=1);
INSERT INTO lessons (module_id,title,content,position)
SELECT module_id,'Giới thiệu khóa học','Bài học mẫu để kiểm tra giao diện khóa học.',1 FROM modules m WHERE m.course_id=@course_id AND m.position=1 AND NOT EXISTS (SELECT 1 FROM lessons l WHERE l.module_id=m.module_id AND l.position=1);
INSERT INTO courses (teacher_id, title, description, price, is_published, created_at)
SELECT @teacher_id, 'Triển khai ứng dụng web thực tế', 'Khóa học thực hành: Triển khai ứng dụng web thực tế. Học qua ví dụ và bài tập trong dự án web.', 90000, TRUE, DATE_ADD('2026-10-01 09:00:00', INTERVAL 17 DAY)
WHERE @teacher_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM courses WHERE teacher_id=@teacher_id AND title='Triển khai ứng dụng web thực tế');
SET @course_id=(SELECT MIN(course_id) FROM courses WHERE teacher_id=@teacher_id AND title='Triển khai ứng dụng web thực tế');
INSERT INTO modules (course_id,title,position)
SELECT @course_id,'Kiến thức nền tảng và thực hành',1 WHERE @course_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM modules WHERE course_id=@course_id AND position=1);
INSERT INTO lessons (module_id,title,content,position)
SELECT module_id,'Giới thiệu khóa học','Bài học mẫu để kiểm tra giao diện khóa học.',1 FROM modules m WHERE m.course_id=@course_id AND m.position=1 AND NOT EXISTS (SELECT 1 FROM lessons l WHERE l.module_id=m.module_id AND l.position=1);
-- Demo outline titles only. Quiz execution and questions are outside this seed.
INSERT INTO lessons (module_id, title, content, position)
SELECT m.module_id, CONCAT('Thực hành: ', m.title), 'Nội dung mẫu phục vụ xem mục lục.', 2
FROM modules m JOIN courses c ON c.course_id=m.course_id JOIN users u ON u.user_id=c.teacher_id
WHERE u.email='teacher.enrollment@example.test'
AND NOT EXISTS (SELECT 1 FROM lessons l WHERE l.module_id=m.module_id AND l.position=2);
INSERT INTO lessons (module_id, title, content, position)
SELECT m.module_id, CONCAT('Tổng kết: ', m.title), 'Nội dung mẫu phục vụ xem mục lục.', 3
FROM modules m JOIN courses c ON c.course_id=m.course_id JOIN users u ON u.user_id=c.teacher_id
WHERE u.email='teacher.enrollment@example.test'
AND NOT EXISTS (SELECT 1 FROM lessons l WHERE l.module_id=m.module_id AND l.position=3);
INSERT INTO quizzes (module_id, title, status)
SELECT m.module_id, CONCAT('Ôn tập: ', m.title), 'ACTIVE'
FROM modules m JOIN courses c ON c.course_id=m.course_id JOIN users u ON u.user_id=c.teacher_id
WHERE u.email='teacher.enrollment@example.test'
AND NOT EXISTS (SELECT 1 FROM quizzes q WHERE q.module_id=m.module_id AND q.title=CONCAT('Ôn tập: ',m.title));

-- BEGIN lesson content: Git và GitHub cho làm việc nhóm
-- Real lesson bodies for testing the student lesson page. Only replaces the placeholder texts above,
-- so lessons a teacher has already edited are kept.
UPDATE lessons l
JOIN modules m ON m.module_id = l.module_id
JOIN courses c ON c.course_id = m.course_id
JOIN users u ON u.user_id = c.teacher_id
JOIN (
SELECT 1 AS module_position, 1 AS lesson_position, 'Mục tiêu bài học
- Hiểu Git là gì và vì sao làm việc nhóm cần quản lý phiên bản.
- Phân biệt working directory, staging area và repository.
- Biết commit và branch dùng để làm gì.

1. Git là gì?
Git là hệ thống quản lý phiên bản phân tán. Mỗi thành viên có một bản sao đầy đủ lịch sử dự án trên máy mình, nên có thể làm việc offline và chỉ đồng bộ khi cần.

2. Ba vùng làm việc của Git
- Working directory: thư mục bạn đang sửa code.
- Staging area: nơi gom các thay đổi sẽ đưa vào commit tiếp theo (git add).
- Repository: lịch sử các commit đã lưu (git commit).

3. Commit
Commit là một "ảnh chụp" trạng thái dự án tại một thời điểm, kèm thông điệp mô tả thay đổi. Commit nên nhỏ, làm một việc và có thông điệp rõ ràng, ví dụ: "Add course detail page".

4. Branch
Branch là một nhánh phát triển độc lập. Mỗi tính năng nên làm trên một branch riêng (ví dụ feature/enroll-course) để không ảnh hưởng nhánh main cho đến khi được review và merge.' AS content
UNION ALL SELECT 1, 2, 'Thực hành: tạo commit và branch đầu tiên

Bước 1. Khởi tạo repository
  git init
  git status

Bước 2. Tạo file và commit
  echo "# LMS Demo" > README.md
  git add README.md
  git commit -m "Add README"

Bước 3. Xem lịch sử
  git log --oneline

Bước 4. Tạo branch cho tính năng mới
  git switch -c feature/course-list
  (sửa code, rồi)
  git add .
  git commit -m "Add course list page"

Bước 5. Quay lại main và so sánh
  git switch main
  git log --oneline --all --graph

Bài tập
- Tạo branch feature/login, thêm một file login.txt và commit.
- Dùng git log --graph để thấy hai nhánh tách ra từ cùng một commit.'
UNION ALL SELECT 1, 3, 'Tổng kết: Commit và branch

Ghi nhớ
- git add đưa thay đổi vào staging, git commit lưu thay đổi vào lịch sử.
- Commit nhỏ, thông điệp rõ ràng giúp review và tìm lỗi dễ hơn.
- Mỗi tính năng làm trên một branch riêng, main luôn ở trạng thái chạy được.

Lệnh hay dùng
- git status: xem trạng thái các file.
- git diff: xem thay đổi chưa staging.
- git log --oneline --graph: xem lịch sử dạng cây.
- git switch -c <tên-branch>: tạo và chuyển sang branch mới.

Quy ước đặt tên branch trong nhóm
- feature/<tên-tính-năng> cho tính năng mới.
- fix/<mô-tả-lỗi> cho sửa lỗi.

Tiếp theo: học cách gộp các branch lại với nhau và xử lý conflict.'
UNION ALL SELECT 2, 1, 'Mục tiêu bài học
- Hiểu merge là gì và khi nào xảy ra conflict.
- Biết quy trình làm việc nhóm với pull request trên GitHub.

1. Merge
Merge gộp lịch sử của một branch vào branch hiện tại. Nếu hai nhánh sửa các phần khác nhau, Git tự gộp. Nếu main không có commit mới, Git chỉ cần "fast-forward" con trỏ main lên phía trước.

2. Conflict là gì?
Conflict xảy ra khi hai branch cùng sửa một đoạn trong cùng một file. Git không biết giữ bản nào nên đánh dấu đoạn đó để bạn tự quyết định.

3. Pull request (PR)
Trên GitHub, thay vì merge trực tiếp vào main, thành viên push branch lên và mở pull request. Các thành viên khác review, góp ý, rồi mới merge. Cách này giúp phát hiện lỗi sớm và cả nhóm nắm được thay đổi.

4. Quy trình gợi ý cho nhóm
- Cập nhật main mới nhất: git pull.
- Tạo branch tính năng, commit, push lên GitHub.
- Mở pull request, nhờ review, sửa theo góp ý.
- Merge vào main khi đã được duyệt.'
UNION ALL SELECT 2, 2, 'Thực hành: tạo và xử lý conflict

Bước 1. Tạo hai branch cùng sửa một dòng
  git switch -c feature/a
  (sửa dòng tiêu đề trong README.md thành "LMS Group 6")
  git commit -am "Rename title A"
  git switch main
  git switch -c feature/b
  (sửa cùng dòng đó thành "LMS E-Learning")
  git commit -am "Rename title B"

Bước 2. Merge và gặp conflict
  git switch main
  git merge feature/a
  git merge feature/b
Git báo CONFLICT trong README.md.

Bước 3. Đọc đánh dấu conflict
  <<<<<<< HEAD
  # LMS Group 6
  =======
  # LMS E-Learning
  >>>>>>> feature/b
Phần trên là của branch hiện tại, phần dưới là của branch đang merge vào.

Bước 4. Sửa và hoàn tất merge
- Giữ nội dung đúng, xóa các dòng <<<<<<<, =======, >>>>>>>.
- git add README.md
- git commit
Nếu muốn hủy giữa chừng: git merge --abort.'
UNION ALL SELECT 2, 3, 'Tổng kết: Merge và xử lý conflict

Ghi nhớ
- Conflict không phải lỗi, chỉ là Git cần bạn quyết định giữ thay đổi nào.
- Luôn chạy lại ứng dụng sau khi giải quyết conflict để chắc chắn code vẫn đúng.
- git merge --abort giúp quay lại trạng thái trước khi merge.

Cách giảm conflict khi làm nhóm
- Pull main thường xuyên và merge main vào branch của mình sớm.
- Chia việc theo module, tránh nhiều người cùng sửa một file.
- Pull request nhỏ, merge sớm thay vì để branch sống quá lâu.

Checklist trước khi mở pull request
- Branch đã cập nhật main mới nhất và không còn conflict.
- Code build và chạy được.
- Thông điệp commit và mô tả PR rõ ràng.

Hoàn thành module này, bạn có thể làm bài quiz ôn tập để kiểm tra lại kiến thức.'
) s ON s.module_position = m.position AND s.lesson_position = l.position
SET l.content = s.content
WHERE u.email = 'teacher.enrollment@example.test'
AND c.title = 'Git và GitHub cho làm việc nhóm'
AND l.content IN ('Nội dung minh họa để xem cấu trúc khóa học. Chức năng học bài thuộc phần triển khai riêng.',
                  'Nội dung mẫu phục vụ xem mục lục.');

-- END lesson content

-- BEGIN quiz questions: Git và GitHub cho làm việc nhóm
-- 5 single-choice questions per practice quiz so students can take the quiz. Inserts missing ones only.
INSERT INTO questions (course_id, quiz_id, content, question_type, options_json, correct_answer)
SELECT c.course_id, q.quiz_id, s.content, 'SINGLE_CHOICE', s.options_json, s.correct_answer
FROM courses c
JOIN users u ON u.user_id = c.teacher_id
JOIN modules m ON m.course_id = c.course_id
JOIN quizzes q ON q.module_id = m.module_id AND q.title = CONCAT('Ôn tập: ', m.title)
JOIN (
SELECT 1 AS module_position, 'Lệnh nào đưa thay đổi của file vào staging area?' AS content,
  '{"options":[{"key":"A","text":"git commit"},{"key":"B","text":"git add"},{"key":"C","text":"git push"},{"key":"D","text":"git log"}],"topic":"Commit","difficulty":"EASY","explanation":"git add đưa thay đổi vào staging; git commit mới lưu chúng vào lịch sử."}' AS options_json,
  'B' AS correct_answer
UNION ALL SELECT 1, 'Commit trong Git là gì?',
  '{"options":[{"key":"A","text":"Một bản sao repository trên GitHub"},{"key":"B","text":"Một nhánh phát triển độc lập"},{"key":"C","text":"Ảnh chụp trạng thái dự án tại một thời điểm, kèm thông điệp mô tả"},{"key":"D","text":"Lệnh tải code từ server về"}],"topic":"Commit","difficulty":"EASY","explanation":"Mỗi commit lưu trạng thái dự án và thông điệp mô tả thay đổi."}',
  'C'
UNION ALL SELECT 1, 'Lệnh nào tạo branch mới và chuyển sang branch đó ngay?',
  '{"options":[{"key":"A","text":"git switch -c feature/login"},{"key":"B","text":"git branch -d feature/login"},{"key":"C","text":"git merge feature/login"},{"key":"D","text":"git init feature/login"}],"topic":"Branch","difficulty":"MEDIUM","explanation":"git switch -c vừa tạo branch vừa chuyển sang branch đó."}',
  'A'
UNION ALL SELECT 1, 'Vì sao mỗi tính năng nên làm trên một branch riêng?',
  '{"options":[{"key":"A","text":"Để Git chạy nhanh hơn"},{"key":"B","text":"Để không ảnh hưởng nhánh main cho đến khi được review và merge"},{"key":"C","text":"Vì Git không cho commit trên main"},{"key":"D","text":"Để tự động deploy lên server"}],"topic":"Branch","difficulty":"EASY","explanation":"Branch riêng giữ main luôn chạy được trong khi tính năng đang phát triển."}',
  'B'
UNION ALL SELECT 1, 'Lệnh nào xem lịch sử commit dạng ngắn gọn, mỗi commit một dòng?',
  '{"options":[{"key":"A","text":"git status"},{"key":"B","text":"git diff"},{"key":"C","text":"git log --oneline"},{"key":"D","text":"git show --all"}],"topic":"Commit","difficulty":"EASY","explanation":"git log --oneline in mỗi commit trên một dòng gồm mã rút gọn và thông điệp."}',
  'C'
UNION ALL SELECT 2, 'Conflict xảy ra khi nào?',
  '{"options":[{"key":"A","text":"Khi hai branch sửa các file khác nhau"},{"key":"B","text":"Khi hai branch cùng sửa một đoạn trong cùng một file"},{"key":"C","text":"Khi push lên GitHub lần đầu"},{"key":"D","text":"Khi tạo branch mới"}],"topic":"Conflict","difficulty":"EASY","explanation":"Git không tự quyết định được khi cùng một đoạn bị sửa ở cả hai nhánh."}',
  'B'
UNION ALL SELECT 2, 'Trong đánh dấu conflict, phần nằm giữa <<<<<<< HEAD và ======= là gì?',
  '{"options":[{"key":"A","text":"Thay đổi của branch hiện tại"},{"key":"B","text":"Thay đổi của branch đang được merge vào"},{"key":"C","text":"Nội dung gốc trước khi sửa"},{"key":"D","text":"Ghi chú của Git"}],"topic":"Conflict","difficulty":"MEDIUM","explanation":"HEAD là branch hiện tại; phần sau ======= là của branch đang merge vào."}',
  'A'
UNION ALL SELECT 2, 'Lệnh nào hủy quá trình merge đang bị conflict và quay về trạng thái trước đó?',
  '{"options":[{"key":"A","text":"git reset --soft"},{"key":"B","text":"git merge --abort"},{"key":"C","text":"git commit --amend"},{"key":"D","text":"git branch -D"}],"topic":"Conflict","difficulty":"MEDIUM","explanation":"git merge --abort đưa repository về trạng thái trước khi bắt đầu merge."}',
  'B'
UNION ALL SELECT 2, 'Pull request trên GitHub dùng để làm gì?',
  '{"options":[{"key":"A","text":"Tải repository về máy"},{"key":"B","text":"Xóa branch đã merge"},{"key":"C","text":"Đề nghị merge một branch để nhóm review trước khi gộp"},{"key":"D","text":"Tạo bản sao repository của người khác"}],"topic":"Pull request","difficulty":"EASY","explanation":"Pull request cho phép nhóm review và góp ý trước khi merge vào main."}',
  'C'
UNION ALL SELECT 2, 'Cách nào giúp giảm conflict khi làm việc nhóm?',
  '{"options":[{"key":"A","text":"Để branch sống càng lâu càng tốt rồi merge một lần"},{"key":"B","text":"Nhiều người cùng sửa một file cho nhanh"},{"key":"C","text":"Pull main thường xuyên và tạo pull request nhỏ"},{"key":"D","text":"Không bao giờ dùng branch"}],"topic":"Conflict","difficulty":"MEDIUM","explanation":"Cập nhật main thường xuyên và merge sớm giúp các thay đổi ít chồng chéo."}',
  'C'
) s ON s.module_position = m.position
WHERE u.email = 'teacher.enrollment@example.test'
AND c.title = 'Git và GitHub cho làm việc nhóm'
AND NOT EXISTS (SELECT 1 FROM questions x WHERE x.quiz_id = q.quiz_id AND x.content = s.content);
-- END quiz questions
COMMIT;


-- ---------------------------------------------------------------------
-- DEMO ACCOUNTS FOR GRADING (no email OTP needed)
--   Teacher (owns all sample courses): teacher.enrollment@example.test / Teacher@123
--   Teacher (no courses yet):          teacher.test@example.test       / Teacher@123
--   Student:                           student.demo@example.test       / Student@123
-- The demo student is already enrolled (paid) in "Git và GitHub cho làm việc nhóm"
-- so lessons and practice quizzes can be tried without making a payment.
-- ---------------------------------------------------------------------

START TRANSACTION;
UPDATE users
SET password_hash = '$2a$10$6Zo1eya9JbH3.a0PZz21a.78E/rvgDvLTXJWD95D.9zm76UmyN4PG'
WHERE email = 'teacher.enrollment@example.test';

INSERT INTO users (full_name, email, password_hash, role, status)
SELECT 'Sinh viên Demo', 'student.demo@example.test',
       '$2a$10$647wNRSlLYDzXYTPzpXI2eSS3DnS623k/6TWUiLHsl8l71Y4IlS3K', 'STUDENT', 'ACTIVE'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'student.demo@example.test');

INSERT INTO registrations (student_id, course_id, status, registered_at, expires_at, amount,
                           payment_code, transaction_ref, payment_status, paid_at)
SELECT u.user_id, c.course_id, 'ACTIVE', '2026-11-01 09:00:00', '2026-11-02 09:00:00', c.price,
       'LMS00000000000000000000000000000001', 'SEPAY:DEMO-1', 'SUCCESS', '2026-11-01 09:05:00'
FROM users u
JOIN courses c ON c.title = 'Git và GitHub cho làm việc nhóm'
WHERE u.email = 'student.demo@example.test'
  AND NOT EXISTS (SELECT 1 FROM registrations WHERE payment_code = 'LMS00000000000000000000000000000001');
COMMIT;

-- ---------------------------------------------------------------------
-- COURSE COVER IMAGES (files in frontend/public/images/courses)
-- ---------------------------------------------------------------------
START TRANSACTION;
UPDATE courses SET thumbnail_url='/images/courses/demo-course-1.svg' WHERE title='Java căn bản cho người mới bắt đầu' AND (thumbnail_url IS NULL OR TRIM(thumbnail_url)='');
UPDATE courses SET thumbnail_url='/images/courses/demo-course-2.svg' WHERE title='ReactJS: xây dựng giao diện web' AND (thumbnail_url IS NULL OR TRIM(thumbnail_url)='');
UPDATE courses SET thumbnail_url='/images/courses/demo-course-3.svg' WHERE title='Spring Boot REST API cơ bản' AND (thumbnail_url IS NULL OR TRIM(thumbnail_url)='');
UPDATE courses SET thumbnail_url='/images/courses/demo-course-4.svg' WHERE title='MySQL và thiết kế cơ sở dữ liệu' AND (thumbnail_url IS NULL OR TRIM(thumbnail_url)='');
UPDATE courses SET thumbnail_url='/images/courses/demo-course-5.svg' WHERE title='Git và GitHub cho làm việc nhóm' AND (thumbnail_url IS NULL OR TRIM(thumbnail_url)='');
UPDATE courses SET thumbnail_url='/images/courses/demo-course-6.svg' WHERE title='JavaScript thực hành cho frontend' AND (thumbnail_url IS NULL OR TRIM(thumbnail_url)='');
UPDATE courses SET thumbnail_url='/images/courses/demo-course-7.svg' WHERE title='HTML và CSS: thiết kế web responsive' AND (thumbnail_url IS NULL OR TRIM(thumbnail_url)='');
UPDATE courses SET thumbnail_url='/images/courses/demo-course-8.svg' WHERE title='TypeScript cho lập trình viên JavaScript' AND (thumbnail_url IS NULL OR TRIM(thumbnail_url)='');
UPDATE courses SET thumbnail_url='/images/courses/demo-course-9.svg' WHERE title='Node.js và Express REST API' AND (thumbnail_url IS NULL OR TRIM(thumbnail_url)='');
UPDATE courses SET thumbnail_url='/images/courses/demo-course-10.svg' WHERE title='Kiểm thử phần mềm với JUnit' AND (thumbnail_url IS NULL OR TRIM(thumbnail_url)='');
UPDATE courses SET thumbnail_url='/images/courses/demo-course-11.svg' WHERE title='Docker cơ bản cho dự án web' AND (thumbnail_url IS NULL OR TRIM(thumbnail_url)='');
UPDATE courses SET thumbnail_url='/images/courses/demo-course-12.svg' WHERE title='Thiết kế API và xử lý exception' AND (thumbnail_url IS NULL OR TRIM(thumbnail_url)='');
UPDATE courses SET thumbnail_url='/images/courses/demo-course-13.svg' WHERE title='Spring Security và JWT' AND (thumbnail_url IS NULL OR TRIM(thumbnail_url)='');
UPDATE courses SET thumbnail_url='/images/courses/demo-course-14.svg' WHERE title='Cấu trúc dữ liệu và giải thuật' AND (thumbnail_url IS NULL OR TRIM(thumbnail_url)='');
UPDATE courses SET thumbnail_url='/images/courses/demo-course-15.svg' WHERE title='SQL nâng cao và tối ưu truy vấn' AND (thumbnail_url IS NULL OR TRIM(thumbnail_url)='');
UPDATE courses SET thumbnail_url='/images/courses/demo-course-16.svg' WHERE title='UI UX cơ bản cho lập trình viên' AND (thumbnail_url IS NULL OR TRIM(thumbnail_url)='');
UPDATE courses SET thumbnail_url='/images/courses/demo-course-17.svg' WHERE title='React Hooks và quản lý state' AND (thumbnail_url IS NULL OR TRIM(thumbnail_url)='');
UPDATE courses SET thumbnail_url='/images/courses/demo-course-18.svg' WHERE title='Triển khai ứng dụng web thực tế' AND (thumbnail_url IS NULL OR TRIM(thumbnail_url)='');
COMMIT;

SET SQL_SAFE_UPDATES = @old_safe_updates;

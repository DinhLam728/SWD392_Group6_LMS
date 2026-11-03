-- LMS Group 6 - Enrollment demo seed. Run AFTER lms_g6_v4.sql.
-- Adds 1 course-owner teacher, 1 test-login teacher, 18 paid published courses, 24 modules, 72 lessons,
-- and 24 quiz TITLES for the course outline. No quiz questions/config are seeded.
-- Does not reset the DB or modify existing accounts, courses, dates or payments.
-- Safe to rerun serially: inserts missing demo records only.
-- Includes a separate local TEACHER login; no student credentials or fake payments.
-- Register/verify a STUDENT through the app (or Google login) to test enrollment.
-- The sample teacher has no password and is only for course ownership.
SET NAMES utf8mb4;
USE lms_g6;

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
COMMIT;

SELECT c.course_id, c.title, c.price, c.is_published FROM courses c JOIN users u ON u.user_id = c.teacher_id WHERE u.email = 'teacher.enrollment@example.test' ORDER BY c.price;

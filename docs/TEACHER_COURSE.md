# Teacher course management (Manage Courses + Generate Lesson with AI)

Owner: Hoàng Việt Anh. Follows `docs/API_COMMON.md`: responses use `ResponseBuilder`,
errors use the shared exceptions, lists use `PageRequestFactory` / `PageResponse`.

## Who is the Teacher
The Teacher is the logged-in user: `CurrentTeacher` reads the JWT identity, answers 401 when nobody
is logged in and 403 when the role is not `TEACHER`. There is no `teacherId` request parameter.
Every service method takes the Teacher id and refuses data owned by someone else (403).

## Endpoints (base `/api/v1/teacher`)
| Method | Path | Purpose |
|---|---|---|
| GET | `/courses?keyword&status&page&size&sort` | My Courses (status `DRAFT` / `PUBLISHED`, otherwise 400; sort `courseId`, `title`, `price`, `createdAt`; each row also has `createdAt` and `studentCount`) |
| POST | `/courses` | Create course (always DRAFT) |
| GET / PUT / DELETE | `/courses/{courseId}` | Read, update, delete (409 if registrations, questions or quizzes exist) |
| PATCH | `/courses/{courseId}/publish` and `/unpublish` | Change status (409 if already in that status) |
| GET | `/courses/{courseId}/content` | Course info (description, price, thumbnail, `createdAt`, `studentCount`, `questionCount`) and modules with their lessons, in order; each module has `quizCount` |
| POST | `/courses/{courseId}/modules` | Add module (position = last + 1) |
| PUT / DELETE | `/modules/{moduleId}` | Rename, delete with its lessons (409 if a quiz uses it) |
| PATCH | `/modules/{moduleId}/move?direction=UP\|DOWN` | Swap with the neighbour (409 at the first / last position) |
| POST | `/modules/{moduleId}/lessons` | Add lesson (title and content required, position = last + 1) |
| GET / PUT / DELETE | `/lessons/{lessonId}` | Read, update, delete |
| PATCH | `/lessons/{lessonId}/move?direction=UP\|DOWN` | Swap with the neighbour (409 at the first / last position) |
| POST | `/ai-lesson` | Gemini draft `{ moduleId, title }`; nothing is stored |

Delete and move answer 204. After a module or lesson is deleted the positions after it are shifted down,
so the stored position always equals the displayed number. A lesson is returned with `courseId`,
`moduleId` and `moduleTitle` for the Lesson form.

`/api/v1/courses` is left free for the public catalog of the enrollment feature.

`studentCount` is the number of `ACTIVE` registrations. A refused delete or move answers 409 with a message that says why
(for example "still has 3 registration(s)"), built by `TeacherConflictException` and `TeacherExceptionHandler`
(scoped to `TeacherCourseController`, because `ErrorCode.CONFLICT` has a fixed text).

## Generate Lesson with AI (sequence diagram)
`POST /ai-lesson` checks JWT and role first (401 / 403), then the request (400), then loads the module with its
course and teacher (404 / 403), builds the prompt in `TeacherCourseServiceImpl`, and calls `GeminiClient.generateLesson`.
`GeminiClient` is the only class that talks to Gemini: the question bank (`generateQuestions`) and the lesson draft
share its key, model, timeout and error handling. The service method runs with `Propagation.NOT_SUPPORTED`, so no database
transaction is open while Gemini answers. The draft is cleaned (scripts, control characters, length) before it is returned.

## AI errors
Gemini failure, timeout, empty or invalid answer, or a missing key all return **502**
`AI_SERVICE_UNAVAILABLE` (sequence diagram). `ErrorCode` has no bad-gateway entry, so
`AiExceptionHandler` is scoped to `TeacherCourseController`. Configuration: `GEMINI_API_KEY`,
optional `GEMINI_MODEL` (default `gemini-flash-latest`, the alias of the current Flash model; fixed names such as
`gemini-1.5-flash` and `gemini-2.0-flash` have been retired by Google) and `GEMINI_TIMEOUT_SECONDS` (default 45).
The key is sent in the `x-goog-api-key` header. Put it in `backend/.env` only; `.env.example` must stay empty.

The question bank keeps its own behaviour: with no key or a failed call `generateQuestions` falls back to the
simulated generator. The lesson draft never does (502 instead).

## Frontend routes (hash routes, all under `#/teacher`)
`/teacher/courses`, `/teacher/courses/new`, `/teacher/courses/:id/edit`, `/teacher/courses/:id/content`,
`/teacher/courses/:courseId/modules/:moduleId/lessons/new`, `/teacher/courses/:courseId/lessons/:lessonId/edit`.
`#/courses` stays reserved for the student catalog. The token is read from `localStorage` key `lms_token`.
The pages render inside the shared layout of `App.jsx` (header, `page-content`, footer) and reuse its classes
(`page-heading`, `filters`, `card`, `table-wrap`, `button`, `status-badge`, `notice`, `pagination`); `teacherCourse.css`
only adds what the shared sheet lacks, with the `tc-` prefix. A visitor who is not a Teacher sees a login prompt,
and an expired token (401) sends the Teacher back to the login page.

## Limits
Course price must be greater than 0: `lms_g6_v4.sql` has `CHECK (price > 0)`, although the SRS says "≥ 0".
Lesson title max 150 characters. Lesson content max 16000 characters: `lessons.content` is a TEXT column
(65,535 bytes), so 16000 characters stay under it even at 4 bytes each. The Gemini draft is cut to the same limit.

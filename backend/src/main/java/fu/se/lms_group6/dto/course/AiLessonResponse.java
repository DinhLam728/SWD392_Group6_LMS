package fu.se.lms_group6.dto.course;

/** Draft lesson text from Gemini. Nothing is stored until the Teacher saves the lesson. */
public record AiLessonResponse(String content) {}

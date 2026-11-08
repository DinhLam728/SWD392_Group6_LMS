package fu.se.lms_group6.controller;

import fu.se.lms_group6.common.http.ApiErrorResponse;
import fu.se.lms_group6.common.http.ApiResponse;
import fu.se.lms_group6.common.http.ResponseBuilder;
import fu.se.lms_group6.dto.course.CourseImageResponse;
import fu.se.lms_group6.service.CourseImageService;
import java.io.IOException;
import java.util.List;
import java.util.concurrent.TimeUnit;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
public class CourseImageController {
    private final CourseImageService images;
    private final CurrentTeacher teacher;

    public CourseImageController(CourseImageService images, CurrentTeacher teacher) {
        this.images = images;
        this.teacher = teacher;
    }

    @PostMapping(value = "/api/v1/teacher/courses/thumbnail", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<CourseImageResponse>> upload(@RequestParam("file") MultipartFile file)
            throws IOException {
        teacher.requireId();
        return ResponseBuilder.ok(new CourseImageResponse(images.upload(file)));
    }

    @GetMapping("/api/v1/course-images/{filename}")
    public ResponseEntity<Resource> image(@PathVariable String filename) throws IOException {
        Resource resource = images.load(filename);
        MediaType type = filename.endsWith(".png") ? MediaType.IMAGE_PNG : MediaType.IMAGE_JPEG;
        return ResponseEntity.ok().contentType(type)
                .cacheControl(CacheControl.maxAge(1, TimeUnit.DAYS))
                .body(resource);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiErrorResponse> invalidImage(IllegalArgumentException exception) {
        return ResponseEntity.badRequest()
                .body(new ApiErrorResponse("INVALID_REQUEST", exception.getMessage(), List.of()));
    }
}

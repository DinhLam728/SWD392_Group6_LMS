package fu.se.lms_group6.service;

import java.io.IOException;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

public interface CourseImageService {
    String upload(MultipartFile file) throws IOException;
    Resource load(String filename) throws IOException;
}

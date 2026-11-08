package fu.se.lms_group6.service.impl;

import fu.se.lms_group6.common.exception.NotFoundException;
import fu.se.lms_group6.service.CourseImageService;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Iterator;
import java.util.Locale;
import java.util.UUID;
import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.stream.ImageInputStream;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class CourseImageServiceImpl implements CourseImageService {
    private static final long MAX_BYTES = 5 * 1024 * 1024;
    private static final int MAX_DIMENSION = 4096;
    private final Path directory;

    public CourseImageServiceImpl() {
        Path backend = Files.isDirectory(Path.of("backend/src")) ? Path.of("backend") : Path.of(".");
        directory = backend.resolve("uploads/courses").toAbsolutePath().normalize();
    }

    @Override
    public String upload(MultipartFile file) throws IOException {
        if (file.isEmpty() || file.getSize() > MAX_BYTES) {
            throw new IllegalArgumentException("Ảnh phải có dung lượng từ 1 byte đến 5MB.");
        }
        BufferedImage image;
        String format;
        try (var input = file.getInputStream();
                ImageInputStream imageInput = ImageIO.createImageInputStream(input)) {
            Iterator<ImageReader> readers = ImageIO.getImageReaders(imageInput);
            if (!readers.hasNext()) {
                throw new IllegalArgumentException("Chỉ hỗ trợ ảnh JPG và PNG hợp lệ.");
            }
            ImageReader reader = readers.next();
            try {
                reader.setInput(imageInput);
                format = reader.getFormatName().toLowerCase(Locale.ROOT);
                if (!format.equals("jpeg") && !format.equals("png")) {
                    throw new IllegalArgumentException("Chỉ hỗ trợ ảnh JPG và PNG.");
                }
                if (reader.getWidth(0) > MAX_DIMENSION || reader.getHeight(0) > MAX_DIMENSION) {
                    throw new IllegalArgumentException("Kích thước ảnh tối đa là 4096 × 4096 pixel.");
                }
                image = reader.read(0);
            } finally {
                reader.dispose();
            }
        } catch (IOException exception) {
            throw new IllegalArgumentException("Không đọc được ảnh. Hãy chọn ảnh JPG hoặc PNG khác.", exception);
        }

        Files.createDirectories(directory);
        String filename = UUID.randomUUID() + (format.equals("jpeg") ? ".jpg" : ".png");
        Path target = directory.resolve(filename);
        try {
            ImageIO.write(image, format, target.toFile());
        } catch (IOException exception) {
            Files.deleteIfExists(target);
            throw exception;
        }
        return "/api/v1/course-images/" + filename;
    }

    @Override
    public Resource load(String filename) throws IOException {
        if (!filename.matches("[a-f0-9-]{36}\\.(jpg|png)")) {
            throw new NotFoundException();
        }
        Path file = directory.resolve(filename);
        if (!Files.isRegularFile(file)) {
            throw new NotFoundException();
        }
        return new UrlResource(file.toUri());
    }
}

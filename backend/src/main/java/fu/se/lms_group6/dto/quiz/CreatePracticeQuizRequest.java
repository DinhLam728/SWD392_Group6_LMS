package fu.se.lms_group6.dto.quiz;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record CreatePracticeQuizRequest(
        @Size(max = 150, message = "Tên quiz tối đa 150 ký tự")
        String title,

        @NotNull(message = "Vui lòng nhập số câu hỏi")
        @Min(value = 1, message = "Số câu hỏi phải từ 1 trở lên")
        @Max(value = 100, message = "Số câu hỏi tối đa 100")
        Integer questionCount,

        @NotNull(message = "Vui lòng nhập thời gian làm bài")
        @Min(value = 1, message = "Thời gian phải từ 1 phút trở lên")
        @Max(value = 180, message = "Thời gian tối đa 180 phút")
        Integer durationMinutes,

        @NotNull(message = "Vui lòng nhập số lượt làm")
        @Min(value = 1, message = "Số lượt làm phải từ 1 trở lên")
        @Max(value = 10, message = "Số lượt làm tối đa 10")
        Integer maxAttempts,

        @NotNull(message = "Vui lòng nhập điểm đạt")
        @DecimalMin(value = "0", message = "Điểm đạt từ 0 đến 10")
        @DecimalMax(value = "10", message = "Điểm đạt từ 0 đến 10")
        BigDecimal passingScore,

        boolean randomQuestions,
        boolean shuffleQuestions,
        boolean shuffleOptions
) {}

package fu.se.lms_group6.dto.quiz;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

public record SubmitAttemptRequest(
        @NotNull(message = "Danh sách câu trả lời không được để trống")
        @Size(max = 200, message = "Tối đa 200 câu trả lời")
        List<@Valid SubmittedAnswerItem> answers
) {}

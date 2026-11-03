package fu.se.lms_group6.dto.questionbank;

public record QuestionBankStatsDto(
        long total,
        long easy,
        long medium,
        long hard,
        long assigned,
        long reserve
) {}

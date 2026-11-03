package fu.se.lms_group6.dto.payment;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

@JsonIgnoreProperties(ignoreUnknown = true)
public record SePayWebhookRequest(
        @NotNull @Positive Long id,
        @NotBlank String accountNumber,
        String subAccount,
        String code,
        String content,
        @NotBlank String transferType,
        @NotNull @Positive BigDecimal transferAmount,
        @NotBlank String transactionDate) {
    public String transactionRef() {
        return "SEPAY:" + id;
    }
}

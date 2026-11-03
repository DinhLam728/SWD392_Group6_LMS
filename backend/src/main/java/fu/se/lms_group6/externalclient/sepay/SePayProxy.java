package fu.se.lms_group6.externalclient.sepay;

import fu.se.lms_group6.dto.payment.PaymentInfoResponse;
import java.math.BigDecimal;
import java.math.RoundingMode;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

@Component
public class SePayProxy {
    private final SePayProperties properties;

    public SePayProxy(SePayProperties properties) {
        this.properties = properties;
    }

    public PaymentInfoResponse generatePaymentQR(BigDecimal amount, String paymentCode) {
        if (properties.getBank().isBlank() || properties.getAccountNumber().isBlank()) {
            throw new IllegalStateException("SePay receiving account is not configured");
        }
        String qrUrl = UriComponentsBuilder.fromUriString(properties.getQrBaseUrl())
                .queryParam("bank", properties.getBank())
                .queryParam("acc", properties.getAccountNumber())
                .queryParam("amount", amount.setScale(0, RoundingMode.UNNECESSARY).toPlainString())
                .queryParam("des", (properties.getTransferPrefix() + " " + paymentCode).strip())
                .build().encode().toUriString();
        return new PaymentInfoResponse("SePay", properties.getBank(), properties.getAccountNumber(),
                properties.getAccountName(), amount, paymentCode, qrUrl);
    }
}

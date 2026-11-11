package fu.se.lms_group6.externalclient.sepay;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app.sepay")
@Getter
@Setter
public class SePayProperties {
    private String bank = "";
    private String accountNumber = "";
    private String accountName = "";
    private String transferPrefix = "";
    private String subAccount = "";
    private String webhookApiKey = "";
    private String qrBaseUrl = "https://qr.sepay.vn/img";
}

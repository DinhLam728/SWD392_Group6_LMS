package fu.se.lms_group6.externalclient.google;

import com.fasterxml.jackson.annotation.JsonProperty;
import fu.se.lms_group6.common.exception.BusinessException;
import fu.se.lms_group6.common.exception.ErrorCode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
public class GoogleAuthClient {

    private static final Logger log = LoggerFactory.getLogger(GoogleAuthClient.class);
    private static final String GOOGLE_TOKENINFO_URL = "https://oauth2.googleapis.com/tokeninfo?id_token={idToken}";

    private final RestClient restClient;
    private final String expectedClientId;

    public GoogleAuthClient(@Value("${app.google.client-id:}") String expectedClientId) {
        this.expectedClientId = expectedClientId;
        this.restClient = RestClient.builder().build();
    }

    private record GoogleTokenInfoResponse(
        String sub,
        String email,
        @JsonProperty("email_verified") String emailVerified,
        String name,
        String picture,
        String aud,
        String error_description
    ) {}

    public GoogleUserInfo verifyIdToken(String idToken) {
        try {
            GoogleTokenInfoResponse response = restClient.get()
                    .uri(GOOGLE_TOKENINFO_URL, idToken)
                    .retrieve()
                    .body(GoogleTokenInfoResponse.class);

            if (response == null || response.sub() == null) {
                log.error("Google token info trả về rỗng");
                throw new BusinessException(ErrorCode.INVALID_REQUEST);
            }

            if (expectedClientId != null && !expectedClientId.isBlank()) {
                if (!expectedClientId.equals(response.aud())) {
                    log.error("Audience token Google không khớp: expected={}, actual={}", expectedClientId, response.aud());
                    throw new BusinessException(ErrorCode.UNAUTHORIZED);
                }
            }

            boolean isVerified = "true".equalsIgnoreCase(response.emailVerified());
            return new GoogleUserInfo(
                    response.sub(),
                    response.email(),
                    response.name() != null ? response.name() : "Google User",
                    response.picture(),
                    isVerified
            );
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("Lỗi khi xác minh token Google với máy chủ: {}", e.getMessage());
            throw new BusinessException(ErrorCode.UNAUTHORIZED);
        }
    }
}


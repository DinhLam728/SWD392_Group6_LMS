package fu.se.lms_group6.scheduler;

import fu.se.lms_group6.service.RegistrationService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class RegistrationExpirationJob {
    private final RegistrationService registrationService;

    public RegistrationExpirationJob(RegistrationService registrationService) {
        this.registrationService = registrationService;
    }

    @Scheduled(fixedDelay = 60000)
    public void expirePendingRegistrations() {
        registrationService.expireRegistrations();
    }
}

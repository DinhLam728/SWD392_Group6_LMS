package fu.se.lms_group6.config;

import java.time.Clock;
import java.time.ZoneId;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;
import org.springframework.scheduling.annotation.EnableScheduling;

@Configuration
@EnableScheduling
@PropertySource("classpath:enrollment.properties")
public class EnrollmentConfig {
    @Bean
    public Clock enrollmentClock() {
        return Clock.system(ZoneId.of("Asia/Ho_Chi_Minh"));
    }
}

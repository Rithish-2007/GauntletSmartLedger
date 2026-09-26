package com.smartledger.config;

import com.smartledger.domain.User;
import com.smartledger.repository.ElectricityRecordRepository;
import com.smartledger.repository.UserRepository;
import com.smartledger.service.DashboardSummaryService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Profile("!test")
public class DemoDataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ElectricityRecordRepository electricityRecordRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final DashboardSummaryService dashboardSummaryService;

    public DemoDataInitializer(UserRepository userRepository,
                               ElectricityRecordRepository electricityRecordRepository,
                               BCryptPasswordEncoder passwordEncoder,
                               DashboardSummaryService dashboardSummaryService) {
        this.userRepository = userRepository;
        this.electricityRecordRepository = electricityRecordRepository;
        this.passwordEncoder = passwordEncoder;
        this.dashboardSummaryService = dashboardSummaryService;
    }

    @Override
    public void run(String... args) {
        User user = userRepository.findByEmail("demo@smartledger.local").orElseGet(() -> {
            User newUser = new User("Rithish Kumar", "demo@smartledger.local", passwordEncoder.encode("demo123"));
            return userRepository.save(newUser);
        });

        // Ensure password is demo123
        if (!passwordEncoder.matches("demo123", user.getPasswordHash())) {
            user.setPasswordHash(passwordEncoder.encode("demo123"));
            userRepository.save(user);
        }

        // If utility database is empty, seed baseline demo records automatically
        if (electricityRecordRepository.count() == 0) {
            dashboardSummaryService.seedDemoData();
        }
    }
}

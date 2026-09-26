package com.smartledger;

import com.smartledger.domain.User;
import com.smartledger.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@SpringBootApplication
public class SmartLedgerApplication {
    public static void main(String[] args) {
        SpringApplication.run(SmartLedgerApplication.class, args);
    }
}

package com.smartledger.service;

import com.smartledger.domain.User;
import com.smartledger.exception.UtilityValidationException;
import com.smartledger.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public User registerUser(String fullName, String email, String rawPassword) {
        if (fullName == null || fullName.trim().isEmpty()) {
            throw new UtilityValidationException("Full name is required");
        }
        if (email == null || !email.contains("@")) {
            throw new UtilityValidationException("Valid email is required");
        }
        if (rawPassword == null || rawPassword.length() < 6) {
            throw new UtilityValidationException("Password must be at least 6 characters");
        }
        if (userRepository.findByEmail(email).isPresent()) {
            throw new UtilityValidationException("Email already registered: " + email);
        }

        String hashedPassword = passwordEncoder.encode(rawPassword);
        User user = new User(fullName.trim(), email.trim().toLowerCase(), hashedPassword);
        return userRepository.save(user);
    }

    public Optional<User> authenticateUser(String email, String rawPassword) {
        if (email == null || rawPassword == null) return Optional.empty();
        return userRepository.findByEmail(email.trim().toLowerCase())
                .filter(u -> passwordEncoder.matches(rawPassword, u.getPasswordHash()));
    }

    public Optional<User> findById(Long userId) {
        return userRepository.findById(userId);
    }
}

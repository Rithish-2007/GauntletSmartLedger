package com.smartledger.controller;

import com.smartledger.domain.User;
import com.smartledger.exception.UtilityValidationException;
import com.smartledger.service.UserService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class RestAuthController {

    private final UserService userService;

    public RestAuthController(UserService userService) {
        this.userService = userService;
    }

    public record LoginRequest(String email, String password) {}
    public record RegisterRequest(String fullName, String email, String password) {}

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request, HttpSession session) {
        if (request.email() == null || request.email().isBlank() ||
            request.password() == null || request.password().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and password are required"));
        }

        Optional<User> userOpt = userService.authenticateUser(request.email(), request.password());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid email or password"));
        }

        User user = userOpt.get();
        session.setAttribute("LOGGED_IN_USER", user);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Login successful");
        response.put("user", formatUserMap(user));
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request, HttpSession session) {
        if (request.fullName() == null || request.fullName().isBlank() ||
            request.email() == null || request.email().isBlank() ||
            request.password() == null || request.password().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Full name, email, and password are required"));
        }

        try {
            User user = userService.registerUser(request.fullName(), request.email(), request.password());
            session.setAttribute("LOGGED_IN_USER", user);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Registration successful");
            response.put("user", formatUserMap(user));
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (UtilityValidationException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session) {
        if (session != null) {
            session.invalidate();
        }
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(HttpSession session) {
        if (session == null || session.getAttribute("LOGGED_IN_USER") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Not authenticated"));
        }
        User user = (User) session.getAttribute("LOGGED_IN_USER");
        return ResponseEntity.ok(formatUserMap(user));
    }

    private Map<String, Object> formatUserMap(User user) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", user.getUserId() != null ? user.getUserId() : 1L);
        map.put("fullName", user.getFullName() != null ? user.getFullName() : "");
        map.put("email", user.getEmail() != null ? user.getEmail() : "");
        return map;
    }
}

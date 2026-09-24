package com.smartledger.service;

import com.smartledger.domain.User;
import com.smartledger.exception.UtilityValidationException;
import com.smartledger.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    private UserService userService;
    private BCryptPasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        passwordEncoder = new BCryptPasswordEncoder();
        userService = new UserService(userRepository, passwordEncoder);
    }

    @Test
    void shouldRegisterNewUserWithHashedPassword() {
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User u = invocation.getArgument(0);
            u.setUserId(1L);
            return u;
        });

        User user = userService.registerUser("John Doe", "john@example.com", "Secret123!");

        assertThat(user.getUserId()).isEqualTo(1L);
        assertThat(user.getFullName()).isEqualTo("John Doe");
        assertThat(passwordEncoder.matches("Secret123!", user.getPasswordHash())).isTrue();
    }

    @Test
    void shouldRejectDuplicateEmailRegistration() {
        when(userRepository.findByEmail("existing@example.com")).thenReturn(Optional.of(new User()));

        assertThatThrownBy(() -> userService.registerUser("Jane", "existing@example.com", "ValidPass123!"))
                .isInstanceOf(UtilityValidationException.class)
                .hasMessageContaining("Email already registered");
    }

    @Test
    void shouldRejectWeakPasswordOnRegistration() {
        assertThatThrownBy(() -> userService.registerUser("Jane", "jane@example.com", "weak"))
                .isInstanceOf(UtilityValidationException.class)
                .hasMessageContaining("Password must contain");
    }

    @Test
    void shouldAuthenticateValidCredentials() {
        String hash = passwordEncoder.encode("Secret123!");
        User user = new User("John", "john@example.com", hash);
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(user));

        Optional<User> result = userService.authenticateUser("john@example.com", "Secret123!");

        assertThat(result).isPresent();
        assertThat(result.get().getFullName()).isEqualTo("John");
    }

    @Test
    void shouldFailAuthenticationOnInvalidPassword() {
        String hash = passwordEncoder.encode("Secret123!");
        User user = new User("John", "john@example.com", hash);
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(user));

        Optional<User> result = userService.authenticateUser("john@example.com", "WrongPass");

        assertThat(result).isEmpty();
    }

    @Test
    void shouldResetPasswordWithValidComplexity() {
        User user = new User("John", "john@example.com", "oldHash");
        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        User updated = userService.resetPassword("john@example.com", "NewP@ssword99#");

        assertThat(passwordEncoder.matches("NewP@ssword99#", updated.getPasswordHash())).isTrue();
    }

    @Test
    void shouldRejectWeakPasswordOnReset() {
        assertThatThrownBy(() -> userService.resetPassword("john@example.com", "nopassword"))
                .isInstanceOf(UtilityValidationException.class)
                .hasMessageContaining("Password must contain");
    }
}

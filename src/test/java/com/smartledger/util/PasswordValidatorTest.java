package com.smartledger.util;

import com.smartledger.exception.UtilityValidationException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class PasswordValidatorTest {

    @ParameterizedTest
    @ValueSource(strings = {"Secret123!", "Admin@2026#", "P@ssw0rdSecure", "MyH0use#2026"})
    void shouldAcceptValidTraditionalPasswords(String password) {
        assertThatCode(() -> PasswordValidator.validate(password))
                .doesNotThrowAnyException();
    }

    @Test
    void shouldRejectNullOrBlankPassword() {
        assertThatThrownBy(() -> PasswordValidator.validate(null))
                .isInstanceOf(UtilityValidationException.class)
                .hasMessageContaining("Password is required");

        assertThatThrownBy(() -> PasswordValidator.validate("   "))
                .isInstanceOf(UtilityValidationException.class)
                .hasMessageContaining("Password is required");
    }

    @Test
    void shouldRejectShortPassword() {
        assertThatThrownBy(() -> PasswordValidator.validate("Aa1!"))
                .isInstanceOf(UtilityValidationException.class)
                .hasMessageContaining("at least 8 characters");
    }

    @Test
    void shouldRejectMissingUppercase() {
        assertThatThrownBy(() -> PasswordValidator.validate("secret123!"))
                .isInstanceOf(UtilityValidationException.class)
                .hasMessageContaining("at least one uppercase letter");
    }

    @Test
    void shouldRejectMissingLowercase() {
        assertThatThrownBy(() -> PasswordValidator.validate("SECRET123!"))
                .isInstanceOf(UtilityValidationException.class)
                .hasMessageContaining("at least one lowercase letter");
    }

    @Test
    void shouldRejectMissingDigit() {
        assertThatThrownBy(() -> PasswordValidator.validate("SecretPass!"))
                .isInstanceOf(UtilityValidationException.class)
                .hasMessageContaining("at least one digit");
    }

    @Test
    void shouldRejectMissingSpecialCharacter() {
        assertThatThrownBy(() -> PasswordValidator.validate("SecretPass123"))
                .isInstanceOf(UtilityValidationException.class)
                .hasMessageContaining("at least one special character");
    }
}

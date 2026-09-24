package com.smartledger.util;

import com.smartledger.exception.UtilityValidationException;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

public final class PasswordValidator {

    public static final int MIN_LENGTH = 8;
    private static final Pattern UPPERCASE_PATTERN = Pattern.compile("[A-Z]");
    private static final Pattern LOWERCASE_PATTERN = Pattern.compile("[a-z]");
    private static final Pattern DIGIT_PATTERN = Pattern.compile("[0-9]");
    private static final Pattern SPECIAL_CHAR_PATTERN = Pattern.compile("[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>\\/?~`]");

    private PasswordValidator() {}

    /**
     * Validates that a password satisfies standard complexity rules:
     * - Minimum 8 characters
     * - At least one uppercase letter
     * - At least one lowercase letter
     * - At least one digit
     * - At least one special symbol
     *
     * @param password the raw password to test
     * @throws UtilityValidationException if any rule fails
     */
    public static void validate(String password) {
        if (password == null || password.isBlank()) {
            throw new UtilityValidationException("Password is required");
        }

        List<String> missingRequirements = new ArrayList<>();

        if (password.length() < MIN_LENGTH) {
            missingRequirements.add("at least 8 characters");
        }
        if (!UPPERCASE_PATTERN.matcher(password).find()) {
            missingRequirements.add("at least one uppercase letter");
        }
        if (!LOWERCASE_PATTERN.matcher(password).find()) {
            missingRequirements.add("at least one lowercase letter");
        }
        if (!DIGIT_PATTERN.matcher(password).find()) {
            missingRequirements.add("at least one digit (0-9)");
        }
        if (!SPECIAL_CHAR_PATTERN.matcher(password).find()) {
            missingRequirements.add("at least one special character (e.g. !@#$%^&*)");
        }

        if (!missingRequirements.isEmpty()) {
            throw new UtilityValidationException("Password must contain " + String.join(", ", missingRequirements));
        }
    }
}

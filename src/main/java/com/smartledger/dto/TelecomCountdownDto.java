package com.smartledger.dto;

import java.time.LocalDate;

public record TelecomCountdownDto(
        Long rechargeId,
        String familyMemberName,
        String serviceProvider,
        double planAmount,
        LocalDate rechargeDate,
        int validityDays,
        LocalDate expiryDate,
        long daysRemaining,
        TelecomStatus status
) {}

package com.smartledger.dto;

import java.time.LocalDate;

public record DepletionForecast(
        LocalDate connectedDate,
        double cylinderWeightKg,
        double burnRateKgPerDay,
        LocalDate predictedDepletionDate,
        long daysRemaining,
        double percentageRemaining,
        boolean refillAlert
) {}

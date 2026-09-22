package com.smartledger.service;

import com.smartledger.domain.GasRecord;
import com.smartledger.dto.DepletionForecast;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class GasDepletionEngine {

    public static final double DEFAULT_BASELINE_BURN_RATE = 0.45; // kg/day domestic standard

    public DepletionForecast calculateForecast(GasRecord activeCylinder, List<GasRecord> pastCylinders, LocalDate currentDate) {
        double weight = activeCylinder.getCylinderWeightKg() != null ? activeCylinder.getCylinderWeightKg() : 14.2;
        LocalDate connected = activeCylinder.getConnectedDate() != null ? activeCylinder.getConnectedDate() : currentDate;

        double burnRate = pastCylinders.stream()
                .filter(c -> c.getBurnRatePerDay() != null && c.getBurnRatePerDay() > 0)
                .mapToDouble(GasRecord::getBurnRatePerDay)
                .average()
                .orElse(DEFAULT_BASELINE_BURN_RATE);

        long totalEstimatedDays = Math.max(1, Math.round(weight / burnRate));
        LocalDate predictedDepletion = connected.plusDays(totalEstimatedDays);

        long daysElapsed = Math.max(0, ChronoUnit.DAYS.between(connected, currentDate));
        long daysRemaining = Math.max(0, totalEstimatedDays - daysElapsed);

        double pctRemaining = Math.max(0.0, Math.min(100.0, ((double) daysRemaining / totalEstimatedDays) * 100.0));
        boolean refillAlert = daysRemaining <= 5;

        return new DepletionForecast(connected, weight, burnRate, predictedDepletion, daysRemaining, pctRemaining, refillAlert);
    }
}

package com.smartledger.service;

import com.smartledger.domain.GasRecord;
import com.smartledger.dto.DepletionForecast;
import com.smartledger.exception.InvalidDateRangeException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.within;

class GasDepletionEngineTest {

    private GasDepletionEngine depletionEngine;

    @BeforeEach
    void setUp() {
        depletionEngine = new GasDepletionEngine();
    }

    @Test
    void shouldComputeBurnRateAndForecastRunOutDateWithHistory() {
        // Past cylinder 1: 14.2kg, lasted 35 days (14.2 / 35 = ~0.4057 kg/day)
        GasRecord past1 = new GasRecord(null, 14.2, 850.0,
                LocalDate.of(2026, 6, 1), LocalDate.of(2026, 7, 6), false);

        // Active cylinder connected on 2026-08-01, current date 2026-08-25
        GasRecord active = new GasRecord(null, 14.2, 850.0,
                LocalDate.of(2026, 8, 1), null, true);

        LocalDate today = LocalDate.of(2026, 8, 25); // 24 days in

        DepletionForecast forecast = depletionEngine.calculateForecast(active, List.of(past1), today);

        assertThat(forecast.burnRateKgPerDay()).isCloseTo(14.2 / 35.0, within(0.01));
        assertThat(forecast.predictedDepletionDate()).isEqualTo(LocalDate.of(2026, 8, 1).plusDays(35));
        assertThat(forecast.daysRemaining()).isEqualTo(11); // 35 - 24
        assertThat(forecast.refillAlert()).isFalse();
    }

    @Test
    void shouldTriggerRefillAlertWhenFiveOrFewerDaysRemaining() {
        GasRecord active = new GasRecord(null, 14.2, 850.0,
                LocalDate.of(2026, 8, 1), null, true);

        // Today is 29 days in (predicted duration = 32 days baseline for 14.2 / 0.45 = ~32 days)
        LocalDate today = LocalDate.of(2026, 8, 30); // 29 days in

        DepletionForecast forecast = depletionEngine.calculateForecast(active, List.of(), today);

        assertThat(forecast.daysRemaining()).isLessThanOrEqualTo(5);
        assertThat(forecast.refillAlert()).isTrue();
    }

    @Test
    void shouldFallbackToDomesticBaselineWhenNoHistoryProvided() {
        GasRecord active = new GasRecord(null, 14.2, 850.0,
                LocalDate.of(2026, 9, 1), null, true);

        DepletionForecast forecast = depletionEngine.calculateForecast(active, List.of(), LocalDate.of(2026, 9, 2));

        assertThat(forecast.burnRateKgPerDay()).isCloseTo(0.45, within(0.01));
    }

    @Test
    void shouldRejectFinishedDateBeforeConnectedDate() {
        GasRecord invalid = new GasRecord(null, 14.2, 850.0,
                LocalDate.of(2026, 9, 10), LocalDate.of(2026, 9, 1), false);

        assertThatThrownBy(invalid::validateRecord)
                .isInstanceOf(InvalidDateRangeException.class)
                .hasMessageContaining("cannot be before");
    }
}

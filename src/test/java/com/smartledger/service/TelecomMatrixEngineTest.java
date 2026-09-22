package com.smartledger.service;

import com.smartledger.domain.TelecomRecord;
import com.smartledger.dto.TelecomCountdownDto;
import com.smartledger.dto.TelecomStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

class TelecomMatrixEngineTest {

    private TelecomMatrixEngine engine;

    @BeforeEach
    void setUp() {
        engine = new TelecomMatrixEngine();
    }

    @Test
    void shouldEvaluateActivePlanWithGreenStatus() {
        // Plan recharged 2026-09-01 with 84 days validity -> expires 2026-11-24
        TelecomRecord record = new TelecomRecord(null, "Mom", "Jio", 719.0,
                LocalDate.of(2026, 9, 1), 84, LocalDate.of(2026, 11, 24));

        LocalDate today = LocalDate.of(2026, 9, 22); // 63 days remaining
        TelecomCountdownDto dto = engine.evaluateCountdown(record, today);

        assertThat(dto.daysRemaining()).isEqualTo(63);
        assertThat(dto.status()).isEqualTo(TelecomStatus.ACTIVE);
    }

    @Test
    void shouldEvaluateExpiringSoonWhenWithinThreeDays() {
        TelecomRecord record = new TelecomRecord(null, "Dad", "Airtel", 299.0,
                LocalDate.of(2026, 8, 25), 28, LocalDate.of(2026, 9, 22));

        LocalDate today = LocalDate.of(2026, 9, 20); // 2 days remaining
        TelecomCountdownDto dto = engine.evaluateCountdown(record, today);

        assertThat(dto.daysRemaining()).isEqualTo(2);
        assertThat(dto.status()).isEqualTo(TelecomStatus.EXPIRING_SOON);
    }

    @Test
    void shouldEvaluateExpiredBlackoutWhenPastExpiry() {
        TelecomRecord record = new TelecomRecord(null, "Self", "BSNL", 199.0,
                LocalDate.of(2026, 8, 01), 30, LocalDate.of(2026, 8, 31));

        LocalDate today = LocalDate.of(2026, 9, 22); // -22 days
        TelecomCountdownDto dto = engine.evaluateCountdown(record, today);

        assertThat(dto.daysRemaining()).isLessThan(0);
        assertThat(dto.status()).isEqualTo(TelecomStatus.EXPIRED_BLACKOUT);
    }
}

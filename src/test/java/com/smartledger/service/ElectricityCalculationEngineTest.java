package com.smartledger.service;

import com.smartledger.dto.SubMeterShareResult;
import com.smartledger.exception.InvalidMeterReadingException;
import com.smartledger.service.tariff.ProgressiveSlabTariffStrategy;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.within;

class ElectricityCalculationEngineTest {

    private ElectricityCalculationEngine calculationEngine;
    private ProgressiveSlabTariffStrategy tariffStrategy;

    @BeforeEach
    void setUp() {
        tariffStrategy = new ProgressiveSlabTariffStrategy();
        calculationEngine = new ElectricityCalculationEngine(tariffStrategy);
    }

    @Test
    void shouldCalculateTotalMasterBillUnderProgressiveSlabs() {
        // Category A (<= 500U): 0-100 free, 101-200 @ 2.35, 201-400 @ 4.70, 401-500 @ 6.30 + 50.0 fixed
        // For 350 units: 100*0 + 100*2.35 (235) + 150*4.70 (705) + 50 fixed = 990.0
        double totalBill = tariffStrategy.calculateMasterBill(350.0);
        assertThat(totalBill).isCloseTo(990.0, within(0.01));
    }

    @Test
    void shouldCalculateFairSplitProportionalToSubMeters() {
        // Master = 350 units (total bill 990.0)
        // Tenant A (myUnits) = 140, Tenant B (otherUnits) = 210. Total submeter = 350.
        // My ratio = 140 / 350 = 0.40 -> Share = 990.0 * 0.40 = 396.0
        SubMeterShareResult result = calculationEngine.calculateShare(350.0, 140.0, 210.0);

        assertThat(result.masterUnits()).isEqualTo(350.0);
        assertThat(result.totalSubUnits()).isEqualTo(350.0);
        assertThat(result.myUnits()).isEqualTo(140.0);
        assertThat(result.totalEbBill()).isCloseTo(990.0, within(0.01));
        assertThat(result.calculatedMyShare()).isCloseTo(396.0, within(0.01));
        assertThat(result.effectiveRatePerUnit()).isCloseTo(396.0 / 140.0, within(0.01));
    }

    @Test
    void shouldHandleZeroSubMeterUnitsWithoutDivideByZero() {
        SubMeterShareResult result = calculationEngine.calculateShare(100.0, 0.0, 0.0);

        assertThat(result.calculatedMyShare()).isEqualTo(0.0);
        assertThat(result.effectiveRatePerUnit()).isEqualTo(0.0);
    }

    @Test
    void shouldCalculateTraditionalHouseholdBill() {
        // 100 units = 50 fixed + 0 = 50.0
        double bill100 = calculationEngine.calculateTraditionalBill(100.0);
        assertThat(bill100).isCloseTo(50.0, within(0.01));

        // 200 units = 50 fixed + 100*2.35 (235) = 285.0
        double bill200 = calculationEngine.calculateTraditionalBill(200.0);
        assertThat(bill200).isCloseTo(285.0, within(0.01));

        // 350 units = 50 fixed + 235 + 150*4.70 (705) = 990.0
        double bill350 = calculationEngine.calculateTraditionalBill(350.0);
        assertThat(bill350).isCloseTo(990.0, within(0.01));

        // Effective rate
        double rate = calculationEngine.calculateEffectiveRate(990.0, 350.0);
        assertThat(rate).isCloseTo(990.0 / 350.0, within(0.01));
    }

    @Test
    void shouldCalculateCategoryBAbove500Units() {
        // 650 units: 100*0 + 300*4.70 (1410) + 100*6.30 (630) + 100*8.40 (840) + 50*9.45 (472.50) + 50 fixed = 3402.50
        double bill650 = calculationEngine.calculateTraditionalBill(650.0);
        assertThat(bill650).isCloseTo(3402.50, within(0.01));
    }

    @Test
    void shouldRejectNegativeMeterReadings() {
        assertThatThrownBy(() -> calculationEngine.calculateShare(200.0, -10.0, 50.0))
                .isInstanceOf(InvalidMeterReadingException.class)
                .hasMessageContaining("cannot be negative");

        assertThatThrownBy(() -> calculationEngine.calculateTraditionalBill(-5.0))
                .isInstanceOf(InvalidMeterReadingException.class);
    }
}

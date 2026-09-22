package com.smartledger.service;

import com.smartledger.domain.CommuteType;
import com.smartledger.dto.CommuteMetric;
import com.smartledger.exception.UtilityValidationException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.within;

class TransportAnalyticsEngineTest {

    private TransportAnalyticsEngine engine;

    @BeforeEach
    void setUp() {
        engine = new TransportAnalyticsEngine();
    }

    @Test
    void shouldCalculateVehicleMileageAndCostPerKmForFuel() {
        // Traveled 360 km on 20 liters of petrol costing ₹2040.0
        CommuteMetric metric = engine.calculateMetric(CommuteType.FUEL, 360.0, 20.0, 2040.0);

        assertThat(metric.mileageKmPerLiter()).isCloseTo(18.0, within(0.01)); // 360 / 20
        assertThat(metric.costPerKm()).isCloseTo(5.666, within(0.01)); // 2040 / 360
    }

    @Test
    void shouldCalculateCostPerKmForPublicTransit() {
        // Train/bus commute 40 km with ticket ₹60.0
        CommuteMetric metric = engine.calculateMetric(CommuteType.PUBLIC_TICKET, 40.0, null, 60.0);

        assertThat(metric.mileageKmPerLiter()).isNull();
        assertThat(metric.costPerKm()).isCloseTo(1.50, within(0.01)); // 60 / 40
    }

    @Test
    void shouldRejectZeroOrNegativeDistance() {
        assertThatThrownBy(() -> engine.calculateMetric(CommuteType.FUEL, 0.0, 10.0, 500.0))
                .isInstanceOf(UtilityValidationException.class)
                .hasMessageContaining("Distance must be greater than 0");
    }
}

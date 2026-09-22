package com.smartledger.service;

import com.smartledger.domain.GroceryCategory;
import com.smartledger.domain.GroceryRecord;
import com.smartledger.dto.GroceryCategorySummaryDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;

class GroceryAnalyticsEngineTest {

    private GroceryAnalyticsEngine engine;

    @BeforeEach
    void setUp() {
        engine = new GroceryAnalyticsEngine();
    }

    @Test
    void shouldComputeCategoricalSpendAndEssentialRatioUsingJavaStreams() {
        List<GroceryRecord> records = List.of(
                new GroceryRecord(null, "Supermarket", GroceryCategory.ESSENTIAL_STAPLE, 1200.0, LocalDate.now(), "Rice, Oil"),
                new GroceryRecord(null, "Dairy Farm", GroceryCategory.DAIRY_PRODUCE, 400.0, LocalDate.now(), "Milk, Eggs"),
                new GroceryRecord(null, "Bakery", GroceryCategory.SNACKS_DISCRETIONARY, 400.0, LocalDate.now(), "Pastries"),
                new GroceryRecord(null, "Chemists", GroceryCategory.HOUSEHOLD_CARE, 500.0, LocalDate.now(), "Soap, Detergent")
        );

        GroceryCategorySummaryDto summary = engine.summarizeCategoricalSpend(records);

        // Total = 2500. Essential = Staple (1200) + Dairy (400) + Household Care (500) = 2100. Discretionary = 400.
        assertThat(summary.totalSpend()).isEqualTo(2500.0);
        assertThat(summary.essentialSpend()).isEqualTo(2100.0);
        assertThat(summary.discretionarySpend()).isEqualTo(400.0);
        assertThat(summary.essentialPercentage()).isCloseTo(84.0, within(0.1));
        assertThat(summary.categoryBreakdown().get(GroceryCategory.ESSENTIAL_STAPLE)).isEqualTo(1200.0);
    }

    @Test
    void shouldHandleEmptyListGracefully() {
        GroceryCategorySummaryDto summary = engine.summarizeCategoricalSpend(List.of());

        assertThat(summary.totalSpend()).isEqualTo(0.0);
        assertThat(summary.essentialPercentage()).isEqualTo(0.0);
    }
}

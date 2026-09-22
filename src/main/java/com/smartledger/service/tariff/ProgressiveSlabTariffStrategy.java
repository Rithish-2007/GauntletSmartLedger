package com.smartledger.service.tariff;

import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

@Component
@Primary
public class ProgressiveSlabTariffStrategy implements TariffCalculationStrategy {

    private static final double FIXED_CHARGE = 50.0;

    @Override
    public double calculateMasterBill(double totalUnits) {
        if (totalUnits <= 0) return FIXED_CHARGE;

        double bill = FIXED_CHARGE;
        double remaining = totalUnits;

        // Tier 1: 0 - 100 units @ 0.0
        double tier1 = Math.min(remaining, 100.0);
        remaining -= tier1;

        // Tier 2: 101 - 200 units @ 2.25
        if (remaining > 0) {
            double tier2 = Math.min(remaining, 100.0);
            bill += tier2 * 2.25;
            remaining -= tier2;
        }

        // Tier 3: 201 - 500 units @ 4.50
        if (remaining > 0) {
            double tier3 = Math.min(remaining, 300.0);
            bill += tier3 * 4.50;
            remaining -= tier3;
        }

        // Tier 4: > 500 units @ 6.00
        if (remaining > 0) {
            bill += remaining * 6.00;
        }

        return bill;
    }

    @Override
    public String getStrategyName() {
        return "Progressive Domestic Slab (TNEB Model)";
    }
}

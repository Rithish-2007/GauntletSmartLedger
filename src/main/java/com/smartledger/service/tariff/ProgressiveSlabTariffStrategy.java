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

        if (totalUnits <= 500.0) {
            // Category A: Consumption up to 500 units
            double remaining = totalUnits;

            // 0 - 100 units: Free
            double free = Math.min(remaining, 100.0);
            remaining -= free;

            // 101 - 200 units: @ 2.35
            if (remaining > 0) {
                double tier1 = Math.min(remaining, 100.0);
                bill += tier1 * 2.35;
                remaining -= tier1;
            }

            // 201 - 400 units: @ 4.70
            if (remaining > 0) {
                double tier2 = Math.min(remaining, 200.0);
                bill += tier2 * 4.70;
                remaining -= tier2;
            }

            // 401 - 500 units: @ 6.30
            if (remaining > 0) {
                double tier3 = Math.min(remaining, 100.0);
                bill += tier3 * 6.30;
            }
        } else {
            // Category B: Consumption above 500 units
            double remaining = totalUnits;

            // 0 - 100 units: Free
            double free = Math.min(remaining, 100.0);
            remaining -= free;

            // 101 - 400 units: @ 4.70
            if (remaining > 0) {
                double tier = Math.min(remaining, 300.0);
                bill += tier * 4.70;
                remaining -= tier;
            }

            // 401 - 500 units: @ 6.30
            if (remaining > 0) {
                double tier = Math.min(remaining, 100.0);
                bill += tier * 6.30;
                remaining -= tier;
            }

            // 501 - 600 units: @ 8.40
            if (remaining > 0) {
                double tier = Math.min(remaining, 100.0);
                bill += tier * 8.40;
                remaining -= tier;
            }

            // 601 - 800 units: @ 9.45
            if (remaining > 0) {
                double tier = Math.min(remaining, 200.0);
                bill += tier * 9.45;
                remaining -= tier;
            }

            // 801 - 1000 units: @ 10.50
            if (remaining > 0) {
                double tier = Math.min(remaining, 200.0);
                bill += tier * 10.50;
                remaining -= tier;
            }

            // Above 1000 units: @ 11.55
            if (remaining > 0) {
                bill += remaining * 11.55;
            }
        }

        return Math.round(bill * 100.0) / 100.0;
    }

    @Override
    public String getStrategyName() {
        return "Progressive Domestic Slab (TNEB Model)";
    }
}

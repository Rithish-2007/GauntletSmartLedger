package com.smartledger.service.tariff;

import org.springframework.stereotype.Component;

@Component
public class CommercialFlatTariffStrategy implements TariffCalculationStrategy {
    private static final double FLAT_RATE = 7.50;
    private static final double FIXED_CHARGE = 100.0;

    @Override
    public double calculateMasterBill(double totalUnits) {
        if (totalUnits <= 0) return FIXED_CHARGE;
        return (totalUnits * FLAT_RATE) + FIXED_CHARGE;
    }

    @Override
    public String getStrategyName() {
        return "Commercial Flat Tariff (₹7.50/unit)";
    }
}

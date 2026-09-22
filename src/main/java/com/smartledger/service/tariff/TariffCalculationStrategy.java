package com.smartledger.service.tariff;

public interface TariffCalculationStrategy {
    double calculateMasterBill(double totalUnits);
    String getStrategyName();
}

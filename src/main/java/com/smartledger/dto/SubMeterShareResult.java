package com.smartledger.dto;

public record SubMeterShareResult(
        double masterUnits,
        double totalSubUnits,
        double myUnits,
        double otherUnits,
        double totalEbBill,
        double calculatedMyShare,
        double effectiveRatePerUnit,
        boolean isShared
) {}

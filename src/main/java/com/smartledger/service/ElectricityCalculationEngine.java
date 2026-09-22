package com.smartledger.service;

import com.smartledger.dto.SubMeterShareResult;
import com.smartledger.exception.InvalidMeterReadingException;
import com.smartledger.service.tariff.TariffCalculationStrategy;
import org.springframework.stereotype.Service;

@Service
public class ElectricityCalculationEngine {

    private final TariffCalculationStrategy tariffStrategy;

    public ElectricityCalculationEngine(TariffCalculationStrategy tariffStrategy) {
        this.tariffStrategy = tariffStrategy;
    }

    public SubMeterShareResult calculateShare(double masterUnits, double myUnits, double otherUnits) {
        if (masterUnits < 0 || myUnits < 0 || otherUnits < 0) {
            throw new InvalidMeterReadingException("Meter readings cannot be negative. Supplied: master="
                    + masterUnits + ", myUnits=" + myUnits + ", otherUnits=" + otherUnits);
        }

        double totalEbBill = tariffStrategy.calculateMasterBill(masterUnits);
        double totalSubUnits = myUnits + otherUnits;
        boolean isShared = otherUnits > 0;

        if (totalSubUnits == 0) {
            return new SubMeterShareResult(masterUnits, 0.0, myUnits, otherUnits, totalEbBill, 0.0, 0.0, isShared);
        }

        double userRatio = myUnits / totalSubUnits;
        double calculatedMyShare = totalEbBill * userRatio;
        double effectiveRate = (myUnits > 0) ? (calculatedMyShare / myUnits) : 0.0;

        return new SubMeterShareResult(
                masterUnits,
                totalSubUnits,
                myUnits,
                otherUnits,
                totalEbBill,
                calculatedMyShare,
                effectiveRate,
                isShared
        );
    }
}

package com.smartledger.service;

import com.smartledger.domain.CommuteType;
import com.smartledger.dto.CommuteMetric;
import com.smartledger.exception.UtilityValidationException;
import org.springframework.stereotype.Service;

@Service
public class TransportAnalyticsEngine {

    public CommuteMetric calculateMetric(CommuteType type, double distanceKm, Double liters, double fareCost) {
        if (distanceKm <= 0) {
            throw new UtilityValidationException("Distance must be greater than 0 km");
        }
        if (fareCost < 0) {
            throw new UtilityValidationException("Fare cost cannot be negative");
        }

        Double mileage = null;
        if (type == CommuteType.FUEL) {
            if (liters != null && liters > 0) {
                mileage = distanceKm / liters;
            }
        }

        double costPerKm = fareCost / distanceKm;
        return new CommuteMetric(distanceKm, liters, fareCost, mileage, costPerKm);
    }
}

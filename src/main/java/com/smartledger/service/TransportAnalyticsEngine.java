package com.smartledger.service;

import com.smartledger.domain.CommuteType;
import com.smartledger.dto.CommuteMetric;
import com.smartledger.exception.UtilityValidationException;
import org.springframework.stereotype.Service;

@Service
public class TransportAnalyticsEngine {

    public CommuteMetric calculateMetric(CommuteType type, Double distanceKm, Double liters, double fareCost) {
        if (distanceKm != null && distanceKm <= 0) {
            throw new UtilityValidationException("Distance must be greater than 0 km");
        }
        if (fareCost < 0) {
            throw new UtilityValidationException("Fare cost cannot be negative");
        }

        Double mileage = null;
        if (type == CommuteType.FUEL) {
            if (distanceKm != null && distanceKm > 0 && liters != null && liters > 0) {
                mileage = distanceKm / liters;
            }
        }

        Double costPerKm = (distanceKm != null && distanceKm > 0) ? (fareCost / distanceKm) : null;
        return new CommuteMetric(distanceKm != null ? distanceKm : 0.0, liters, fareCost, mileage, costPerKm);
    }
}

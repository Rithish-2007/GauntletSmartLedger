package com.smartledger.dto;

public record CommuteMetric(
        double distanceKm,
        Double litersFilled,
        double totalCost,
        Double mileageKmPerLiter,
        double costPerKm
) {}

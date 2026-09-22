package com.smartledger.dto;

import java.util.Map;

public record MacroSpendSummaryDto(
        double electricitySpend,
        double gasSpend,
        double telecomSpend,
        double transportSpend,
        double grocerySpend,
        double totalMonthlySpend,
        Map<String, Double> percentageDistribution
) {}

package com.smartledger.dto;

import com.smartledger.domain.GroceryCategory;
import java.util.Map;

public record GroceryCategorySummaryDto(
        double totalSpend,
        double essentialSpend,
        double discretionarySpend,
        double essentialPercentage,
        Map<GroceryCategory, Double> categoryBreakdown
) {}

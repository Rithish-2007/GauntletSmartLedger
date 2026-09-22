package com.smartledger.service;

import com.smartledger.domain.GroceryCategory;
import com.smartledger.domain.GroceryRecord;
import com.smartledger.dto.GroceryCategorySummaryDto;
import org.springframework.stereotype.Service;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class GroceryAnalyticsEngine {

    public GroceryCategorySummaryDto summarizeCategoricalSpend(List<GroceryRecord> records) {
        if (records == null || records.isEmpty()) {
            return new GroceryCategorySummaryDto(0.0, 0.0, 0.0, 0.0, new EnumMap<>(GroceryCategory.class));
        }

        Map<GroceryCategory, Double> breakdown = records.stream()
                .collect(Collectors.groupingBy(
                        GroceryRecord::getCategory,
                        () -> new EnumMap<>(GroceryCategory.class),
                        Collectors.summingDouble(GroceryRecord::getTotalAmount)
                ));

        double totalSpend = records.stream().mapToDouble(GroceryRecord::getTotalAmount).sum();
        double discretionary = breakdown.getOrDefault(GroceryCategory.SNACKS_DISCRETIONARY, 0.0);
        double essential = totalSpend - discretionary;
        double essentialPct = (totalSpend > 0) ? (essential / totalSpend) * 100.0 : 0.0;

        return new GroceryCategorySummaryDto(totalSpend, essential, discretionary, essentialPct, breakdown);
    }
}

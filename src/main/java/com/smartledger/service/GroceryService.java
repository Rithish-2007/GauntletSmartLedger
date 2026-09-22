package com.smartledger.service;

import com.smartledger.domain.GroceryCategory;
import com.smartledger.domain.GroceryRecord;
import com.smartledger.domain.User;
import com.smartledger.dto.GroceryCategorySummaryDto;
import com.smartledger.repository.GroceryRecordRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class GroceryService {

    private final GroceryRecordRepository repository;
    private final GroceryAnalyticsEngine analyticsEngine;

    public GroceryService(GroceryRecordRepository repository, GroceryAnalyticsEngine analyticsEngine) {
        this.repository = repository;
        this.analyticsEngine = analyticsEngine;
    }

    @Transactional
    public GroceryRecord addRecord(User user, String storeName, GroceryCategory category,
                                  double amount, LocalDate date, String notes) {
        GroceryRecord record = new GroceryRecord(user, storeName, category, amount, date != null ? date : LocalDate.now(), notes);
        record.validateRecord();
        return repository.save(record);
    }

    public GroceryCategorySummaryDto getSummary(User user) {
        List<GroceryRecord> records = repository.findByUserOrderByPurchaseDateDesc(user);
        return analyticsEngine.summarizeCategoricalSpend(records);
    }

    public List<GroceryRecord> getRecords(User user) {
        return repository.findByUserOrderByPurchaseDateDesc(user);
    }
}

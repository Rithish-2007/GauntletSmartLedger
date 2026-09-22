package com.smartledger.service;

import com.smartledger.domain.CommuteType;
import com.smartledger.domain.TransportRecord;
import com.smartledger.domain.User;
import com.smartledger.dto.CommuteMetric;
import com.smartledger.repository.TransportRecordRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class TransportService {

    private final TransportRecordRepository repository;
    private final TransportAnalyticsEngine analyticsEngine;

    public TransportService(TransportRecordRepository repository, TransportAnalyticsEngine analyticsEngine) {
        this.repository = repository;
        this.analyticsEngine = analyticsEngine;
    }

    @Transactional
    public TransportRecord addTrip(User user, CommuteType type, String personName, String origin,
                                   String destination, double distanceKm, Double liters, double totalFare,
                                   LocalDate date) {
        CommuteMetric metric = analyticsEngine.calculateMetric(type, distanceKm, liters, totalFare);
        TransportRecord record = new TransportRecord(
                user, type, personName, origin, destination, distanceKm, liters, totalFare,
                metric.mileageKmPerLiter(), metric.costPerKm(), date != null ? date : LocalDate.now()
        );
        record.validateRecord();
        return repository.save(record);
    }

    public List<TransportRecord> getTripsForUser(User user) {
        return repository.findByUserOrderByEntryDateDesc(user);
    }
}

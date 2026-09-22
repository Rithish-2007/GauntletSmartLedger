package com.smartledger.service;

import com.smartledger.domain.GasRecord;
import com.smartledger.domain.User;
import com.smartledger.dto.DepletionForecast;
import com.smartledger.repository.GasRecordRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class GasService {

    private final GasRecordRepository repository;
    private final GasDepletionEngine depletionEngine;

    public GasService(GasRecordRepository repository, GasDepletionEngine depletionEngine) {
        this.repository = repository;
        this.depletionEngine = depletionEngine;
    }

    @Transactional
    public GasRecord connectNewCylinder(User user, double weightKg, double bookingCost, LocalDate connectedDate) {
        repository.findByUserAndIsActiveTrue(user).ifPresent(curr -> {
            curr.setIsActive(false);
            curr.setFinishedDate(connectedDate != null ? connectedDate : LocalDate.now());
            curr.validateRecord();
            repository.save(curr);
        });

        GasRecord newCylinder = new GasRecord(user, weightKg, bookingCost, connectedDate, null, true);
        newCylinder.validateRecord();
        return repository.save(newCylinder);
    }

    public Optional<DepletionForecast> getActiveForecast(User user) {
        Optional<GasRecord> active = repository.findByUserAndIsActiveTrue(user);
        if (active.isEmpty()) return Optional.empty();

        List<GasRecord> past = repository.findByUserOrderByConnectedDateDesc(user).stream()
                .filter(c -> !Boolean.TRUE.equals(c.getIsActive()))
                .toList();

        return Optional.of(depletionEngine.calculateForecast(active.get(), past, LocalDate.now()));
    }

    public List<GasRecord> getAllForUser(User user) {
        return repository.findByUserOrderByConnectedDateDesc(user);
    }
}

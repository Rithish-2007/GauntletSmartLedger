package com.smartledger.service;

import com.smartledger.domain.TelecomRecord;
import com.smartledger.domain.User;
import com.smartledger.dto.TelecomCountdownDto;
import com.smartledger.repository.TelecomRecordRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class TelecomService {

    private final TelecomRecordRepository repository;
    private final TelecomMatrixEngine matrixEngine;

    public TelecomService(TelecomRecordRepository repository, TelecomMatrixEngine matrixEngine) {
        this.repository = repository;
        this.matrixEngine = matrixEngine;
    }

    @Transactional
    public TelecomRecord addRecharge(User user, String memberName, String provider, double amount,
                                     LocalDate rechargeDate, int validityDays) {
        LocalDate expiry = (rechargeDate != null ? rechargeDate : LocalDate.now()).plusDays(validityDays);
        TelecomRecord record = new TelecomRecord(user, memberName, provider, amount, rechargeDate, validityDays, expiry);
        record.validateRecord();
        return repository.save(record);
    }

    public List<TelecomCountdownDto> getCountdownMatrix(User user) {
        LocalDate today = LocalDate.now();
        return repository.findByUserOrderByExpiryDateAsc(user).stream()
                .map(r -> matrixEngine.evaluateCountdown(r, today))
                .toList();
    }
}

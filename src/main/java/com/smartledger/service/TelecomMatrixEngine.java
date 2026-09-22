package com.smartledger.service;

import com.smartledger.domain.TelecomRecord;
import com.smartledger.dto.TelecomCountdownDto;
import com.smartledger.dto.TelecomStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Service
public class TelecomMatrixEngine {

    public TelecomCountdownDto evaluateCountdown(TelecomRecord record, LocalDate currentDate) {
        LocalDate expiry = record.getExpiryDate() != null ? record.getExpiryDate() : record.getRechargeDate().plusDays(record.getValidityDays());
        long daysRemaining = ChronoUnit.DAYS.between(currentDate, expiry);

        TelecomStatus status;
        if (daysRemaining < 0) {
            status = TelecomStatus.EXPIRED_BLACKOUT;
        } else if (daysRemaining <= 3) {
            status = TelecomStatus.EXPIRING_SOON;
        } else {
            status = TelecomStatus.ACTIVE;
        }

        return new TelecomCountdownDto(
                record.getRecordId(),
                record.getFamilyMemberName(),
                record.getServiceProvider(),
                record.getPlanAmount() != null ? record.getPlanAmount() : 0.0,
                record.getRechargeDate(),
                record.getValidityDays() != null ? record.getValidityDays() : 0,
                expiry,
                daysRemaining,
                status
        );
    }
}

package com.smartledger.service;

import com.smartledger.domain.ElectricityRecord;
import com.smartledger.domain.User;
import com.smartledger.dto.SubMeterShareResult;
import com.smartledger.repository.ElectricityRecordRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class ElectricityService {

    private final ElectricityRecordRepository repository;
    private final ElectricityCalculationEngine calculationEngine;

    public ElectricityService(ElectricityRecordRepository repository, ElectricityCalculationEngine calculationEngine) {
        this.repository = repository;
        this.calculationEngine = calculationEngine;
    }

    @Transactional
    public ElectricityRecord addRecord(User user, String billingMonth, double masterUnits, double myUnits,
                                      double otherUnits, LocalDate paidDate) {
        SubMeterShareResult share = calculationEngine.calculateShare(masterUnits, myUnits, otherUnits);
        ElectricityRecord record = new ElectricityRecord(
                user,
                billingMonth,
                masterUnits,
                share.totalEbBill(),
                share.isShared(),
                myUnits,
                otherUnits,
                share.calculatedMyShare(),
                paidDate != null ? paidDate : LocalDate.now()
        );
        record.validateRecord();
        return repository.save(record);
    }

    public List<ElectricityRecord> getRecordsForUser(User user) {
        return repository.findByUserOrderByBillingMonthDesc(user);
    }
}

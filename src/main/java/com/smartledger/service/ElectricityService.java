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

    @Transactional
    public ElectricityRecord addRecordWithAmount(User user, String billingMonth, Double totalEbAmount, double myUnits,
                                                Double otherUnits, LocalDate paidDate) {
        double other = (otherUnits != null) ? otherUnits : 0.0;
        double totalSubUnits = myUnits + other;
        boolean isShared = other > 0;
        double masterUnits = totalSubUnits > 0 ? totalSubUnits : myUnits;

        double billAmount = (totalEbAmount != null && totalEbAmount > 0)
                ? totalEbAmount
                : calculationEngine.calculateShare(masterUnits, myUnits, other).totalEbBill();

        double myShare;
        if (isShared && totalSubUnits > 0) {
            myShare = billAmount * (myUnits / totalSubUnits);
        } else {
            myShare = billAmount;
        }

        ElectricityRecord record = new ElectricityRecord(
                user,
                billingMonth,
                masterUnits,
                billAmount,
                isShared,
                myUnits,
                other,
                myShare,
                paidDate != null ? paidDate : LocalDate.now()
        );
        record.validateRecord();
        return repository.save(record);
    }

    @Transactional
    public boolean deleteRecord(User user, Long recordId) {
        return repository.findById(recordId)
                .filter(r -> r.getUser().getUserId().equals(user.getUserId()))
                .map(r -> {
                    repository.delete(r);
                    return true;
                }).orElse(false);
    }

    public List<ElectricityRecord> getRecordsForUser(User user) {
        return repository.findByUserOrderByBillingMonthDesc(user);
    }
}

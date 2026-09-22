package com.smartledger.repository;

import com.smartledger.domain.ElectricityRecord;
import com.smartledger.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ElectricityRecordRepository extends JpaRepository<ElectricityRecord, Long> {
    List<ElectricityRecord> findByUserOrderByBillingMonthDesc(User user);
}

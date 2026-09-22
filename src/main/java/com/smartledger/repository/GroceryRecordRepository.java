package com.smartledger.repository;

import com.smartledger.domain.GroceryRecord;
import com.smartledger.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GroceryRecordRepository extends JpaRepository<GroceryRecord, Long> {
    List<GroceryRecord> findByUserOrderByPurchaseDateDesc(User user);
}

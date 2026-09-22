package com.smartledger.repository;

import com.smartledger.domain.TelecomRecord;
import com.smartledger.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TelecomRecordRepository extends JpaRepository<TelecomRecord, Long> {
    List<TelecomRecord> findByUserOrderByExpiryDateAsc(User user);
}

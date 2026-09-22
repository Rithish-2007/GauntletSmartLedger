package com.smartledger.repository;

import com.smartledger.domain.TransportRecord;
import com.smartledger.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransportRecordRepository extends JpaRepository<TransportRecord, Long> {
    List<TransportRecord> findByUserOrderByEntryDateDesc(User user);
}

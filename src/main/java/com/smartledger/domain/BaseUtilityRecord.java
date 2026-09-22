package com.smartledger.domain;

import jakarta.persistence.*;
import java.time.LocalDate;

@MappedSuperclass
public abstract class BaseUtilityRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long recordId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false)
    private LocalDate recordDate;

    @Column(nullable = false)
    private Double totalAmount;

    protected BaseUtilityRecord() {}

    protected BaseUtilityRecord(Long recordId, User user, LocalDate recordDate, Double totalAmount) {
        this.recordId = recordId;
        this.user = user;
        this.recordDate = recordDate;
        this.totalAmount = totalAmount;
    }

    public abstract UtilityType getUtilityType();
    public abstract void validateRecord();
    public abstract String generateSummaryReport();

    public Long getRecordId() { return recordId; }
    public void setRecordId(Long recordId) { this.recordId = recordId; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public LocalDate getRecordDate() { return recordDate; }
    public void setRecordDate(LocalDate recordDate) { this.recordDate = recordDate; }

    public Double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }
}

package com.smartledger.domain;

import com.smartledger.exception.UtilityValidationException;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.time.LocalDate;

@Entity
@Table(name = "telecom_records")
public class TelecomRecord extends BaseUtilityRecord {

    @Column(nullable = false, length = 100)
    private String familyMemberName;

    @Column(nullable = false, length = 50)
    private String serviceProvider;

    @Column(nullable = false)
    private Double planAmount;

    @Column(nullable = false)
    private LocalDate rechargeDate;

    @Column(nullable = false)
    private Integer validityDays;

    @Column(nullable = false)
    private LocalDate expiryDate;

    public TelecomRecord() {}

    public TelecomRecord(User user, String familyMemberName, String serviceProvider, Double planAmount,
                         LocalDate rechargeDate, Integer validityDays, LocalDate expiryDate) {
        super(null, user, rechargeDate != null ? rechargeDate : LocalDate.now(), planAmount);
        this.familyMemberName = familyMemberName;
        this.serviceProvider = serviceProvider;
        this.planAmount = planAmount;
        this.rechargeDate = rechargeDate;
        this.validityDays = validityDays;
        this.expiryDate = expiryDate != null ? expiryDate : (rechargeDate != null ? rechargeDate.plusDays(validityDays) : null);
    }

    @Override
    public UtilityType getUtilityType() {
        return UtilityType.TELECOM;
    }

    @Override
    public void validateRecord() {
        if (familyMemberName == null || familyMemberName.trim().isEmpty()) {
            throw new UtilityValidationException("Family member name is required");
        }
        if (serviceProvider == null || serviceProvider.trim().isEmpty()) {
            throw new UtilityValidationException("Service provider is required");
        }
        if (planAmount == null || planAmount <= 0) {
            throw new UtilityValidationException("Plan amount must be positive");
        }
        if (validityDays == null || validityDays <= 0) {
            throw new UtilityValidationException("Validity days must be greater than 0");
        }
    }

    @Override
    public String generateSummaryReport() {
        return String.format("Telecom [%s - %s]: ₹%.2f, Expires on %s",
                familyMemberName, serviceProvider, planAmount, expiryDate);
    }

    public String getFamilyMemberName() { return familyMemberName; }
    public void setFamilyMemberName(String familyMemberName) { this.familyMemberName = familyMemberName; }

    public String getServiceProvider() { return serviceProvider; }
    public void setServiceProvider(String serviceProvider) { this.serviceProvider = serviceProvider; }

    public Double getPlanAmount() { return planAmount; }
    public void setPlanAmount(Double planAmount) { this.planAmount = planAmount; }

    public LocalDate getRechargeDate() { return rechargeDate; }
    public void setRechargeDate(LocalDate rechargeDate) { this.rechargeDate = rechargeDate; }

    public Integer getValidityDays() { return validityDays; }
    public void setValidityDays(Integer validityDays) { this.validityDays = validityDays; }

    public LocalDate getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; }
}

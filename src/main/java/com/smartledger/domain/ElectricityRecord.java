package com.smartledger.domain;

import com.smartledger.exception.InvalidMeterReadingException;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.time.LocalDate;

@Entity
@Table(name = "electricity_records")
public class ElectricityRecord extends BaseUtilityRecord {

    @Column(nullable = false, length = 7)
    private String billingMonth; // YYYY-MM

    @Column(nullable = false)
    private Double masterEbUnits;

    @Column(nullable = false)
    private Double totalEbAmount;

    private Boolean isShared = false;

    @Column(nullable = false)
    private Double mySubmeterUnits;

    private Double otherSubmeterUnits = 0.0;

    @Column(nullable = false)
    private Double calculatedMyShare;

    private LocalDate paidDate;

    public ElectricityRecord() {}

    public ElectricityRecord(User user, String billingMonth, Double masterEbUnits, Double totalEbAmount,
                             Boolean isShared, Double mySubmeterUnits, Double otherSubmeterUnits,
                             Double calculatedMyShare, LocalDate paidDate) {
        super(null, user, paidDate != null ? paidDate : LocalDate.now(), calculatedMyShare);
        this.billingMonth = billingMonth;
        this.masterEbUnits = masterEbUnits;
        this.totalEbAmount = totalEbAmount;
        this.isShared = isShared;
        this.mySubmeterUnits = mySubmeterUnits;
        this.otherSubmeterUnits = otherSubmeterUnits != null ? otherSubmeterUnits : 0.0;
        this.calculatedMyShare = calculatedMyShare;
        this.paidDate = paidDate;
    }

    @Override
    public UtilityType getUtilityType() {
        return UtilityType.ELECTRICITY;
    }

    @Override
    public void validateRecord() {
        if (masterEbUnits < 0 || mySubmeterUnits < 0 || (otherSubmeterUnits != null && otherSubmeterUnits < 0)) {
            throw new InvalidMeterReadingException("Electricity meter units cannot be negative");
        }
    }

    @Override
    public String generateSummaryReport() {
        return String.format("Electricity [%s]: Master=%.1fkWh, My Share=₹%.2f (Effective ₹%.2f/unit)",
                billingMonth, masterEbUnits, calculatedMyShare,
                (mySubmeterUnits > 0 ? calculatedMyShare / mySubmeterUnits : 0.0));
    }

    public String getBillingMonth() { return billingMonth; }
    public void setBillingMonth(String billingMonth) { this.billingMonth = billingMonth; }

    public Double getMasterEbUnits() { return masterEbUnits; }
    public void setMasterEbUnits(Double masterEbUnits) { this.masterEbUnits = masterEbUnits; }

    public Double getTotalEbAmount() { return totalEbAmount; }
    public void setTotalEbAmount(Double totalEbAmount) { this.totalEbAmount = totalEbAmount; }

    public Boolean getIsShared() { return isShared; }
    public void setIsShared(Boolean shared) { isShared = shared; }

    public Double getMySubmeterUnits() { return mySubmeterUnits; }
    public void setMySubmeterUnits(Double mySubmeterUnits) { this.mySubmeterUnits = mySubmeterUnits; }

    public Double getOtherSubmeterUnits() { return otherSubmeterUnits; }
    public void setOtherSubmeterUnits(Double otherSubmeterUnits) { this.otherSubmeterUnits = otherSubmeterUnits; }

    public Double getCalculatedMyShare() { return calculatedMyShare; }
    public void setCalculatedMyShare(Double calculatedMyShare) { this.calculatedMyShare = calculatedMyShare; }

    public LocalDate getPaidDate() { return paidDate; }
    public void setPaidDate(LocalDate paidDate) { this.paidDate = paidDate; }
}

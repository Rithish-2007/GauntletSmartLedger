package com.smartledger.domain;

import com.smartledger.exception.InvalidDateRangeException;
import com.smartledger.exception.UtilityValidationException;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Entity
@Table(name = "gas_records")
public class GasRecord extends BaseUtilityRecord {

    @Column(nullable = false)
    private Double cylinderWeightKg = 14.2;

    @Column(nullable = false)
    private Double bookingCost;

    @Column(nullable = false)
    private LocalDate connectedDate;

    private LocalDate finishedDate;

    private Double burnRatePerDay;

    private Boolean isActive = true;

    public GasRecord() {}

    public GasRecord(User user, Double cylinderWeightKg, Double bookingCost,
                     LocalDate connectedDate, LocalDate finishedDate, Boolean isActive) {
        super(null, user, connectedDate != null ? connectedDate : LocalDate.now(), bookingCost);
        this.cylinderWeightKg = cylinderWeightKg != null ? cylinderWeightKg : 14.2;
        this.bookingCost = bookingCost;
        this.connectedDate = connectedDate;
        this.finishedDate = finishedDate;
        this.isActive = isActive != null ? isActive : true;
        if (finishedDate != null && connectedDate != null) {
            long days = ChronoUnit.DAYS.between(connectedDate, finishedDate);
            if (days > 0) {
                this.burnRatePerDay = this.cylinderWeightKg / days;
            }
        }
    }

    @Override
    public UtilityType getUtilityType() {
        return UtilityType.GAS;
    }

    @Override
    public void validateRecord() {
        if (cylinderWeightKg == null || cylinderWeightKg <= 0) {
            throw new UtilityValidationException("Cylinder weight must be greater than 0");
        }
        if (connectedDate == null) {
            throw new UtilityValidationException("Connected date is required");
        }
        if (finishedDate != null && finishedDate.isBefore(connectedDate)) {
            throw new InvalidDateRangeException("Finished date (" + finishedDate + ") cannot be before connected date (" + connectedDate + ")");
        }
    }

    @Override
    public String generateSummaryReport() {
        return String.format("LPG Cylinder: %.1fkg, Status: %s, Burn Rate: %s",
                cylinderWeightKg, isActive ? "ACTIVE" : "COMPLETED",
                burnRatePerDay != null ? String.format("%.3f kg/day", burnRatePerDay) : "N/A");
    }

    public Double getCylinderWeightKg() { return cylinderWeightKg; }
    public void setCylinderWeightKg(Double cylinderWeightKg) { this.cylinderWeightKg = cylinderWeightKg; }
    public Double getBookingCost() { return bookingCost; }
    public void setBookingCost(Double bookingCost) { this.bookingCost = bookingCost; }
    public LocalDate getConnectedDate() { return connectedDate; }
    public void setConnectedDate(LocalDate connectedDate) { this.connectedDate = connectedDate; }
    public LocalDate getFinishedDate() { return finishedDate; }
    public void setFinishedDate(LocalDate finishedDate) { this.finishedDate = finishedDate; }
    public Double getBurnRatePerDay() { return burnRatePerDay; }
    public void setBurnRatePerDay(Double burnRatePerDay) { this.burnRatePerDay = burnRatePerDay; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean active) { isActive = active; }
}

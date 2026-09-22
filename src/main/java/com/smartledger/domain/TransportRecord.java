package com.smartledger.domain;

import com.smartledger.exception.UtilityValidationException;
import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "transport_records")
public class TransportRecord extends BaseUtilityRecord {

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CommuteType commuteType;

    @Column(nullable = false, length = 100)
    private String personName;

    private String originPoint;
    private String destinationPoint;

    private Double distanceKm;
    private Double litersFilled;

    @Column(nullable = false)
    private Double totalFareCost;

    private Double mileageCalculated;
    private Double costPerKm;

    @Column(nullable = false)
    private LocalDate entryDate;

    public TransportRecord() {}

    public TransportRecord(User user, CommuteType commuteType, String personName,
                           String originPoint, String destinationPoint, Double distanceKm,
                           Double litersFilled, Double totalFareCost, Double mileageCalculated,
                           Double costPerKm, LocalDate entryDate) {
        super(null, user, entryDate != null ? entryDate : LocalDate.now(), totalFareCost);
        this.commuteType = commuteType;
        this.personName = personName;
        this.originPoint = originPoint;
        this.destinationPoint = destinationPoint;
        this.distanceKm = distanceKm;
        this.litersFilled = litersFilled;
        this.totalFareCost = totalFareCost;
        this.mileageCalculated = mileageCalculated;
        this.costPerKm = costPerKm;
        this.entryDate = entryDate != null ? entryDate : LocalDate.now();
    }

    @Override
    public UtilityType getUtilityType() {
        return UtilityType.TRANSPORT;
    }

    @Override
    public void validateRecord() {
        if (personName == null || personName.trim().isEmpty()) {
            throw new UtilityValidationException("Person name is required");
        }
        if (commuteType == null) {
            throw new UtilityValidationException("Commute type is required");
        }
        if (distanceKm == null || distanceKm <= 0) {
            throw new UtilityValidationException("Distance must be greater than 0");
        }
        if (totalFareCost == null || totalFareCost < 0) {
            throw new UtilityValidationException("Fare cost cannot be negative");
        }
    }

    @Override
    public String generateSummaryReport() {
        return String.format("Transport [%s - %s]: %.1f km, ₹%.2f (₹%.2f/km)",
                commuteType, personName, distanceKm, totalFareCost, costPerKm != null ? costPerKm : 0.0);
    }

    public CommuteType getCommuteType() { return commuteType; }
    public void setCommuteType(CommuteType commuteType) { this.commuteType = commuteType; }

    public String getPersonName() { return personName; }
    public void setPersonName(String personName) { this.personName = personName; }

    public String getOriginPoint() { return originPoint; }
    public void setOriginPoint(String originPoint) { this.originPoint = originPoint; }

    public String getDestinationPoint() { return destinationPoint; }
    public void setDestinationPoint(String destinationPoint) { this.destinationPoint = destinationPoint; }

    public Double getDistanceKm() { return distanceKm; }
    public void setDistanceKm(Double distanceKm) { this.distanceKm = distanceKm; }

    public Double getLitersFilled() { return litersFilled; }
    public void setLitersFilled(Double litersFilled) { this.litersFilled = litersFilled; }

    public Double getTotalFareCost() { return totalFareCost; }
    public void setTotalFareCost(Double totalFareCost) { this.totalFareCost = totalFareCost; }

    public Double getMileageCalculated() { return mileageCalculated; }
    public void setMileageCalculated(Double mileageCalculated) { this.mileageCalculated = mileageCalculated; }

    public Double getCostPerKm() { return costPerKm; }
    public void setCostPerKm(Double costPerKm) { this.costPerKm = costPerKm; }

    public LocalDate getEntryDate() { return entryDate; }
    public void setEntryDate(LocalDate entryDate) { this.entryDate = entryDate; }
}

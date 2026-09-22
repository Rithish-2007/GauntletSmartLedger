package com.smartledger.domain;

import com.smartledger.exception.UtilityValidationException;
import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "grocery_records")
public class GroceryRecord extends BaseUtilityRecord {

    private String storeName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private GroceryCategory category;

    @Column(nullable = false)
    private Double totalAmount;

    @Column(nullable = false)
    private LocalDate purchaseDate;

    @Column(columnDefinition = "TEXT")
    private String receiptNotes;

    public GroceryRecord() {}

    public GroceryRecord(User user, String storeName, GroceryCategory category,
                         Double totalAmount, LocalDate purchaseDate, String receiptNotes) {
        super(null, user, purchaseDate != null ? purchaseDate : LocalDate.now(), totalAmount);
        this.storeName = storeName;
        this.category = category;
        this.totalAmount = totalAmount;
        this.purchaseDate = purchaseDate != null ? purchaseDate : LocalDate.now();
        this.receiptNotes = receiptNotes;
    }

    @Override
    public UtilityType getUtilityType() {
        return UtilityType.GROCERY;
    }

    @Override
    public void validateRecord() {
        if (category == null) {
            throw new UtilityValidationException("Grocery category is required");
        }
        if (totalAmount == null || totalAmount <= 0) {
            throw new UtilityValidationException("Grocery total amount must be greater than 0");
        }
    }

    @Override
    public String generateSummaryReport() {
        return String.format("Grocery [%s]: ₹%.2f from %s", category, totalAmount, storeName != null ? storeName : "Unknown");
    }

    public String getStoreName() { return storeName; }
    public void setStoreName(String storeName) { this.storeName = storeName; }

    public GroceryCategory getCategory() { return category; }
    public void setCategory(GroceryCategory category) { this.category = category; }

    public Double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }

    public LocalDate getPurchaseDate() { return purchaseDate; }
    public void setPurchaseDate(LocalDate purchaseDate) { this.purchaseDate = purchaseDate; }

    public String getReceiptNotes() { return receiptNotes; }
    public void setReceiptNotes(String receiptNotes) { this.receiptNotes = receiptNotes; }
}

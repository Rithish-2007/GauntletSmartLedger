package com.smartledger.domain;

import com.smartledger.exception.InvalidMeterReadingException;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class BaseUtilityRecordTest {

    static class DummyRecord extends BaseUtilityRecord {
        private final double reading;

        public DummyRecord(Long recordId, User user, LocalDate recordDate, Double totalAmount, double reading) {
            super(recordId, user, recordDate, totalAmount);
            this.reading = reading;
        }

        @Override
        public UtilityType getUtilityType() {
            return UtilityType.ELECTRICITY;
        }

        @Override
        public void validateRecord() {
            if (reading < 0) {
                throw new InvalidMeterReadingException("Meter reading cannot be negative: " + reading);
            }
        }

        @Override
        public String generateSummaryReport() {
            return "Utility: " + getUtilityType() + ", Cost: " + getTotalAmount();
        }
    }

    @Test
    void shouldCreateRecordAndGeneratePolymorphicSummary() {
        DummyRecord record = new DummyRecord(1L, null, LocalDate.of(2026, 9, 1), 150.0, 45.0);
        record.validateRecord();

        assertThat(record.getUtilityType()).isEqualTo(UtilityType.ELECTRICITY);
        assertThat(record.generateSummaryReport()).isEqualTo("Utility: ELECTRICITY, Cost: 150.0");
    }

    @Test
    void shouldThrowExceptionWhenReadingIsNegative() {
        DummyRecord record = new DummyRecord(1L, null, LocalDate.of(2026, 9, 1), 150.0, -10.0);

        assertThatThrownBy(record::validateRecord)
                .isInstanceOf(InvalidMeterReadingException.class)
                .hasMessageContaining("Meter reading cannot be negative");
    }
}

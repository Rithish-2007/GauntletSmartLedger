package com.smartledger.exception;

public class SmartLedgerException extends RuntimeException {
    public SmartLedgerException(String message) {
        super(message);
    }
    public SmartLedgerException(String message, Throwable cause) {
        super(message, cause);
    }
}

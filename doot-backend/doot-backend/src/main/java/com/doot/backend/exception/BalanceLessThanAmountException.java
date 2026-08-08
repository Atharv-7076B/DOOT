package com.doot.backend.exception;

public class BalanceLessThanAmountException extends RuntimeException {
    public BalanceLessThanAmountException(String message) {
        super(message);
    }
}

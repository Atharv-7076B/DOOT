package com.doot.backend.exception;

public class BalanceLessThanAmount extends RuntimeException {
    public BalanceLessThanAmount(String message) {
        super(message);
    }
}

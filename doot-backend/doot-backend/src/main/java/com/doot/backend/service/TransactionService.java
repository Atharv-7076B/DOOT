package com.doot.backend.service;

import com.doot.backend.entity.Transactions;

public interface TransactionService {
    Transactions createTransaction(Transactions transaction);
}

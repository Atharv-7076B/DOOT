package com.doot.backend.service.serviceImpl;

import com.doot.backend.entity.Transactions;
import com.doot.backend.repository.TransactionRepository;
import com.doot.backend.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TransactionServiceImpl implements TransactionService {
    private final TransactionRepository transactionRepository;
    @Override
    public Transactions createTransaction(Transactions transaction) {
    return transactionRepository.save(transaction);
    }
}

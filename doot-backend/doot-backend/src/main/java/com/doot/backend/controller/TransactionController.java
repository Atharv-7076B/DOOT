package com.doot.backend.controller;

import com.doot.backend.entity.Transactions;
import com.doot.backend.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionRepository transactionRepository;

    @GetMapping
    public List<Transactions> getAllTransactions() {
        return transactionRepository.findTop20ByOrderByTransactionIdDesc();
    }
}

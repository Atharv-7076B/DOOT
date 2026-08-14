package com.doot.backend.service.serviceImpl;

import com.doot.backend.entity.Account;
import com.doot.backend.exception.AccountNotFoundException;
import com.doot.backend.exception.BalanceLessThanAmountException;
import com.doot.backend.repository.AccountRepository;
import com.doot.backend.service.AccountService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
public class AccountServiceImpl implements AccountService {
    private final AccountRepository accountRepository;


    @Override
    public List<Account> getAllAccount() {
        return accountRepository.findAll();
    }

    @Override
    public Account getAccountByVpa(String vpa){
        return findAccount(vpa);
    }

    @Override
    public void debitAccount(String vpa, BigDecimal amount){
        Account account = findAccount(vpa);
        BigDecimal balance = account.getBalance();
        if(balance.compareTo(amount) < 0){
            throw new BalanceLessThanAmountException("Balance is less than the amount to be debited");
        }
        account.setBalance(account.getBalance().subtract(amount));
        accountRepository.save(account);
    }

    @Override
    public void creditAccount(String vpa, BigDecimal amount) {
        Account account = findAccount(vpa);
        account.setBalance(account.getBalance().add(amount));
        accountRepository.save(account);
    }

    private Account findAccount(String vpa) {
        if (vpa == null) {
            throw new AccountNotFoundException("Account VPA cannot be null");
        }
        String cleanVpa = vpa.trim().toLowerCase();
        if (!cleanVpa.contains("@")) {
            cleanVpa = cleanVpa + "@doot";
        }

        Account account = accountRepository.findAccountByVpa(cleanVpa);
        if (account == null) {
            // Auto-create missing account for demo resilience
            String namePart = cleanVpa.split("@")[0];
            String holderName = namePart.substring(0, 1).toUpperCase() + namePart.substring(1);
            account = new Account(cleanVpa, holderName, new BigDecimal("5000.00"), 0);
            account = accountRepository.save(account);
        }

        return account;
    }
}

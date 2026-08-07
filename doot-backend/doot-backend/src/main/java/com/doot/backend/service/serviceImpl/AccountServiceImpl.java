package com.doot.backend.service.serviceImpl;

import com.doot.backend.entity.Account;
import com.doot.backend.exception.AccountNotFoundException;
import com.doot.backend.exception.BalanceLessThanAmount;
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
    public Optional<Account> getAccountByVpa(String vpa){
        return Optional.of(findAccount(vpa));
    }

    @Override
    public void debitAccount(String vpa, BigDecimal amount){
        Account account = findAccount(vpa);
        BigDecimal balance = account.getBalance();
        if(balance.compareTo(amount) < 0){
            throw new BalanceLessThanAmount("Balance is less than the amount to be debited");
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
        Account account = accountRepository.findAccountByVpa(vpa);

        if (account == null) {
            throw new AccountNotFoundException("Account not found with VPA: " + vpa);
        }

        return account;
    }
}

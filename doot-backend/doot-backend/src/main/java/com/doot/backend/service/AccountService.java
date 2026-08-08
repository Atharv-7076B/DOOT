package com.doot.backend.service;

import com.doot.backend.entity.Account;

import javax.security.auth.login.AccountNotFoundException;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface AccountService {
    List<Account>getAllAccount();

    Account getAccountByVpa(String vpa) throws AccountNotFoundException;

    void debitAccount(String vpa, BigDecimal amount) throws AccountNotFoundException;
    void creditAccount(String vpa,BigDecimal amount);
}

package com.doot.backend.configuration;

import com.doot.backend.entity.Account;
import com.doot.backend.repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final AccountRepository accountRepository;

    @Override
    public void run(String... args) throws Exception {
        if (accountRepository.count() == 0) {
            log.info("Seeding initial accounts into database...");
            List<Account> initialAccounts = List.of(
                    new Account("alice@doot", "Alice", new BigDecimal("5000.00"), 0),
                    new Account("bob@doot", "Bob", new BigDecimal("3500.00"), 0),
                    new Account("charlie@doot", "Charlie", new BigDecimal("2000.00"), 0),
                    new Account("bridge@doot", "Bridge Node", new BigDecimal("10000.00"), 0),
                    new Account("alice@demo", "Alice Demo", new BigDecimal("5000.00"), 0),
                    new Account("bob@demo", "Bob Demo", new BigDecimal("3500.00"), 0),
                    new Account("charlie@demo", "Charlie Demo", new BigDecimal("2000.00"), 0)
            );
            accountRepository.saveAll(initialAccounts);
            log.info("Successfully seeded {} accounts.", initialAccounts.size());
        }
    }
}

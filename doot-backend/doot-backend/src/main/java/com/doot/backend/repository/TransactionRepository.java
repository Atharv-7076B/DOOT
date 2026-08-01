package com.doot.backend.repository;

import com.doot.backend.entity.Transactions;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transactions,Long> {
    List<Transactions> findTop20ByOrderByTransactionIdDesc();
    boolean existsByPacketHash(String packetHash);
}

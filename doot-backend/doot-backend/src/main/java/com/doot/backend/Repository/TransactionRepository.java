package com.doot.backend.Repository;

import com.doot.backend.Entity.Transactions;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transactions,Long> {
    List<Transactions> findTop20ByOrderByTransactionIdDesc();
    boolean existsByPacketHash(String packetHash);
}

package com.doot.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Version;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@AllArgsConstructor
@Getter
@Setter
@NoArgsConstructor
public class Account {

    @Id
    private String vpa;//Its like the virtual payment address eg-Alice@demo

    @Column(nullable = false)
    private String holderName;

    @Column(nullable = false,precision = 19,scale = 2)
    private BigDecimal balance;

    @Version
    private long version;

    public int getId() {
        return vpa != null ? Math.abs(vpa.hashCode()) % 1000 + 1 : 1;
    }


}

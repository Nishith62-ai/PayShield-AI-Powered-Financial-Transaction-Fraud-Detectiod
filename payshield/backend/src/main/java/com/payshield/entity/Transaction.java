package com.payshield.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "transactions")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String transactionId;

    private Integer step;

    private String type;

    private Double amount;

    private Double oldBalanceOrg;

    private Double newBalanceOrg;

    private Double oldBalanceDest;

    private Double newBalanceDest;

    private Boolean fraud;

    private Integer riskScore;


    public Transaction() {
    }


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }


    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }


    public Integer getStep() {
        return step;
    }

    public void setStep(Integer step) {
        this.step = step;
    }


    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }


    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }


    public Double getOldBalanceOrg() {
        return oldBalanceOrg;
    }

    public void setOldBalanceOrg(Double oldBalanceOrg) {
        this.oldBalanceOrg = oldBalanceOrg;
    }


    public Double getNewBalanceOrg() {
        return newBalanceOrg;
    }

    public void setNewBalanceOrg(Double newBalanceOrg) {
        this.newBalanceOrg = newBalanceOrg;
    }


    public Double getOldBalanceDest() {
        return oldBalanceDest;
    }

    public void setOldBalanceDest(Double oldBalanceDest) {
        this.oldBalanceDest = oldBalanceDest;
    }


    public Double getNewBalanceDest() {
        return newBalanceDest;
    }

    public void setNewBalanceDest(Double newBalanceDest) {
        this.newBalanceDest = newBalanceDest;
    }


    public Boolean getFraud() {
        return fraud;
    }

    public void setFraud(Boolean fraud) {
        this.fraud = fraud;
    }


    public Integer getRiskScore() {
        return riskScore;
    }

    public void setRiskScore(Integer riskScore) {
        this.riskScore = riskScore;
    }
}
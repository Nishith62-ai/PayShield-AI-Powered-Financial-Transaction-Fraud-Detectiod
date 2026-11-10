package com.payshield.dto;

import java.math.BigDecimal;

public class FraudPredictionRequest {

    private int step;
    private String type;
    private BigDecimal amount;
    private BigDecimal oldbalanceOrg;
    private BigDecimal newbalanceOrig;
    private BigDecimal oldbalanceDest;
    private BigDecimal newbalanceDest;

    public FraudPredictionRequest() {
    }

    public int getStep() {
        return step;
    }

    public void setStep(int step) {
        this.step = step;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public BigDecimal getOldbalanceOrg() {
        return oldbalanceOrg;
    }

    public void setOldbalanceOrg(BigDecimal oldbalanceOrg) {
        this.oldbalanceOrg = oldbalanceOrg;
    }

    public BigDecimal getNewbalanceOrig() {
        return newbalanceOrig;
    }

    public void setNewbalanceOrig(BigDecimal newbalanceOrig) {
        this.newbalanceOrig = newbalanceOrig;
    }

    public BigDecimal getOldbalanceDest() {
        return oldbalanceDest;
    }

    public void setOldbalanceDest(BigDecimal oldbalanceDest) {
        this.oldbalanceDest = oldbalanceDest;
    }

    public BigDecimal getNewbalanceDest() {
        return newbalanceDest;
    }

    public void setNewbalanceDest(BigDecimal newbalanceDest) {
        this.newbalanceDest = newbalanceDest;
    }
}
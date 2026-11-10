package com.payshield.dto;

public class FraudPredictionResponse {

    private boolean isFraud;
    private double fraudProbability;

    public FraudPredictionResponse() {
    }

    public boolean isFraud() {
        return isFraud;
    }

    public void setFraud(boolean fraud) {
        isFraud = fraud;
    }

    public double getFraudProbability() {
        return fraudProbability;
    }

    public void setFraudProbability(double fraudProbability) {
        this.fraudProbability = fraudProbability;
    }
}
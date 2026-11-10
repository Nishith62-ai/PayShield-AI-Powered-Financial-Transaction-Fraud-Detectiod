package com.payshield.service;

import com.payshield.dto.FraudPredictionResponse;
import com.payshield.entity.Transaction;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class FraudDetectionService {

    private final RestTemplate restTemplate;

    public FraudDetectionService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public FraudPredictionResponse checkFraud(Transaction transaction) {

        String fraudServiceUrl = "http://127.0.0.1:8000/predict";

        Map<String, Object> request = new HashMap<>();

        request.put("step", 1);
        request.put("type", transaction.getType());
        request.put("amount", transaction.getAmount());
        request.put("oldbalanceOrg", transaction.getOldBalanceOrg());
        request.put("newbalanceOrig", transaction.getNewBalanceOrg());
        request.put("oldbalanceDest", transaction.getOldBalanceDest());
        request.put("newbalanceDest", transaction.getNewBalanceDest());

        FraudPredictionResponse response =
                restTemplate.postForObject(
                        fraudServiceUrl,
                        request,
                        FraudPredictionResponse.class
                );

        if (response != null) {
            transaction.setFraud(response.isFraud());

            int riskScore = (int) (response.getFraudProbability() * 100);

            transaction.setRiskScore(riskScore);
        }

        return response;
    }
}
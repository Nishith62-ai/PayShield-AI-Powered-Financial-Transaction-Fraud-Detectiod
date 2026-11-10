package com.payshield.service;

import com.payshield.dto.FraudPredictionRequest;
import com.payshield.dto.FraudPredictionResponse;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class FraudClientService {

    private final RestTemplate restTemplate;

    public FraudClientService() {
        this.restTemplate = new RestTemplate();
    }

    public FraudPredictionResponse predictFraud(
            FraudPredictionRequest request) {

        String fraudServiceUrl = "http://localhost:8000/predict";

        return restTemplate.postForObject(
                fraudServiceUrl,
                request,
                FraudPredictionResponse.class
        );
    }
}
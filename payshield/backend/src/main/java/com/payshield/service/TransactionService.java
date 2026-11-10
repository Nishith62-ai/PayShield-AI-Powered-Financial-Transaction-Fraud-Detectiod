package com.payshield.service;

import com.payshield.dto.FraudPredictionResponse;
import com.payshield.entity.Transaction;
import com.payshield.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final FraudDetectionService fraudDetectionService;

    public TransactionService(
            TransactionRepository transactionRepository,
            FraudDetectionService fraudDetectionService) {

        this.transactionRepository = transactionRepository;
        this.fraudDetectionService = fraudDetectionService;
    }


    public Transaction saveTransaction(Transaction transaction) {

        // Send transaction to Python ML Fraud Detection Service
        FraudPredictionResponse prediction =
                fraudDetectionService.checkFraud(transaction);

        // Save transaction with fraud prediction and risk score
        return transactionRepository.save(transaction);
    }


    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAll();
    }


    public Optional<Transaction> getTransactionByTransactionId(
            String transactionId) {

        return transactionRepository.findByTransactionId(transactionId);
    }


    public long getTransactionCount() {
        return transactionRepository.count();
    }
}
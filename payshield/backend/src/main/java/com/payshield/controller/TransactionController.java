package com.payshield.controller;

import com.payshield.entity.Transaction;
import com.payshield.service.TransactionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "http://localhost:5173")
public class TransactionController {


private final TransactionService transactionService;

public TransactionController(TransactionService transactionService) {
    this.transactionService = transactionService;
}

// Create a new transaction
@PostMapping
public ResponseEntity<Transaction> createTransaction(
        @RequestBody Transaction transaction) {

    Transaction savedTransaction =
            transactionService.saveTransaction(transaction);

    return new ResponseEntity<>(savedTransaction, HttpStatus.CREATED);
}

// Get all transactions
@GetMapping
public ResponseEntity<List<Transaction>> getAllTransactions() {
    return ResponseEntity.ok(transactionService.getAllTransactions());
}

// Get transaction by transaction ID
@GetMapping("/{transactionId}")
public ResponseEntity<?> getTransactionById(
        @PathVariable String transactionId) {

    Optional<Transaction> transaction =
            transactionService.getTransactionByTransactionId(transactionId);

    if (transaction.isPresent()) {
        return ResponseEntity.ok(transaction.get());
    }

    return ResponseEntity
            .status(HttpStatus.NOT_FOUND)
            .body("Transaction not found");
}

// Get total transaction count
@GetMapping("/count")
public ResponseEntity<Long> getTransactionCount() {
    return ResponseEntity.ok(transactionService.getTransactionCount());
}


}

package com.payshield;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Entry point for the PayShield backend.
 *
 * This service exposes REST APIs for authentication and simulated payment
 * transactions, persists data in PostgreSQL, and calls out to the Python
 * FastAPI fraud detection service to score each transaction's risk.
 */
@SpringBootApplication
public class PayshieldApplication {

    public static void main(String[] args) {
        SpringApplication.run(PayshieldApplication.class, args);
    }
}

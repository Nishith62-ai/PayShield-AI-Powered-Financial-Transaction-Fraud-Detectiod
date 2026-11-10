import axios from "axios";
import { Transaction } from "../types/transaction";

const API_BASE_URL = "http://localhost:8080/api";

export const createTransaction = async (
  transaction: Transaction
): Promise<Transaction> => {
  const response = await axios.post<Transaction>(
    `${API_BASE_URL}/transactions`,
    transaction
  );

  return response.data;
};

export const getTransactions = async (): Promise<Transaction[]> => {
  const response = await axios.get<Transaction[]>(
    `${API_BASE_URL}/transactions`
  );

  return response.data;
};

export const getTransactionCount = async (): Promise<number> => {
  const response = await axios.get<number>(
    `${API_BASE_URL}/transactions/count`
  );

  return response.data;
};
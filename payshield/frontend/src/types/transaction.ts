export interface Transaction {
  id?: number;
  transactionId: string;
  step: number;
  type: string;
  amount: number;
  oldBalanceOrg: number;
  newBalanceOrg: number;
  oldBalanceDest: number;
  newBalanceDest: number;
  fraud?: boolean;
  riskScore?: number;
}
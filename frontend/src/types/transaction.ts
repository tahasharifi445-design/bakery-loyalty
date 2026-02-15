export interface PurchaseTransactionRequest {
  customerId: string;
  purchaseAmount: number;
}

export interface PurchaseTransactionResponse {
  transactionId: string;
  pointsAwarded: number;
  newBalance: number;
}

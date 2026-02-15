import type { PurchaseTransactionRequest, PurchaseTransactionResponse } from '../types/transaction';

const API_BASE_URL = '/v1';

export class TransactionService {
  static async createPurchase(
    request: PurchaseTransactionRequest,
    token: string
  ): Promise<PurchaseTransactionResponse> {
    const response = await fetch(`${API_BASE_URL}/transactions/purchase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Purchase transaction failed' }));
      throw new Error(error.error || 'Purchase transaction failed');
    }

    return response.json();
  }
}

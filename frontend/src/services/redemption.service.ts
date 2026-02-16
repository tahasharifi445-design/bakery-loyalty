import type { Reward } from '../types/reward';
import type { RedemptionRequest, RedemptionResponse } from '../types/redemption';

const API_BASE_URL = '/v1';

export class RedemptionService {
  static async getRewards(token: string): Promise<Reward[]> {
    const response = await fetch(`${API_BASE_URL}/rewards`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch rewards' }));
      throw new Error(error.error || 'Failed to fetch rewards');
    }

    const data = await response.json();
    
    // Validate response structure
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid response format from rewards API');
    }
    
    if (!Array.isArray(data.rewards)) {
      throw new Error('Expected rewards array in API response');
    }
    
    return data.rewards;
  }

  static async redeemReward(
    request: RedemptionRequest,
    token: string
  ): Promise<RedemptionResponse> {
    const response = await fetch(`${API_BASE_URL}/redemptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Redemption failed' }));
      throw new Error(error.error || 'Redemption failed');
    }

    return response.json();
  }
}

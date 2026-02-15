const API_BASE_URL = '/v1';

export interface LoyaltyConfig {
  pointsPerDollar: number;
}

export interface RewardInput {
  name: string;
  requiredPoints: number;
}

export interface RewardResponse {
  id: string;
  name: string;
  pointsCost: number;
  isActive: boolean;
}

export interface StaffUser {
  id: string;
  name: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export class AdminService {
  // Config endpoints
  static async getConfig(token: string): Promise<LoyaltyConfig> {
    const response = await fetch(`${API_BASE_URL}/admin/config`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch config' }));
      throw new Error(error.error || 'Failed to fetch config');
    }

    return response.json();
  }

  static async updateConfig(token: string, config: LoyaltyConfig): Promise<LoyaltyConfig> {
    const response = await fetch(`${API_BASE_URL}/admin/config`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to update config' }));
      throw new Error(error.error || 'Failed to update config');
    }

    return response.json();
  }

  // Rewards endpoints
  static async createReward(token: string, reward: RewardInput): Promise<RewardResponse> {
    const response = await fetch(`${API_BASE_URL}/admin/rewards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(reward),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to create reward' }));
      throw new Error(error.error || 'Failed to create reward');
    }

    return response.json();
  }

  static async updateReward(token: string, id: string, reward: Partial<RewardInput>): Promise<RewardResponse> {
    const response = await fetch(`${API_BASE_URL}/admin/rewards/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(reward),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to update reward' }));
      throw new Error(error.error || 'Failed to update reward');
    }

    return response.json();
  }

  static async toggleRewardActive(token: string, id: string, isActive: boolean): Promise<RewardResponse> {
    const response = await fetch(`${API_BASE_URL}/admin/rewards/${id}/active`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ isActive }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to toggle reward' }));
      throw new Error(error.error || 'Failed to toggle reward');
    }

    return response.json();
  }

  // Staff endpoints
  static async getStaff(token: string): Promise<{ users: StaffUser[] }> {
    const response = await fetch(`${API_BASE_URL}/admin/staff`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch staff' }));
      throw new Error(error.error || 'Failed to fetch staff');
    }

    return response.json();
  }

  static async toggleStaffActive(token: string, id: string, isActive: boolean): Promise<StaffUser> {
    const response = await fetch(`${API_BASE_URL}/admin/staff/${id}/active`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ isActive }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to toggle staff' }));
      throw new Error(error.error || 'Failed to toggle staff');
    }

    return response.json();
  }
}

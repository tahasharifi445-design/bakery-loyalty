import type { Customer, CustomerLookupRequest, CreateCustomerRequest } from '../types/customer';

const API_BASE_URL = '/v1';

export class CustomerService {
  static async lookup(request: CustomerLookupRequest, token: string): Promise<Customer> {
    const response = await fetch(`${API_BASE_URL}/customers/lookup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Customer lookup failed' }));
      throw new Error(error.error || 'Customer lookup failed');
    }

    return response.json();
  }

  static async create(request: CreateCustomerRequest, token: string): Promise<Customer> {
    const response = await fetch(`${API_BASE_URL}/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Customer creation failed' }));
      throw new Error(error.error || 'Customer creation failed');
    }

    return response.json();
  }
}

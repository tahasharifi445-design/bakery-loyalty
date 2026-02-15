export interface Customer {
  id: string;
  name: string | null;
  phone_number: string;
  points_balance: number;
  created_at: string;
  updated_at: string;
}

export interface CustomerLookupRequest {
  phone: string;
}

export interface CreateCustomerRequest {
  name: string;
  phone: string;
}

import { useState } from 'react';
import './CreateCustomerModal.css';

interface CreateCustomerModalProps {
  phone: string;
  onCreateCustomer: (name: string) => Promise<void>;
  isLoading: boolean;
}

export const CreateCustomerModal = ({ phone, onCreateCustomer, isLoading }: CreateCustomerModalProps) => {
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCreateCustomer(name);
  };

  return (
    <div className="create-customer-container">
      <div className="create-customer-card">
        <h2 className="create-customer-title">Customer Not Found</h2>
        <p className="create-customer-subtitle">
          No customer found with phone number: <strong>{phone}</strong>
        </p>
        <p className="create-customer-description">
          Would you like to create a new customer?
        </p>

        <form onSubmit={handleSubmit} className="create-customer-form">
          <div className="form-group">
            <label htmlFor="customer-name">Customer Name</label>
            <input
              id="customer-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter customer name"
              required
              disabled={isLoading}
              className="input-field"
            />
          </div>

          <div className="form-group">
            <label htmlFor="customer-phone">Phone Number</label>
            <input
              id="customer-phone"
              type="text"
              value={phone}
              disabled
              className="input-field input-disabled"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading || !name.trim()}
            className="create-button"
          >
            {isLoading ? 'Creating Customer...' : 'Create Customer'}
          </button>
        </form>
      </div>
    </div>
  );
};

import { useState } from 'react';
import './PurchaseForm.css';

interface PurchaseFormProps {
  onSubmit: (amount: number) => Promise<void>;
  isLoading: boolean;
}

export const PurchaseForm = ({ onSubmit, isLoading }: PurchaseFormProps) => {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  const validateAmount = (value: string): boolean => {
    const numValue = parseFloat(value);
    
    if (isNaN(numValue)) {
      setError('Please enter a valid number');
      return false;
    }
    
    if (numValue <= 0) {
      setError('Amount must be greater than 0');
      return false;
    }
    
    setError('');
    return true;
  };

  const handleAmountChange = (value: string) => {
    setAmount(value);
    if (value.trim()) {
      validateAmount(value);
    } else {
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateAmount(amount)) {
      return;
    }
    
    const numAmount = parseFloat(amount);
    await onSubmit(numAmount);
  };

  return (
    <div className="purchase-form-card">
      <h2 className="purchase-form-title">Enter Purchase Amount</h2>
      
      <form onSubmit={handleSubmit} className="purchase-form">
        <div className="form-group">
          <label htmlFor="amount" className="form-label">
            Purchase Amount ($)
          </label>
          <input
            id="amount"
            type="number"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            placeholder="0.00"
            disabled={isLoading}
            className="purchase-input"
            inputMode="decimal"
            autoFocus
          />
          {error && <p className="error-text">{error}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading || !amount.trim() || !!error}
          className="submit-button"
        >
          {isLoading ? 'Processing...' : 'Submit Purchase'}
        </button>
      </form>
    </div>
  );
};

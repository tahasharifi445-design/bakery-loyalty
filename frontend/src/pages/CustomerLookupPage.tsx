import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { CustomerService } from '../services/customer.service';
import { CustomerSummaryCard } from '../components/CustomerSummaryCard';
import { CreateCustomerModal } from '../components/CreateCustomerModal';
import type { Customer } from '../types/customer';
import './CustomerLookupPage.css';

type PageState = 'idle' | 'loading' | 'found' | 'not-found' | 'error';

interface CustomerLookupPageProps {
  onNavigateBack?: () => void;
}

export const CustomerLookupPage = ({ onNavigateBack }: CustomerLookupPageProps) => {
  const { token, logout } = useAuth();
  const [phone, setPhone] = useState('');
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [pageState, setPageState] = useState<PageState>('idle');
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const normalizePhone = (phoneInput: string): string => {
    // Strip spaces, dashes, parentheses, and other common phone formatting
    return phoneInput.replace(/[\s\-\(\)\+\.]/g, '');
  };

  const handlePhoneInput = (value: string) => {
    setPhone(value);
    // Reset state when user modifies phone input
    if (pageState !== 'idle' && pageState !== 'loading') {
      setPageState('idle');
      setCustomer(null);
      setError('');
    }
  };

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      setError('Unauthorized. Please log in again.');
      logout();
      return;
    }

    const normalizedPhone = normalizePhone(phone);
    if (!normalizedPhone) {
      setError('Please enter a valid phone number');
      return;
    }

    setError('');
    setPageState('loading');

    try {
      const foundCustomer = await CustomerService.lookup(
        { phone: normalizedPhone },
        token
      );
      setCustomer(foundCustomer);
      setPageState('found');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      
      if (errorMessage.includes('Customer not found')) {
        setPageState('not-found');
      } else if (errorMessage.includes('Unauthorized')) {
        setError('Session expired. Please log in again.');
        logout();
      } else {
        setError(errorMessage);
        setPageState('error');
      }
    }
  };

  const handleCreateCustomer = async (name: string) => {
    if (!token) {
      setError('Unauthorized. Please log in again.');
      logout();
      return;
    }

    const normalizedPhone = normalizePhone(phone);
    setIsCreating(true);
    setError('');

    try {
      const newCustomer = await CustomerService.create(
        { name, phone: normalizedPhone },
        token
      );
      setCustomer(newCustomer);
      setPageState('found');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      
      if (errorMessage.includes('Unauthorized')) {
        setError('Session expired. Please log in again.');
        logout();
      } else if (errorMessage.includes('already exists')) {
        setError('This customer already exists. Try looking up again.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleBackToHome = () => {
    if (onNavigateBack) {
      onNavigateBack();
    } else {
      window.history.back();
    }
  };

  return (
    <div className="lookup-container">
      <div className="lookup-header">
        <h1 className="lookup-title">Customer Lookup</h1>
        <button onClick={handleBackToHome} className="back-button">
          ← Back to Home
        </button>
      </div>

      <div className="lookup-content">
        <div className="lookup-card">
          <h2 className="lookup-subtitle">Find Customer by Phone</h2>
          
          <form onSubmit={handleLookup} className="lookup-form">
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => handlePhoneInput(e.target.value)}
                placeholder="Enter phone number"
                required
                disabled={pageState === 'loading' || isCreating}
                className="input-field phone-input"
                inputMode="numeric"
              />
              <p className="input-hint">
                Enter phone number (spaces and dashes will be removed)
              </p>
            </div>

            <button 
              type="submit" 
              disabled={pageState === 'loading' || isCreating || !phone.trim()}
              className="lookup-button"
            >
              {pageState === 'loading' ? 'Searching...' : 'Look Up Customer'}
            </button>
          </form>

          {error && (
            <div className="error-message">{error}</div>
          )}
        </div>

        {pageState === 'found' && customer && (
          <CustomerSummaryCard customer={customer} />
        )}

        {pageState === 'not-found' && (
          <CreateCustomerModal
            phone={normalizePhone(phone)}
            onCreateCustomer={handleCreateCustomer}
            isLoading={isCreating}
          />
        )}
      </div>
    </div>
  );
};

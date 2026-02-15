import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { TransactionService } from '../services/transaction.service';
import { CustomerHeader } from '../components/CustomerHeader';
import { PurchaseForm } from '../components/PurchaseForm';
import type { Customer } from '../types/customer';
import './PurchasePage.css';

interface PurchasePageProps {
  selectedCustomer: Customer | null;
  onNavigateBack?: () => void;
  onNavigateToDashboard?: () => void;
}

type PageState = 'idle' | 'loading' | 'success' | 'error';

export const PurchasePage = ({ 
  selectedCustomer, 
  onNavigateBack,
  onNavigateToDashboard 
}: PurchasePageProps) => {
  const { token, logout } = useAuth();
  const [customer, setCustomer] = useState<Customer | null>(selectedCustomer);
  const [pageState, setPageState] = useState<PageState>('idle');
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState<{
    pointsAwarded: number;
    newBalance: number;
  } | null>(null);

  useEffect(() => {
    // If no customer is selected, redirect to customer lookup
    if (!selectedCustomer) {
      setError('No customer selected. Please select a customer first.');
    }
  }, [selectedCustomer]);

  const handlePurchase = async (amount: number) => {
    if (!token) {
      setError('Unauthorized. Please log in again.');
      logout();
      return;
    }

    if (!customer) {
      setError('No customer selected');
      return;
    }

    setPageState('loading');
    setError('');

    try {
      const result = await TransactionService.createPurchase(
        {
          customerId: customer.id,
          purchaseAmount: amount,
        },
        token
      );

      // Update customer with new balance
      setCustomer({
        ...customer,
        points_balance: result.newBalance,
      });

      setSuccessData({
        pointsAwarded: result.pointsAwarded,
        newBalance: result.newBalance,
      });
      setPageState('success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      
      if (errorMessage.includes('Unauthorized')) {
        setError('Session expired. Please log in again.');
        logout();
      } else {
        setError(errorMessage);
      }
      setPageState('error');
    }
  };

  const handleBackToDashboard = () => {
    if (onNavigateToDashboard) {
      onNavigateToDashboard();
    } else if (onNavigateBack) {
      onNavigateBack();
    } else {
      window.history.back();
    }
  };

  const handleNewCustomer = () => {
    // Reset state and navigate back
    setPageState('idle');
    setSuccessData(null);
    setError('');
    if (onNavigateBack) {
      onNavigateBack();
    } else {
      window.history.back();
    }
  };

  if (!selectedCustomer) {
    return (
      <div className="purchase-container">
        <div className="purchase-content">
          <div className="error-card">
            <h2>No Customer Selected</h2>
            <p>Please select a customer before making a purchase.</p>
            <button onClick={handleBackToDashboard} className="action-button">
              Go to Customer Lookup
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="purchase-container">
      <div className="purchase-header">
        <h1 className="purchase-title">Record Purchase</h1>
        <button onClick={handleBackToDashboard} className="back-button">
          ← Back to Dashboard
        </button>
      </div>

      <div className="purchase-content">
        {customer && <CustomerHeader customer={customer} />}

        {pageState === 'success' && successData ? (
          <div className="success-card">
            <div className="success-icon">✓</div>
            <h2 className="success-title">Purchase Successful!</h2>
            
            <div className="success-details">
              <div className="detail-row">
                <span className="detail-label">Points Awarded:</span>
                <span className="detail-value highlight">+{successData.pointsAwarded}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">New Balance:</span>
                <span className="detail-value">{successData.newBalance}</span>
              </div>
            </div>

            <div className="success-actions">
              <button onClick={handleBackToDashboard} className="action-button primary">
                Back to Dashboard
              </button>
              <button onClick={handleNewCustomer} className="action-button secondary">
                New Customer
              </button>
            </div>
          </div>
        ) : (
          <>
            <PurchaseForm 
              onSubmit={handlePurchase} 
              isLoading={pageState === 'loading'} 
            />

            {error && (
              <div className="error-message">{error}</div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

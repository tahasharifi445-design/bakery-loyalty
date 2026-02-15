import type { Customer } from '../types/customer';
import './CustomerSummaryCard.css';

interface CustomerSummaryCardProps {
  customer: Customer;
  onNavigateToPurchase?: () => void;
  onNavigateToRedemption?: () => void;
}

export const CustomerSummaryCard = ({ customer, onNavigateToPurchase, onNavigateToRedemption }: CustomerSummaryCardProps) => {
  return (
    <div className="customer-summary-card">
      <h2 className="customer-summary-title">Customer Found</h2>
      
      <div className="customer-details">
        <div className="detail-item">
          <span className="detail-label">Name:</span>
          <span className="detail-value">{customer.name || 'Not provided'}</span>
        </div>
        
        <div className="detail-item">
          <span className="detail-label">Phone:</span>
          <span className="detail-value">{customer.phone_number}</span>
        </div>
        
        <div className="detail-item points-highlight">
          <span className="detail-label">Points Balance:</span>
          <span className="detail-value points-value">{customer.points_balance}</span>
        </div>
      </div>

      {(onNavigateToPurchase || onNavigateToRedemption) && (
        <div className="customer-actions">
          {onNavigateToPurchase && (
            <button onClick={onNavigateToPurchase} className="purchase-button">
              Record Purchase
            </button>
          )}
          {onNavigateToRedemption && (
            <button onClick={onNavigateToRedemption} className="redemption-button">
              Redeem Rewards
            </button>
          )}
        </div>
      )}
    </div>
  );
};

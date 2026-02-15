import type { Customer } from '../types/customer';
import './CustomerSummaryCard.css';

interface CustomerSummaryCardProps {
  customer: Customer;
  onNavigateToPurchase?: () => void;
}

export const CustomerSummaryCard = ({ customer, onNavigateToPurchase }: CustomerSummaryCardProps) => {
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

      {onNavigateToPurchase && (
        <div className="customer-actions">
          <button onClick={onNavigateToPurchase} className="purchase-button">
            Record Purchase
          </button>
        </div>
      )}
    </div>
  );
};

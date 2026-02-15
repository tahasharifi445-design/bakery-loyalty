import type { Customer } from '../types/customer';
import './CustomerHeader.css';

interface CustomerHeaderProps {
  customer: Customer;
}

export const CustomerHeader = ({ customer }: CustomerHeaderProps) => {
  return (
    <div className="customer-header">
      <div className="customer-header-content">
        <div className="customer-info">
          <h2 className="customer-name">{customer.name || 'Customer'}</h2>
          <p className="customer-phone">{customer.phone_number}</p>
        </div>
        <div className="customer-balance">
          <span className="balance-label">Points Balance</span>
          <span className="balance-value">{customer.points_balance}</span>
        </div>
      </div>
    </div>
  );
};

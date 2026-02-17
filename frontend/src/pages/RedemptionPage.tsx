import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { RedemptionService } from '../services/redemption.service';
import { CustomerHeader } from '../components/CustomerHeader';
import { RewardList } from '../components/RewardList';
import type { Customer } from '../types/customer';
import type { Reward } from '../types/reward';
import './RedemptionPage.css';

interface RedemptionPageProps {
  selectedCustomer: Customer | null;
  onNavigateBack?: () => void;
  onNavigateToDashboard?: () => void;
}

type PageState = 'idle' | 'loading' | 'success' | 'error';

export const RedemptionPage = ({ 
  selectedCustomer, 
  onNavigateBack,
  onNavigateToDashboard 
}: RedemptionPageProps) => {
  const { token, logout } = useAuth();
  const [customer, setCustomer] = useState<Customer | null>(selectedCustomer);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [pageState, setPageState] = useState<PageState>('loading');
  const [error, setError] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [successData, setSuccessData] = useState<{
    pointsDeducted: number;
    newBalance: number;
    rewardName: string;
  } | null>(null);

  useEffect(() => {
    const loadRewards = async () => {
      if (!token) {
        setError('Unauthorized. Please log in again.');
        logout();
        return;
      }

      if (!selectedCustomer) {
        setError('No customer selected. Please select a customer first.');
        setPageState('error');
        return;
      }

      try {
        setPageState('loading');
        const rewardsData = await RedemptionService.getRewards(token);
        setRewards(rewardsData);
        setPageState('idle');
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

    void loadRewards();
  }, [selectedCustomer, token, logout]);

  const handleRedeemClick = (rewardId: string) => {
    const reward = rewards.find(r => r.id === rewardId);
    if (reward) {
      setSelectedReward(reward);
      setShowConfirm(true);
    }
  };

  const handleConfirmRedeem = async () => {
    if (!token || !customer || !selectedReward) return;

    setShowConfirm(false);
    setIsRedeeming(true);
    setError('');

    try {
      const result = await RedemptionService.redeemReward(
        {
          customerId: customer.id,
          rewardId: selectedReward.id,
        },
        token
      );

      // Update customer with new balance
      setCustomer({
        ...customer,
        points_balance: result.newBalance,
      });

      setSuccessData({
        pointsDeducted: result.pointsDeducted,
        newBalance: result.newBalance,
        rewardName: selectedReward.name,
      });
      setPageState('success');
      setIsRedeeming(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      
      if (errorMessage.includes('Unauthorized')) {
        setError('Session expired. Please log in again.');
        logout();
      } else {
        setError(errorMessage);
      }
      setIsRedeeming(false);
    }
  };

  const handleCancelConfirm = () => {
    setShowConfirm(false);
    setSelectedReward(null);
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
    setPageState('loading');
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
      <div className="redemption-container">
        <div className="redemption-content">
          <div className="error-card">
            <h2>No Customer Selected</h2>
            <p>Please select a customer before redeeming rewards.</p>
            <button onClick={handleBackToDashboard} className="action-button">
              Go to Customer Lookup
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="redemption-container">
      <div className="redemption-header">
        <h1 className="redemption-title">Redeem Rewards</h1>
        <button onClick={handleBackToDashboard} className="back-button">
          ← Back to Dashboard
        </button>
      </div>

      <div className="redemption-content">
        {customer && <CustomerHeader customer={customer} />}

        {pageState === 'loading' && (
          <div className="loading-message">Loading rewards...</div>
        )}

        {pageState === 'success' && successData ? (
          <div className="success-card">
            <div className="success-icon">✓</div>
            <h2 className="success-title">Redemption Successful!</h2>
            
            <div className="success-details">
              <div className="detail-row">
                <span className="detail-label">Reward Redeemed:</span>
                <span className="detail-value">{successData.rewardName}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Points Deducted:</span>
                <span className="detail-value highlight">-{successData.pointsDeducted}</span>
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
            {pageState === 'idle' && (
              <RewardList 
                rewards={rewards}
                customerBalance={customer?.points_balance ?? 0}
                onRedeem={handleRedeemClick}
                isLoading={isRedeeming}
              />
            )}

            {error && (
              <div className="error-message">{error}</div>
            )}
          </>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirm && selectedReward && (
        <div className="modal-overlay" onClick={handleCancelConfirm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Confirm Redemption</h2>
            <p>
              Are you sure you want to redeem <strong>{selectedReward.name}</strong> for{' '}
              <strong>{selectedReward.pointsCost} points</strong>?
            </p>
            <div className="modal-actions">
              <button onClick={handleConfirmRedeem} className="action-button primary">
                Yes, Redeem
              </button>
              <button onClick={handleCancelConfirm} className="action-button secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

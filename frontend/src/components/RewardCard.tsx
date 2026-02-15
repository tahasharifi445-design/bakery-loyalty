import type { Reward } from '../types/reward';
import './RewardCard.css';

interface RewardCardProps {
  reward: Reward;
  customerBalance: number;
  onRedeem: (rewardId: string) => void;
  isLoading?: boolean;
}

export const RewardCard = ({ 
  reward, 
  customerBalance, 
  onRedeem, 
  isLoading = false 
}: RewardCardProps) => {
  const canAfford = customerBalance >= reward.points_cost;

  return (
    <div className={`reward-card ${!canAfford ? 'disabled' : ''}`}>
      <div className="reward-info">
        <h3 className="reward-name">{reward.name}</h3>
        <div className="reward-cost">
          <span className="cost-label">Cost:</span>
          <span className="cost-value">{reward.points_cost} points</span>
        </div>
      </div>
      
      <button
        className={`redeem-button ${!canAfford ? 'disabled' : ''}`}
        onClick={() => onRedeem(reward.id)}
        disabled={!canAfford || isLoading}
      >
        {isLoading ? 'Redeeming...' : canAfford ? 'Redeem' : 'Insufficient Points'}
      </button>
    </div>
  );
};

import type { Reward } from '../types/reward';
import { RewardCard } from './RewardCard';
import './RewardList.css';

interface RewardListProps {
  rewards: Reward[];
  customerBalance: number;
  onRedeem: (rewardId: string) => void;
  isLoading?: boolean;
}

export const RewardList = ({ 
  rewards, 
  customerBalance, 
  onRedeem, 
  isLoading = false 
}: RewardListProps) => {
  if (rewards.length === 0) {
    return (
      <div className="empty-rewards">
        <p>No rewards available at this time.</p>
      </div>
    );
  }

  return (
    <div className="reward-list">
      {rewards.map((reward) => (
        <RewardCard
          key={reward.id}
          reward={reward}
          customerBalance={customerBalance}
          onRedeem={onRedeem}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
};

import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { AdminService, type RewardResponse, type RewardInput } from '../../services/admin.service';
import './RewardsAdminTable.css';

interface RewardsAdminTableProps {
  rewards: RewardResponse[];
  onRewardsUpdated: () => void;
}

export const RewardsAdminTable = ({ rewards, onRewardsUpdated }: RewardsAdminTableProps) => {
  const { token, logout } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newReward, setNewReward] = useState<RewardInput>({ name: '', requiredPoints: 0 });
  const [editReward, setEditReward] = useState<Partial<RewardInput>>({});
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateReward = async () => {
    if (!token) {
      logout();
      return;
    }

    if (!newReward.name.trim() || newReward.requiredPoints <= 0) {
      setError('Please provide a valid name and points cost');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      await AdminService.createReward(token, newReward);
      setNewReward({ name: '', requiredPoints: 0 });
      setIsCreating(false);
      onRewardsUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create reward');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateReward = async (id: string) => {
    if (!token) {
      logout();
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      await AdminService.updateReward(token, id, editReward);
      setEditingId(null);
      setEditReward({});
      onRewardsUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update reward');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    if (!token) {
      logout();
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to ${currentActive ? 'deactivate' : 'activate'} this reward?`
    );

    if (!confirmed) return;

    setIsLoading(true);
    setError('');
    try {
      await AdminService.toggleRewardActive(token, id, !currentActive);
      onRewardsUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle reward');
    } finally {
      setIsLoading(false);
    }
  };

  const startEdit = (reward: RewardResponse) => {
    setEditingId(reward.id);
    setEditReward({ name: reward.name, requiredPoints: reward.pointsCost });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditReward({});
  };

  return (
    <div className="rewards-admin-table">
      <div className="table-header">
        <h2>Rewards Management</h2>
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="create-button"
            disabled={isLoading}
          >
            + Create New Reward
          </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {isCreating && (
        <div className="create-form">
          <h3>Create New Reward</h3>
          <div className="form-row">
            <input
              type="text"
              placeholder="Reward name"
              value={newReward.name}
              onChange={(e) => setNewReward({ ...newReward, name: e.target.value })}
              disabled={isLoading}
            />
            <input
              type="number"
              placeholder="Points cost"
              min="1"
              value={newReward.requiredPoints || ''}
              onChange={(e) => setNewReward({ ...newReward, requiredPoints: parseInt(e.target.value) || 0 })}
              disabled={isLoading}
            />
            <button onClick={handleCreateReward} disabled={isLoading} className="action-button success">
              Create
            </button>
            <button onClick={() => {
              setIsCreating(false);
              setNewReward({ name: '', requiredPoints: 0 });
            }} disabled={isLoading} className="action-button cancel">
              Cancel
            </button>
          </div>
        </div>
      )}

      <table className="rewards-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Points Cost</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rewards.length === 0 ? (
            <tr>
              <td colSpan={4} className="no-data">No rewards found</td>
            </tr>
          ) : (
            rewards.map((reward) => (
              <tr key={reward.id}>
                <td>
                  {editingId === reward.id ? (
                    <input
                      type="text"
                      value={editReward.name ?? reward.name}
                      onChange={(e) => setEditReward({ ...editReward, name: e.target.value })}
                      disabled={isLoading}
                    />
                  ) : (
                    reward.name
                  )}
                </td>
                <td>
                  {editingId === reward.id ? (
                    <input
                      type="number"
                      min="1"
                      value={editReward.requiredPoints ?? reward.pointsCost}
                      onChange={(e) => setEditReward({ ...editReward, requiredPoints: parseInt(e.target.value) || 0 })}
                      disabled={isLoading}
                    />
                  ) : (
                    reward.pointsCost
                  )}
                </td>
                <td>
                  <span className={`status-badge ${reward.isActive ? 'active' : 'inactive'}`}>
                    {reward.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="actions-cell">
                  {editingId === reward.id ? (
                    <>
                      <button onClick={() => handleUpdateReward(reward.id)} disabled={isLoading} className="action-button success">
                        Save
                      </button>
                      <button onClick={cancelEdit} disabled={isLoading} className="action-button cancel">
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEdit(reward)} disabled={isLoading} className="action-button">
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleActive(reward.id, reward.isActive)}
                        disabled={isLoading}
                        className={`action-button ${reward.isActive ? 'danger' : 'success'}`}
                      >
                        {reward.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

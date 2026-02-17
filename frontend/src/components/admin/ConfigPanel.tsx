import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { AdminService, type LoyaltyConfig } from '../../services/admin.service';
import './ConfigPanel.css';

interface ConfigPanelProps {
  config: LoyaltyConfig;
  onConfigUpdated: (config: LoyaltyConfig) => void;
}

export const ConfigPanel = ({ config, onConfigUpdated }: ConfigPanelProps) => {
  const { token, logout } = useAuth();
  const [pointsPerDollar, setPointsPerDollar] = useState(config.pointsPerDollar.toString());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const value = parseFloat(pointsPerDollar);
    if (isNaN(value) || value <= 0 || value > 1000) {
      setError('Points per dollar must be between 0 and 1000');
      return;
    }

    if (!token) {
      setError('Unauthorized');
      logout();
      return;
    }

    setIsLoading(true);
    try {
      const updatedConfig = await AdminService.updateConfig(token, {
        pointsPerDollar: value,
      });
      onConfigUpdated(updatedConfig);
      setSuccessMessage('Configuration updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update config');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="config-panel">
      <h2>Loyalty Configuration</h2>
      <form onSubmit={handleSubmit} className="config-form">
        <div className="form-group">
          <label htmlFor="pointsPerDollar">
            Points Per Dollar:
          </label>
          <input
            id="pointsPerDollar"
            type="number"
            step="0.01"
            min="0.01"
            max="1000"
            value={pointsPerDollar}
            onChange={(e) => setPointsPerDollar(e.target.value)}
            disabled={isLoading}
            className="config-input"
          />
          <p className="help-text">
            Customers will earn this many points for every dollar spent.
          </p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}

        <button
          type="submit"
          disabled={isLoading}
          className="submit-button"
        >
          {isLoading ? 'Updating...' : 'Update Configuration'}
        </button>
      </form>
    </div>
  );
};

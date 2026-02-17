import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { AdminService, type LoyaltyConfig, type RewardResponse, type StaffUser } from '../../services/admin.service';
import { ConfigPanel } from '../../components/admin/ConfigPanel';
import { RewardsAdminTable } from '../../components/admin/RewardsAdminTable';
import { StaffAdminTable } from '../../components/admin/StaffAdminTable';
import './AdminDashboardPage.css';

type Tab = 'config' | 'rewards' | 'staff';

interface AdminDashboardPageProps {
  onNavigateBack: () => void;
}

export const AdminDashboardPage = ({ onNavigateBack }: AdminDashboardPageProps) => {
  const { user, token, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('config');
  const [config, setConfig] = useState<LoyaltyConfig | null>(null);
  const [rewards, setRewards] = useState<RewardResponse[]>([]);
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Check if user is admin
  if (user?.role !== 'admin') {
    return (
      <div className="admin-dashboard">
        <div className="forbidden-container">
          <h1>403 - Forbidden</h1>
          <p>You do not have permission to access this page.</p>
          <button onClick={onNavigateBack} className="back-button">
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Load initial data based on active tab
  useEffect(() => {
    const loadData = async () => {
      if (!token) {
        logout();
        return;
      }

      setIsLoading(true);
      setError('');

      try {
        if (activeTab === 'config' && !config) {
          const configData = await AdminService.getConfig(token);
          setConfig(configData);
        } else if (activeTab === 'rewards') {
          // Fetch all rewards including inactive ones
          const response = await fetch('/v1/rewards?includeInactive=true', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          if (response.ok) {
            const data = await response.json();
            setRewards(data.rewards || []);
          } else {
            throw new Error('Failed to fetch rewards');
          }
        } else if (activeTab === 'staff') {
          const staffData = await AdminService.getStaff(token);
          setStaff(staffData.users);
        }
      } catch (err) {
        console.error('Failed to load data', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
        if (err instanceof Error && err.message.includes('Forbidden')) {
          logout();
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [activeTab, token, logout, config]);

  const handleRewardsUpdated = async () => {
    if (!token) return;

    try {
      const response = await fetch('/v1/rewards?includeInactive=true', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setRewards(data.rewards || []);
      }
    } catch (err) {
      console.error('Failed to refresh rewards', err);
    }
  };

  const handleStaffUpdated = async () => {
    if (!token) return;

    try {
      const staffData = await AdminService.getStaff(token);
      setStaff(staffData.users);
    } catch (err) {
      console.error('Failed to refresh staff', err);
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div className="header-content">
          <button onClick={onNavigateBack} className="back-button">
            ← Back to Home
          </button>
          <h1>Admin Dashboard</h1>
        </div>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'config' ? 'active' : ''}`}
          onClick={() => setActiveTab('config')}
        >
          Configuration
        </button>
        <button
          className={`tab ${activeTab === 'rewards' ? 'active' : ''}`}
          onClick={() => setActiveTab('rewards')}
        >
          Rewards
        </button>
        <button
          className={`tab ${activeTab === 'staff' ? 'active' : ''}`}
          onClick={() => setActiveTab('staff')}
        >
          Staff
        </button>
      </div>

      <div className="tab-content">
        {isLoading ? (
          <div className="loading">Loading...</div>
        ) : error ? (
          <div className="error-container">
            <p className="error-text">{error}</p>
            <button onClick={() => window.location.reload()} className="retry-button">
              Retry
            </button>
          </div>
        ) : (
          <>
            {activeTab === 'config' && config && (
              <ConfigPanel config={config} onConfigUpdated={setConfig} />
            )}
            {activeTab === 'rewards' && (
              <RewardsAdminTable rewards={rewards} onRewardsUpdated={handleRewardsUpdated} />
            )}
            {activeTab === 'staff' && (
              <StaffAdminTable staff={staff} onStaffUpdated={handleStaffUpdated} />
            )}
          </>
        )}
      </div>
    </div>
  );
};

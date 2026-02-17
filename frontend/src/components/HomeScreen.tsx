import { useAuth } from '../hooks/useAuth';
import './HomeScreen.css';

interface HomeScreenProps {
  onNavigate: (page: string) => void;
}

export const HomeScreen = ({ onNavigate }: HomeScreenProps) => {
  const { user, logout } = useAuth();

  return (
    <div className="home-container">
      <div className="home-header">
        <h1 className="home-title">Bakery Loyalty System</h1>
        <button onClick={logout} className="logout-button">
          Logout
        </button>
      </div>

      <div className="welcome-card">
        <h2 className="welcome-message">Welcome, {user?.name}!</h2>
        <div className="user-info">
          <div className="info-item">
            <span className="info-label">Role:</span>
            <span className="info-value">{user?.role}</span>
          </div>
          <div className="info-item">
            <span className="info-label">User ID:</span>
            <span className="info-value">{user?.id}</span>
          </div>
        </div>
        
        <div className="actions-section">
          <button 
            onClick={() => onNavigate('customer-lookup')} 
            className="action-button"
          >
            Customer Lookup
          </button>
          {user?.role === 'admin' && (
            <button 
              onClick={() => onNavigate('admin')} 
              className="action-button admin-button"
            >
              Admin Panel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

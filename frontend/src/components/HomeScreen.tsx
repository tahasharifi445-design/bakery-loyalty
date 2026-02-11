import { useAuth } from '../hooks/useAuth';
import './HomeScreen.css';

export const HomeScreen = () => {
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
        <p className="info-text">
          You are successfully authenticated! The authentication shell is working correctly.
        </p>
      </div>
    </div>
  );
};

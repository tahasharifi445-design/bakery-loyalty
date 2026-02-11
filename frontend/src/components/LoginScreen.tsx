import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import './LoginScreen.css';

export const LoginScreen = () => {
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(name, pin);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePinInput = (value: string) => {
    // Only allow digits and limit to 10 characters
    const filtered = value.replace(/\D/g, '').slice(0, 10);
    setPin(filtered);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Bakery Loyalty</h1>
        <h2 className="login-subtitle">Staff Login</h2>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
              disabled={isLoading}
              className="input-field"
            />
          </div>

          <div className="form-group">
            <label htmlFor="pin">PIN</label>
            <input
              id="pin"
              type="password"
              value={pin}
              onChange={(e) => handlePinInput(e.target.value)}
              placeholder="Enter your PIN (4-10 digits)"
              required
              pattern="\d{4,10}"
              disabled={isLoading}
              className="input-field"
              inputMode="numeric"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button 
            type="submit" 
            disabled={isLoading || !name || pin.length < 4}
            className="login-button"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

import { useAuth } from './hooks/useAuth';
import { LoginScreen } from './components/LoginScreen';
import { HomeScreen } from './components/HomeScreen';

function App() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        fontSize: '1.5rem',
        color: '#666'
      }}>
        Loading...
      </div>
    );
  }

  return user ? <HomeScreen /> : <LoginScreen />;
}

export default App

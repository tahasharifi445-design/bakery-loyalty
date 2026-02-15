import { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { LoginScreen } from './components/LoginScreen';
import { HomeScreen } from './components/HomeScreen';
import { CustomerLookupPage } from './pages/CustomerLookupPage';

type Page = 'home' | 'customer-lookup';

function App() {
  const { user, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('home');

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

  if (!user) {
    return <LoginScreen />;
  }

  // Render the current page for authenticated users
  switch (currentPage) {
    case 'customer-lookup':
      return <CustomerLookupPage onNavigateBack={() => setCurrentPage('home')} />;
    case 'home':
    default:
      return <HomeScreen onNavigate={(page) => setCurrentPage(page as Page)} />;
  }
}

export default App

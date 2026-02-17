import { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { LoginScreen } from './components/LoginScreen';
import { HomeScreen } from './components/HomeScreen';
import { CustomerLookupPage } from './pages/CustomerLookupPage';
import { PurchasePage } from './pages/PurchasePage';
import { RedemptionPage } from './pages/RedemptionPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import type { Customer } from './types/customer';

type Page = 'home' | 'customer-lookup' | 'purchase' | 'redemption' | 'admin';

function App() {
  const { user, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const handleNavigateToPurchase = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCurrentPage('purchase');
  };

  const handleNavigateToRedemption = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCurrentPage('redemption');
  };

  const handleNavigateBack = () => {
    setCurrentPage('home');
    setSelectedCustomer(null);
  };

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
    case 'admin':
      return (
        <AdminDashboardPage 
          onNavigateBack={handleNavigateBack}
        />
      );
    case 'purchase':
      return (
        <PurchasePage 
          selectedCustomer={selectedCustomer}
          onNavigateBack={() => setCurrentPage('customer-lookup')}
          onNavigateToDashboard={handleNavigateBack}
        />
      );
    case 'redemption':
      return (
        <RedemptionPage 
          selectedCustomer={selectedCustomer}
          onNavigateBack={() => setCurrentPage('customer-lookup')}
          onNavigateToDashboard={handleNavigateBack}
        />
      );
    case 'customer-lookup':
      return (
        <CustomerLookupPage 
          onNavigateBack={handleNavigateBack}
          onNavigateToPurchase={handleNavigateToPurchase}
          onNavigateToRedemption={handleNavigateToRedemption}
        />
      );
    case 'home':
    default:
      return <HomeScreen onNavigate={(page) => setCurrentPage(page as Page)} />;
  }
}

export default App

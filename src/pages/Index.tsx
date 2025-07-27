import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { Navbar } from '@/components/layout/Navbar';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { AdminPanel } from '@/components/admin/AdminPanel';

const Index = () => {
  const { user, isLoading } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading Excel Analytics Platform...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return isLoginMode ? (
      <LoginForm onToggleMode={() => setIsLoginMode(false)} />
    ) : (
      <RegisterForm onToggleMode={() => setIsLoginMode(true)} />
    );
  }

  return (
    <>
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
      {activeTab === 'dashboard' ? <Dashboard /> : <AdminPanel />}
    </>
  );
};

export default Index;

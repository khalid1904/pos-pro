import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import POS from './pages/POS';
import Products from './pages/Products';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Dashboard from './pages/Dashboard';
import Onboarding from './components/Onboarding';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import { useUIStore } from './store/uiStore';
import { useAuthStore } from './store/authStore';
import { supabase } from './lib/supabase';
import { Loader2 } from 'lucide-react';

function App() {
  const { isOnboarded, hasVisited } = useUIStore();
  const { session, setSession, isLoading } = useAuthStore();

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [setSession]);

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  if (!hasVisited) {
    return <Landing />;
  }

  if (!session) {
    return <Auth />;
  }

  if (!isOnboarded) {
    return <Onboarding />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="pos" element={<POS />} />
          <Route path="products" element={<Products />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

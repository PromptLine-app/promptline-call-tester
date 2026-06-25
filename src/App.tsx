import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { getSession, signOut, type AppUser } from './auth';
import LoginPage from './pages/LoginPage';
import CallPage from './pages/CallPage';
import TeamPage from './pages/TeamPage';
import Layout from './components/Layout';
import './index.css';

function RequireAuth({ children, user }: { children: React.ReactNode; user: AppUser | null }) {
  const location = useLocation();
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}

export default function App() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const session = getSession();
    setUser(session);
    setInitializing(false);
  }, []);

  const handleSignIn = (u: AppUser) => setUser(u);
  const handleSignOut = () => {
    signOut();
    setUser(null);
  };

  if (initializing) return null;

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage onSignIn={handleSignIn} />} />
      <Route
        path="/"
        element={
          <RequireAuth user={user}>
            <Layout user={user!} onSignOut={handleSignOut} />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="/call" replace />} />
        <Route path="call" element={<CallPage />} />
        <Route path="team" element={<TeamPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

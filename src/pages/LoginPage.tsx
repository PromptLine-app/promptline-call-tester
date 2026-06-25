import { useState } from 'react';
import { type AppUser, signIn } from '../auth';
import '../index.css';

interface LoginPageProps {
  onSignIn: (user: AppUser) => void;
}

export default function LoginPage({ onSignIn }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setError(null);

    // Simulate network delay
    setTimeout(() => {
      const user = signIn(email, password);
      if (user) {
        onSignIn(user);
      } else {
        setError('Invalid email or password.');
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <img src="/logo.png" alt="Calling App" className="login-card__logo" />
        <h1>Calling App</h1>
        <p className="login-card__subtitle">Sign in with your PromptLine team account</p>

        <form className="login-card__form" onSubmit={handleSubmit}>
          {error && <div className="login-card__error">{error}</div>}

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="team@promptline.com"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn--primary"
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button type="button" className="btn btn--ghost btn--sm">
              Forgot password?
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

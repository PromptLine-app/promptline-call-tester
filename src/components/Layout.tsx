import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { PhoneCall, Users, LogOut, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import type { AppUser } from '../auth';

interface LayoutProps {
  user: AppUser;
  onSignOut: () => void;
}

export default function Layout({ user, onSignOut }: LayoutProps) {
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSignOut = () => {
    onSignOut();
    navigate('/login');
  };

  return (
    <div className="ca-app-layout">
      {/* Sidebar */}
      <aside className="ca-sidebar">
        <div className="ca-sidebar__brand">
          <img src="/logo.png" alt="PromptLine" className="ca-sidebar__logo" />
          <div>
            <div className="ca-sidebar__app-name">PromptLine</div>
            <div className="ca-sidebar__app-sub">Calling App</div>
          </div>
        </div>

        <nav className="ca-sidebar__nav">
          <NavLink
            to="/call"
            className={({ isActive }) => `ca-nav-item ${isActive ? 'ca-nav-item--active' : ''}`}
          >
            <PhoneCall size={18} />
            <span>Call</span>
          </NavLink>
          <NavLink
            to="/team"
            className={({ isActive }) => `ca-nav-item ${isActive ? 'ca-nav-item--active' : ''}`}
          >
            <Users size={18} />
            <span>Team</span>
          </NavLink>
        </nav>
      </aside>

      {/* Main */}
      <div className="ca-main">
        {/* Top Nav */}
        <header className="ca-topnav">
          <div />
          <div className="ca-topnav__right">
            <div className="ca-user-menu">
              <button
                className="ca-user-btn"
                onClick={() => setShowUserMenu((v) => !v)}
              >
                <div className="ca-user-avatar">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="ca-user-info">
                  <span className="ca-user-name">{user.name}</span>
                </div>
                <ChevronDown size={14} className={`ca-chevron ${showUserMenu ? 'ca-chevron--open' : ''}`} />
              </button>

              {showUserMenu && (
                <div className="ca-user-dropdown">
                  <div className="ca-user-dropdown__header">
                    <div className="ca-user-dropdown__name">{user.name}</div>
                    <div className="ca-user-dropdown__email">{user.email}</div>
                  </div>
                  <div className="ca-user-dropdown__divider" />
                  <button className="ca-user-dropdown__item ca-user-dropdown__item--danger" onClick={handleSignOut}>
                    <LogOut size={14} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="ca-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

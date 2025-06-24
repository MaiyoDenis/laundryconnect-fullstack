import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { useAuth } from '../../hooks/useAuth';
import './Navbar.css';

const Navbar = ({ onMenuToggle, sidebarOpen }) => {
  const { user, isAuthenticated } = useAuthStore();
  const { logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div className="navbar-left">
          {isAuthenticated && (
            <button 
              className="menu-toggle"
              onClick={onMenuToggle}
            >
              <span className={`hamburger ${sidebarOpen ? 'open' : ''}`}>
                <span></span>
                <span></span>
                <span></span>
              </span>
            </button>
          )}
          
          <Link to="/" className="navbar-brand">
            <span className="brand-icon">🧺</span>
            <span className="brand-text">LaundryConnect Kenya</span>
          </Link>
        </div>

        <div className="navbar-right">
          {isAuthenticated ? (
            <div className="user-menu">
              <button 
                className="user-button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div className="user-avatar">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
                <div className="user-info">
                  <span className="user-name">{user?.username}</span>
                  <span className="user-role">{user?.role}</span>
                </div>
                <svg className="dropdown-arrow" width="16" height="16" viewBox="0 0 16 16">
                  <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" fill="none"/>
                </svg>
              </button>

              {dropdownOpen && (
                <div className="dropdown-menu">
                  <Link 
                    to={`/${user?.role}/profile`}
                    className="dropdown-item"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16">
                      <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47z" fill="currentColor"/>
                    </svg>
                    Profile
                  </Link>
                  <button 
                    className="dropdown-item"
                    onClick={handleLogout}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16">
                      <path d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z" fill="currentColor"/>
                      <path d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z" fill="currentColor"/>
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="btn btn-secondary">Login</Link>
              <Link to="/register" className="btn btn-primary">Register</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

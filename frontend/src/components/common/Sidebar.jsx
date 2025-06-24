import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ userType, isOpen, onClose }) => {
  const location = useLocation();

  const menuItems = {
    customer: [
      { path: '/customer/dashboard', label: 'Dashboard', icon: '📊' },
      { path: '/customer/place-order', label: 'Place Order', icon: '➕' },
      { path: '/customer/orders', label: 'My Orders', icon: '📋' },
      { path: '/customer/profile', label: 'Profile', icon: '👤' },
    ],
    staff: [
      { path: '/staff/dashboard', label: 'Dashboard', icon: '📊' },
      { path: '/staff/orders', label: 'All Orders', icon: '📦' },
      { path: '/staff/customers', label: 'Customers', icon: '👥' },
    ],
    admin: [
      { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
      { path: '/admin/orders', label: 'Orders', icon: '📦' },
      { path: '/admin/services', label: 'Services', icon: '⚙️' },
      { path: '/admin/reports', label: 'Reports', icon: '📈' },
      { path: '/admin/users', label: 'Users', icon: '👥' },
    ],
  };

  const items = menuItems[userType] || [];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}
      
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>{userType?.charAt(0).toUpperCase() + userType?.slice(1)} Portal</h3>
        </div>
        
        <nav className="sidebar-nav">
          {items.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={onClose}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
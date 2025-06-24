import React from 'react';
import { Link } from 'react-router-dom';
import { useOrders } from '../../hooks/useOrders';
import useAuthStore from '../../store/authStore';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { ORDER_STATUS, STATUS_LABELS, STATUS_COLORS } from '../../constants';
import './CustomerPages.css';

const CustomerDashboard = () => {
  const { user } = useAuthStore();
  const { orders, isLoading } = useOrders();

  // Calculate stats
  const stats = {
    total: orders.length,
    active: orders.filter(order => !['delivered', 'cancelled'].includes(order.status)).length,
    completed: orders.filter(order => order.status === 'delivered').length,
    totalSpent: orders
      .filter(order => order.status === 'delivered')
      .reduce((sum, order) => sum + (order.final_price || order.total_price || 0), 0)
  };

  const recentOrders = orders.slice(0, 5);

  if (isLoading) {
    return (
      <div className="loading-container">
        <LoadingSpinner text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="customer-dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, {user?.customer?.name || user?.username}! 👋</h1>
        <p>Manage your laundry orders and track their progress</p>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <Link to="/customer/place-order" className="action-card primary">
          <div className="action-icon">➕</div>
          <div className="action-content">
            <h3>Place New Order</h3>
            <p>Schedule a pickup today</p>
          </div>
        </Link>
        <Link to="/customer/orders" className="action-card">
          <div className="action-icon">📋</div>
          <div className="action-content">
            <h3>View All Orders</h3>
            <p>Track your orders</p>
          </div>
        </Link>
        <Link to="/customer/profile" className="action-card">
          <div className="action-icon">👤</div>
          <div className="action-content">
            <h3>Update Profile</h3>
            <p>Manage your information</p>
          </div>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total Orders</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔄</div>
          <div className="stat-content">
            <div className="stat-number">{stats.active}</div>
            <div className="stat-label">Active Orders</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-number">{stats.completed}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-number">KSH {stats.totalSpent.toLocaleString()}</div>
            <div className="stat-label">Total Spent</div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="recent-orders">
        <div className="section-header">
          <h2>Recent Orders</h2>
          <Link to="/customer/orders" className="view-all-link">
            View All →
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🧺</div>
            <h3>No orders yet</h3>
            <p>Ready to place your first order?</p>
            <Link to="/customer/place-order" className="btn btn-primary">
              Place Your First Order
            </Link>
          </div>
        ) : (
          <div className="orders-list">
            {recentOrders.map(order => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div className="order-info">
                    <h4>Order #{order.order_number}</h4>
                    <span className={`badge badge-${STATUS_COLORS[order.status]}`}>
                      {STATUS_LABELS[order.status]}
                    </span>
                  </div>
                  <div className="order-price">
                    KSH {(order.final_price || order.total_price || 0).toLocaleString()}
                  </div>
                </div>
                <div className="order-details">
                  <div className="order-service">
                    <strong>{order.service?.name}</strong>
                    <span>• {order.actual_weight || order.estimated_weight} kg</span>
                  </div>
                  <div className="order-date">
                    {new Date(order.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="order-actions">
                  <Link 
                    to={`/customer/orders/${order.id}`}
                    className="btn btn-secondary btn-small"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Service Information */}
      <div className="service-info">
        <h2>Our Services</h2>
        <div className="service-grid">
          <div className="service-card">
            <div className="service-icon">🧺</div>
            <h3>Washing & Ironing</h3>
            <p>Complete laundry service with professional washing and ironing</p>
            <div className="service-price">From KSH 200/kg</div>
          </div>
          <div className="service-card">
            <div className="service-icon">⚡</div>
            <h3>Express Service</h3>
            <p>Get your clothes back in 24 hours with our express service</p>
            <div className="service-price">From KSH 300/kg</div>
          </div>
          <div className="service-card">
            <div className="service-icon">💎</div>
            <h3>Premium Care</h3>
            <p>Special handling for delicate fabrics and luxury items</p>
            <div className="service-price">From KSH 400/kg</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
import React from 'react';
import { Link } from 'react-router-dom';
import { useOrders } from '../../hooks/useOrders';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { ORDER_STATUS, STATUS_LABELS, STATUS_COLORS } from '../../constants';
import './StaffPages.css';

const StaffDashboard = () => {
  const { data: orders, isLoading } = useOrders();

  if (isLoading) {
    return (
      <div className="loading-container">
        <LoadingSpinner text="Loading dashboard..." />
      </div>
    );
  }

  if (!orders) {
    return (
      <div className="error-state">
        <h2>No orders data available</h2>
        <p>Please try refreshing the page or contact support if the issue persists.</p>
      </div>
    );
  }

  // Calculate dashboard stats
  const stats = {
    total: orders.length,
    pending: orders.filter(order => order.status === ORDER_STATUS.PLACED).length,
    inProgress: orders.filter(order => 
      [ORDER_STATUS.CONFIRMED, ORDER_STATUS.COLLECTED, ORDER_STATUS.WASHING, ORDER_STATUS.IRONING].includes(order.status)
    ).length,
    ready: orders.filter(order => 
      [ORDER_STATUS.READY, ORDER_STATUS.OUT_FOR_DELIVERY].includes(order.status)
    ).length,
    completed: orders.filter(order => order.status === ORDER_STATUS.DELIVERED).length,
    todayRevenue: orders
      .filter(order => {
        const today = new Date().toDateString();
        return new Date(order.created_at).toDateString() === today && order.status === ORDER_STATUS.DELIVERED;
      })
      .reduce((sum, order) => sum + (order.final_price || order.total_price || 0), 0)
  };

  // Recent orders (last 10)
  const recentOrders = orders
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 10);

  // Today's pickups
  const todayPickups = orders.filter(order => {
    const today = new Date().toDateString();
    return new Date(order.pickup_date).toDateString() === today && 
           [ORDER_STATUS.PLACED, ORDER_STATUS.CONFIRMED].includes(order.status);
  });

  if (isLoading) {
    return (
      <div className="loading-container">
        <LoadingSpinner text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="staff-dashboard">
      <div className="dashboard-header">
        <h1>Staff Dashboard 📊</h1>
        <p>Monitor orders, manage pickups, and track business performance</p>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <Link to="/staff/orders?status=placed" className="action-card urgent">
          <div className="action-icon">🔔</div>
          <div className="action-content">
            <h3>{stats.pending} New Orders</h3>
            <p>Require immediate attention</p>
          </div>
        </Link>
        <Link to="/staff/orders" className="action-card">
          <div className="action-icon">📦</div>
          <div className="action-content">
            <h3>Manage Orders</h3>
            <p>Update status & details</p>
          </div>
        </Link>
        <Link to="/staff/customers" className="action-card">
          <div className="action-icon">👥</div>
          <div className="action-content">
            <h3>Customer Management</h3>
            <p>View customer profiles</p>
          </div>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total Orders</div>
          </div>
        </div>
        <div className="stat-card warning">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <div className="stat-number">{stats.pending}</div>
            <div className="stat-label">Pending Orders</div>
          </div>
        </div>
        <div className="stat-card info">
          <div className="stat-icon">🔄</div>
          <div className="stat-content">
            <div className="stat-number">{stats.inProgress}</div>
            <div className="stat-label">In Progress</div>
          </div>
        </div>
        <div className="stat-card success">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-number">{stats.ready}</div>
            <div className="stat-label">Ready/Delivery</div>
          </div>
        </div>
        <div className="stat-card secondary">
          <div className="stat-icon">🏆</div>
          <div className="stat-content">
            <div className="stat-number">{stats.completed}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>
        <div className="stat-card revenue">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-number">KSH {stats.todayRevenue.toLocaleString()}</div>
            <div className="stat-label">Today's Revenue</div>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Today's Pickups */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Today's Pickups 🚚</h2>
            <span className="count-badge">{todayPickups.length}</span>
          </div>
          
          {todayPickups.length === 0 ? (
            <div className="empty-section">
              <p>No pickups scheduled for today</p>
            </div>
          ) : (
            <div className="pickups-list">
              {todayPickups.map(order => (
                <div key={order.id} className="pickup-card">
                  <div className="pickup-info">
                    <h4>Order #{order.order_number}</h4>
                    <p>{order.customer?.name}</p>
                    <span className="pickup-time">
                      {order.pickup_time} • {order.customer?.phone}
                    </span>
                  </div>
                  <div className="pickup-actions">
                    <span className={`badge badge-${STATUS_COLORS[order.status]}`}>
                      {STATUS_LABELS[order.status]}
                    </span>
                    <Link 
                      to={`/staff/orders`}
                      className="btn btn-primary btn-small"
                    >
                      Manage
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Orders 📋</h2>
            <Link to="/staff/orders" className="view-all-link">
              View All →
            </Link>
          </div>
          
          <div className="recent-orders-table">
            <div className="table-header">
              <div>Order #</div>
              <div>Customer</div>
              <div>Service</div>
              <div>Status</div>
              <div>Amount</div>
              <div>Actions</div>
            </div>
            
            {recentOrders.map(order => (
              <div key={order.id} className="table-row">
                <div className="order-number">#{order.order_number}</div>
                <div className="customer-info">
                  <strong>{order.customer?.name}</strong>
                  <span>{order.customer?.phone}</span>
                </div>
                <div className="service-info">
                  {order.service?.name}
                </div>
                <div>
                  <span className={`badge badge-${STATUS_COLORS[order.status]}`}>
                    {STATUS_LABELS[order.status]}
                  </span>
                </div>
                <div className="amount">
                  KSH {(order.final_price || order.total_price || 0).toLocaleString()}
                </div>
                <div className="actions">
                  <Link 
                    to={`/staff/orders`}
                    className="btn btn-secondary btn-small"
                  >
                    Manage
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Status Distribution Chart */}
      <div className="status-chart">
        <h2>Order Status Distribution</h2>
        <div className="chart-bars">
          {Object.entries(STATUS_LABELS).map(([status, label]) => {
            const count = orders.filter(order => order.status === status).length;
            const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
            
            return (
              <div key={status} className="chart-bar">
                <div className="bar-label">{label}</div>
                <div className="bar-container">
                  <div 
                    className={`bar-fill bar-${STATUS_COLORS[status]}`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <div className="bar-count">{count}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
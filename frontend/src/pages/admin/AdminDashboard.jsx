import React from 'react';
import { Link } from 'react-router-dom';
import { useOrders } from '../../hooks/useOrders';
import { useQuery } from '@tanstack/react-query';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { customersAPI } from '../../services/customerService';
import { ORDER_STATUS } from '../../constants';
import './AdminPages.css';

const AdminDashboard = () => {
  const { orders, isLoading: ordersLoading } = useOrders();
  
  const { data: customers = [], isLoading: customersLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customersAPI.getCustomers().then(res => res.data)
  });

  // Calculate comprehensive stats
  const stats = {
    // Orders
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === ORDER_STATUS.PLACED).length,
    completedOrders: orders.filter(o => o.status === ORDER_STATUS.DELIVERED).length,
    cancelledOrders: orders.filter(o => o.status === ORDER_STATUS.CANCELLED).length,
    
    // Revenue
    totalRevenue: orders
      .filter(o => o.status === ORDER_STATUS.DELIVERED)
      .reduce((sum, o) => sum + (o.final_price || o.total_price || 0), 0),
    
    monthlyRevenue: orders
      .filter(o => {
        const orderDate = new Date(o.created_at);
        const now = new Date();
        return orderDate.getMonth() === now.getMonth() && 
               orderDate.getFullYear() === now.getFullYear() &&
               o.status === ORDER_STATUS.DELIVERED;
      })
      .reduce((sum, o) => sum + (o.final_price || o.total_price || 0), 0),
    
    dailyRevenue: orders
      .filter(o => {
        const orderDate = new Date(o.created_at);
        const today = new Date();
        return orderDate.toDateString() === today.toDateString() &&
               o.status === ORDER_STATUS.DELIVERED;
      })
      .reduce((sum, o) => sum + (o.final_price || o.total_price || 0), 0),
    
    // Customers
    totalCustomers: customers.length,
    newCustomersThisMonth: customers.filter(c => {
      const customerDate = new Date(c.created_at);
      const now = new Date();
      return customerDate.getMonth() === now.getMonth() && 
             customerDate.getFullYear() === now.getFullYear();
    }).length,
    
    activeCustomers: customers.filter(c => (c.total_orders || 0) > 0).length,
    
    // Performance
    avgOrderValue: orders.filter(o => o.status === ORDER_STATUS.DELIVERED).length > 0
      ? orders
          .filter(o => o.status === ORDER_STATUS.DELIVERED)
          .reduce((sum, o) => sum + (o.final_price || o.total_price || 0), 0) / 
        orders.filter(o => o.status === ORDER_STATUS.DELIVERED).length
      : 0,
      
    completionRate: orders.length > 0 
      ? (orders.filter(o => o.status === ORDER_STATUS.DELIVERED).length / orders.length) * 100
      : 0
  };

  // Recent activity
  const recentOrders = orders
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 8);

  const recentCustomers = customers
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  // Monthly revenue trend (last 6 months)
  const getMonthlyTrend = () => {
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthOrders = orders.filter(o => {
        const orderDate = new Date(o.created_at);
        return orderDate.getMonth() === date.getMonth() && 
               orderDate.getFullYear() === date.getFullYear() &&
               o.status === ORDER_STATUS.DELIVERED;
      });
      
      const revenue = monthOrders.reduce((sum, o) => sum + (o.final_price || o.total_price || 0), 0);
      
      months.push({
        month: date.toLocaleDateString('default', { month: 'short' }),
        revenue,
        orders: monthOrders.length
      });
    }
    
    return months;
  };

  const monthlyTrend = getMonthlyTrend();

  if (ordersLoading || customersLoading) {
    return (
      <div className="loading-container">
        <LoadingSpinner text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard 👑</h1>
        <p>Complete business overview and management tools</p>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card revenue">
          <div className="metric-icon">💰</div>
          <div className="metric-content">
            <div className="metric-number">KSH {stats.totalRevenue.toLocaleString()}</div>
            <div className="metric-label">Total Revenue</div>
            <div className="metric-change positive">
              +KSH {stats.monthlyRevenue.toLocaleString()} this month
            </div>
          </div>
        </div>
        
        <div className="metric-card orders">
          <div className="metric-icon">📦</div>
          <div className="metric-content">
            <div className="metric-number">{stats.totalOrders}</div>
            <div className="metric-label">Total Orders</div>
            <div className="metric-change">
              {stats.completedOrders} completed, {stats.pendingOrders} pending
            </div>
          </div>
        </div>
        
        <div className="metric-card customers">
          <div className="metric-icon">👥</div>
          <div className="metric-content">
            <div className="metric-number">{stats.totalCustomers}</div>
            <div className="metric-label">Total Customers</div>
            <div className="metric-change positive">
              +{stats.newCustomersThisMonth} this month
            </div>
          </div>
        </div>
        
        <div className="metric-card performance">
          <div className="metric-icon">📈</div>
          <div className="metric-content">
            <div className="metric-number">{stats.completionRate.toFixed(1)}%</div>
            <div className="metric-label">Completion Rate</div>
            <div className="metric-change">
              Avg: KSH {stats.avgOrderValue.toFixed(0)} per order
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-admin">
        <Link to="/admin/orders" className="action-card-admin">
          <div className="action-icon">📦</div>
          <div className="action-content">
            <h3>Manage Orders</h3>
            <p>{stats.pendingOrders} pending orders</p>
          </div>
        </Link>
        
        <Link to="/admin/services" className="action-card-admin">
          <div className="action-icon">⚙️</div>
          <div className="action-content">
            <h3>Manage Services</h3>
            <p>Update pricing & offerings</p>
          </div>
        </Link>
        
        <Link to="/admin/users" className="action-card-admin">
          <div className="action-icon">👤</div>
          <div className="action-content">
            <h3>User Management</h3>
            <p>Staff & customer accounts</p>
          </div>
        </Link>
        
        <Link to="/admin/reports" className="action-card-admin">
          <div className="action-icon">📊</div>
          <div className="action-content">
            <h3>Reports & Analytics</h3>
            <p>Business insights</p>
          </div>
        </Link>
      </div>

      <div className="dashboard-grid">
        {/* Revenue Trend */}
        <div className="dashboard-widget">
          <div className="widget-header">
            <h3>Revenue Trend (6 Months)</h3>
            <span className="widget-subtitle">Monthly performance</span>
          </div>
          <div className="revenue-chart">
            {monthlyTrend.map((month, index) => {
              const maxRevenue = Math.max(...monthlyTrend.map(m => m.revenue));
              const height = maxRevenue > 0 ? (month.revenue / maxRevenue) * 100 : 0;
              
              return (
                <div key={index} className="chart-column">
                  <div className="chart-bar" style={{ height: `${height}%` }}>
                    <div className="bar-value">KSH {month.revenue.toLocaleString()}</div>
                  </div>
                  <div className="chart-label">{month.month}</div>
                  <div className="chart-orders">{month.orders} orders</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="dashboard-widget">
          <div className="widget-header">
            <h3>Recent Orders</h3>
            <Link to="/admin/orders" className="widget-link">View All →</Link>
          </div>
          <div className="recent-list">
            {recentOrders.map(order => (
              <div key={order.id} className="recent-item">
                <div className="recent-info">
                  <strong>#{order.order_number}</strong>
                  <span>{order.customer?.name}</span>
                </div>
                <div className="recent-amount">
                  KSH {(order.final_price || order.total_price || 0).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Customers */}
        <div className="dashboard-widget">
          <div className="widget-header">
            <h3>New Customers</h3>
            <Link to="/staff/customers" className="widget-link">View All →</Link>
          </div>
          <div className="recent-list">
            {recentCustomers.map(customer => (
              <div key={customer.id} className="recent-item">
                <div className="recent-info">
                  <strong>{customer.name}</strong>
                  <span>{new Date(customer.created_at).toLocaleDateString()}</span>
                </div>
                <div className="recent-status">
                  <span className="badge badge-success">New</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Today's Summary */}
        <div className="dashboard-widget">
          <div className="widget-header">
            <h3>Today's Summary</h3>
            <span className="widget-subtitle">{new Date().toLocaleDateString()}</span>
          </div>
          <div className="summary-stats">
            <div className="summary-item">
              <div className="summary-number">{stats.dailyRevenue.toLocaleString()}</div>
              <div className="summary-label">Revenue (KSH)</div>
            </div>
            <div className="summary-item">
              <div className="summary-number">
                {orders.filter(o => {
                  const today = new Date();
                  return new Date(o.created_at).toDateString() === today.toDateString();
                }).length}
              </div>
              <div className="summary-label">New Orders</div>
            </div>
            <div className="summary-item">
              <div className="summary-number">
                {orders.filter(o => {
                  const today = new Date();
                  return new Date(o.pickup_date).toDateString() === today.toDateString() &&
                         [ORDER_STATUS.PLACED, ORDER_STATUS.CONFIRMED].includes(o.status);
                }).length}
              </div>
              <div className="summary-label">Pickups Scheduled</div>
            </div>
            <div className="summary-item">
              <div className="summary-number">
                {orders.filter(o => {
                  const today = new Date();
                  return new Date(o.created_at).toDateString() === today.toDateString() &&
                         o.status === ORDER_STATUS.DELIVERED;
                }).length}
              </div>
              <div className="summary-label">Completed</div>
            </div>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="system-status">
        <h3>System Status</h3>
        <div className="status-grid">
          <div className="status-item">
            <div className="status-indicator online"></div>
            <span>Order Processing</span>
            <span className="status-value">Online</span>
          </div>
          <div className="status-item">
            <div className="status-indicator online"></div>
            <span>Payment System</span>
            <span className="status-value">Active</span>
          </div>
          <div className="status-item">
            <div className="status-indicator online"></div>
            <span>Database</span>
            <span className="status-value">Healthy</span>
          </div>
          <div className="status-item">
            <div className="status-indicator warning"></div>
            <span>Backup System</span>
            <span className="status-value">Pending</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
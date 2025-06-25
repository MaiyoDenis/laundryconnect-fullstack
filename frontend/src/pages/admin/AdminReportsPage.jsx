import React, { useState } from 'react';
import { useOrders } from '../../hooks/useOrders';
import { useQuery } from '@tanstack/react-query';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { customersAPI } from '../../services/customerService';
import { ORDER_STATUS, STATUS_LABELS } from '../../constants';
import './AdminPages.css';

const AdminReportsPage = () => {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [activeTab, setActiveTab] = useState('overview');

  const { orders, isLoading: ordersLoading } = useOrders();
  const { data: customers = [], isLoading: customersLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customersAPI.getCustomers().then(res => res.data)
  });

  // Filter orders by date range
  const filteredOrders = orders.filter(order => {
    const orderDate = new Date(order.created_at);
    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);
    return orderDate >= start && orderDate <= end;
  });

  // Calculate reports data
  const reportsData = {
    // Revenue Reports
    totalRevenue: filteredOrders
      .filter(o => o.status === ORDER_STATUS.DELIVERED)
      .reduce((sum, o) => sum + (o.final_price || o.total_price || 0), 0),
    
    revenueByService: filteredOrders
      .filter(o => o.status === ORDER_STATUS.DELIVERED)
      .reduce((acc, order) => {
        const serviceName = order.service?.name || 'Unknown';
        acc[serviceName] = (acc[serviceName] || 0) + (order.final_price || order.total_price || 0);
        return acc;
      }, {}),
    
    // Order Reports
    ordersByStatus: filteredOrders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {}),
    
    dailyOrders: getDailyOrdersData(filteredOrders),
    
    // Customer Reports
    topCustomers: getTopCustomers(filteredOrders),
    customerGrowth: getCustomerGrowthData(customers),
    
    // Performance Reports
    avgOrderValue: filteredOrders.filter(o => o.status === ORDER_STATUS.DELIVERED).length > 0
      ? filteredOrders
          .filter(o => o.status === ORDER_STATUS.DELIVERED)
          .reduce((sum, o) => sum + (o.final_price || o.total_price || 0), 0) / 
        filteredOrders.filter(o => o.status === ORDER_STATUS.DELIVERED).length
      : 0,
    
    completionRate: filteredOrders.length > 0 
      ? (filteredOrders.filter(o => o.status === ORDER_STATUS.DELIVERED).length / filteredOrders.length) * 100
      : 0,
    
    avgTurnaroundTime: calculateAvgTurnaroundTime(filteredOrders)
  };

  function getDailyOrdersData(orders) {
    const dailyData = {};
    orders.forEach(order => {
      const date = new Date(order.created_at).toISOString().split('T')[0];
      dailyData[date] = (dailyData[date] || 0) + 1;
    });
    
    return Object.entries(dailyData)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .map(([date, count]) => ({ date, count }));
  }

  function getTopCustomers(orders) {
    const customerData = {};
    orders.filter(o => o.status === ORDER_STATUS.DELIVERED).forEach(order => {
      const customerId = order.customer?.id;
      const customerName = order.customer?.name || 'Unknown';
      if (customerId) {
        if (!customerData[customerId]) {
          customerData[customerId] = {
            name: customerName,
            orders: 0,
            revenue: 0
          };
        }
        customerData[customerId].orders += 1;
        customerData[customerId].revenue += order.final_price || order.total_price || 0;
      }
    });
    
    return Object.values(customerData)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }

  function getCustomerGrowthData(customers) {
    const monthlyGrowth = {};
    customers.forEach(customer => {
      const month = new Date(customer.created_at).toISOString().slice(0, 7); // YYYY-MM
      monthlyGrowth[month] = (monthlyGrowth[month] || 0) + 1;
    });
    
    return Object.entries(monthlyGrowth)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .map(([month, count]) => ({ month, count }));
  }

  function calculateAvgTurnaroundTime(orders) {
    const completedOrders = orders.filter(o => 
      o.status === ORDER_STATUS.DELIVERED && o.pickup_date && o.delivery_date
    );
    
    if (completedOrders.length === 0) return 0;
    
    const totalHours = completedOrders.reduce((sum, order) => {
      const pickup = new Date(order.pickup_date);
      const delivery = new Date(order.delivery_date);
      const hours = (delivery - pickup) / (1000 * 60 * 60);
      return sum + hours;
    }, 0);
    
    return totalHours / completedOrders.length;
  }

  if (ordersLoading || customersLoading) {
    return (
      <div className="loading-container">
        <LoadingSpinner text="Loading reports..." />
      </div>
    );
  }

  return (
    <div className="admin-reports-page">
      <div className="page-header">
        <h1>Reports & Analytics 📊</h1>
        <p>Business insights and performance metrics</p>
      </div>

      {/* Date Range Filter */}
      <div className="date-filter">
        <div className="filter-group">
          <label>Start Date:</label>
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
            className="form-input"
          />
        </div>
        <div className="filter-group">
          <label>End Date:</label>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
            className="form-input"
          />
        </div>
      </div>

      {/* Report Tabs */}
      <div className="report-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab ${activeTab === 'revenue' ? 'active' : ''}`}
          onClick={() => setActiveTab('revenue')}
        >
          Revenue
        </button>
        <button 
          className={`tab ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          Orders
        </button>
        <button 
          className={`tab ${activeTab === 'customers' ? 'active' : ''}`}
          onClick={() => setActiveTab('customers')}
        >
          Customers
        </button>
      </div>

      {/* Tab Content */}
      <div className="report-content">
        {activeTab === 'overview' && (
          <OverviewReport data={reportsData} filteredOrders={filteredOrders} />
        )}
        {activeTab === 'revenue' && (
          <RevenueReport data={reportsData} />
        )}
        {activeTab === 'orders' && (
          <OrdersReport data={reportsData} />
        )}
        {activeTab === 'customers' && (
          <CustomersReport data={reportsData} />
        )}
      </div>
    </div>
  );
};

// Overview Report Component
const OverviewReport = ({ data, filteredOrders }) => (
  <div className="overview-report">
    <div className="overview-metrics">
      <div className="metric-card large">
        <div className="metric-icon">💰</div>
        <div className="metric-content">
          <div className="metric-number">KSH {data.totalRevenue.toLocaleString()}</div>
          <div className="metric-label">Total Revenue</div>
        </div>
      </div>
      <div className="metric-card large">
        <div className="metric-icon">📦</div>
        <div className="metric-content">
          <div className="metric-number">{filteredOrders.length}</div>
          <div className="metric-label">Total Orders</div>
        </div>
      </div>
      <div className="metric-card large">
        <div className="metric-icon">📊</div>
        <div className="metric-content">
          <div className="metric-number">KSH {data.avgOrderValue.toFixed(0)}</div>
          <div className="metric-label">Avg Order Value</div>
        </div>
      </div>
      <div className="metric-card large">
        <div className="metric-icon">✅</div>
        <div className="metric-content">
          <div className="metric-number">{data.completionRate.toFixed(1)}%</div>
          <div className="metric-label">Completion Rate</div>
        </div>
      </div>
    </div>

    <div className="overview-charts">
      <div className="chart-widget">
        <h3>Daily Orders Trend</h3>
        <div className="line-chart">
          {data.dailyOrders.slice(-14).map((day, index) => (
            <div key={index} className="chart-point">
              <div className="point-bar" style={{ height: `${(day.count / Math.max(...data.dailyOrders.map(d => d.count))) * 100}%` }}></div>
              <div className="point-label">{new Date(day.date).getDate()}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="chart-widget">
        <h3>Order Status Distribution</h3>
        <div className="pie-chart-legend">
          {Object.entries(data.ordersByStatus).map(([status, count]) => (
            <div key={status} className="legend-item">
              <div className={`legend-color status-${status}`}></div>
              <span>{STATUS_LABELS[status]}: {count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Revenue Report Component
const RevenueReport = ({ data }) => (
  <div className="revenue-report">
    <div className="revenue-summary">
      <h3>Revenue Summary</h3>
      <div className="summary-cards">
        <div className="summary-card">
          <div className="summary-amount">KSH {data.totalRevenue.toLocaleString()}</div>
          <div className="summary-label">Total Revenue</div>
        </div>
        <div className="summary-card">
          <div className="summary-amount">KSH {data.avgOrderValue.toFixed(0)}</div>
          <div className="summary-label">Average Order</div>
        </div>
      </div>
    </div>

    <div className="revenue-by-service">
      <h3>Revenue by Service</h3>
      <div className="service-revenue-list">
        {Object.entries(data.revenueByService)
          .sort(([,a], [,b]) => b - a)
          .map(([service, revenue]) => (
            <div key={service} className="service-revenue-item">
              <div className="service-name">{service}</div>
              <div className="service-bar">
                <div 
                  className="bar-fill"
                  style={{ 
                    width: `${(revenue / Math.max(...Object.values(data.revenueByService))) * 100}%` 
                  }}
                ></div>
              </div>
              <div className="service-amount">KSH {revenue.toLocaleString()}</div>
            </div>
          ))}
      </div>
    </div>
  </div>
);

// Orders Report Component
const OrdersReport = ({ data }) => (
  <div className="orders-report">
    <div className="orders-metrics">
      <div className="metric-grid">
        {Object.entries(data.ordersByStatus).map(([status, count]) => (
          <div key={status} className="order-metric">
            <div className="metric-number">{count}</div>
            <div className="metric-label">{STATUS_LABELS[status]}</div>
          </div>
        ))}
      </div>
    </div>

    <div className="performance-metrics">
      <h3>Performance Metrics</h3>
      <div className="performance-grid">
        <div className="performance-item">
          <div className="performance-label">Average Turnaround Time</div>
          <div className="performance-value">{data.avgTurnaroundTime.toFixed(1)} hours</div>
        </div>
        <div className="performance-item">
          <div className="performance-label">Completion Rate</div>
          <div className="performance-value">{data.completionRate.toFixed(1)}%</div>
        </div>
      </div>
    </div>
  </div>
);

// Customers Report Component
const CustomersReport = ({ data }) => (
  <div className="customers-report">
    <div className="top-customers">
      <h3>Top Customers by Revenue</h3>
      <div className="customers-table">
        <div className="table-header">
          <div>Customer</div>
          <div>Orders</div>
          <div>Revenue</div>
        </div>
        {data.topCustomers.map((customer, index) => (
          <div key={index} className="table-row">
            <div className="customer-name">{customer.name}</div>
            <div className="customer-orders">{customer.orders}</div>
            <div className="customer-revenue">KSH {customer.revenue.toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>

    <div className="customer-growth">
      <h3>Customer Growth</h3>
      <div className="growth-chart">
        {data.customerGrowth.slice(-12).map((month, index) => (
          <div key={index} className="growth-bar">
            <div 
              className="bar-fill"
              style={{ 
                height: `${(month.count / Math.max(...data.customerGrowth.map(m => m.count))) * 100}%` 
              }}
            ></div>
            <div className="bar-label">{month.month.slice(-2)}</div>
            <div className="bar-value">{month.count}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default AdminReportsPage;
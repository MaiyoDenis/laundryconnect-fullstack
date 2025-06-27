import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useOrders } from '../../hooks/useOrders';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { ORDER_STATUS, STATUS_LABELS, STATUS_COLORS, SERVICE_TYPES } from '../../constants';
import './CustomerPages.css';

const MyOrdersPage = () => {
  const [filters, setFilters] = useState({
    status: '',
    dateFrom: '',
    dateTo: '',
    search: ''
  });

  const { data: orders = [], isLoading } = useOrders(filters);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      dateFrom: '',
      dateTo: '',
      search: ''
    });
  };

  const getOrderProgress = (status) => {
    const statusOrder = [
      ORDER_STATUS.PLACED,
      ORDER_STATUS.CONFIRMED,
      ORDER_STATUS.COLLECTED,
      ORDER_STATUS.WASHING,
      ORDER_STATUS.IRONING,
      ORDER_STATUS.READY,
      ORDER_STATUS.OUT_FOR_DELIVERY,
      ORDER_STATUS.DELIVERED
    ];
    
    const currentIndex = statusOrder.indexOf(status);
    const progress = currentIndex >= 0 ? ((currentIndex + 1) / statusOrder.length) * 100 : 0;
    return Math.min(progress, 100);
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <LoadingSpinner text="Loading your orders..." />
      </div>
    );
  }

  return (
    <div className="my-orders-page">
      <div className="page-header">
        <h1>My Orders</h1>
        <p>Track and manage your laundry orders</p>
        <Link to="/customer/place-order" className="btn btn-primary">
          Place New Order
        </Link>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-grid">
          <div className="filter-group">
            <label>Search Orders</label>
            <input
              type="text"
              placeholder="Search by order number..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="form-input"
            />
          </div>
          
          <div className="filter-group">
            <label>Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="form-select"
            >
              <option value="">All Statuses</option>
              {Object.entries(STATUS_LABELS).map(([status, label]) => (
                <option key={status} value={status}>{label}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>From Date</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="form-input"
            />
          </div>

          <div className="filter-group">
            <label>To Date</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              className="form-input"
            />
          </div>

          <div className="filter-actions">
            <button onClick={clearFilters} className="btn btn-secondary">
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🧺</div>
          <h3>No orders found</h3>
          <p>
            {Object.values(filters).some(f => f) 
              ? 'Try adjusting your filters or search terms'
              : 'Ready to place your first order?'
            }
          </p>
          <Link to="/customer/place-order" className="btn btn-primary">
            Place Your First Order
          </Link>
        </div>
      ) : (
        <div className="orders-grid">
          {orders.map(order => (
            <div key={order.id} className="order-card-detailed">
              <div className="order-card-header">
                <div className="order-number">
                  <h3>Order #{order.order_number}</h3>
                  <span className="order-date">
                    {new Date(order.created_at).toLocaleDateString()}
                  </span>
                </div>
                <span className={`badge badge-${STATUS_COLORS[order.status]}`}>
                  {STATUS_LABELS[order.status]}
                </span>
              </div>

              <div className="order-content">
                <div className="service-info">
                  <h4>{order.service?.name}</h4>
                  <div className="service-details">
                    <span className="service-type">
                      {order.service?.service_type?.toUpperCase()} Service
                    </span>
                    <span className="weight">
                      {order.actual_weight || order.estimated_weight} kg
                      {!order.actual_weight && ' (estimated)'}
                    </span>
                  </div>
                </div>

                <div className="price-info">
                  <div className="price">
                    KSH {(order.final_price || order.total_price || 0).toLocaleString()}
                  </div>
                  {order.final_price && order.final_price !== order.total_price && (
                    <div className="price-change">
                      {order.final_price > order.total_price ? '↗️' : '↘️'}
                      Updated from KSH {order.total_price.toLocaleString()}
                    </div>
                  )}
                </div>

                {/* Progress Bar */}
                {order.status !== ORDER_STATUS.CANCELLED && (
                  <div className="progress-section">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${getOrderProgress(order.status)}%` }}
                      ></div>
                    </div>
                    <div className="progress-text">
                      {STATUS_LABELS[order.status]}
                    </div>
                  </div>
                )}

                {order.pickup_date && (
                  <div className="schedule-info">
                    <span>📅 Pickup: {new Date(order.pickup_date).toLocaleDateString()}</span>
                    <span>🕐 {order.pickup_time}</span>
                  </div>
                )}

                {order.special_instructions && (
                  <div className="special-instructions">
                    <strong>Instructions:</strong> {order.special_instructions}
                  </div>
                )}
              </div>

              <div className="order-actions">
                <Link 
                  to={`/customer/orders/${order.id}`}
                  className="btn btn-primary btn-small"
                >
                  View Details
                </Link>
                
                {order.status === ORDER_STATUS.DELIVERED && !order.reviewed && (
                  <Link
                    to={`/customer/orders/${order.id}?tab=review`}
                    className="btn btn-secondary btn-small"
                  >
                    Leave Review
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrdersPage;
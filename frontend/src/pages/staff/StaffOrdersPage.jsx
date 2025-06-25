import React, { useState } from 'react';
import { useOrders } from '../../hooks/useOrders';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { ORDER_STATUS, STATUS_LABELS, STATUS_COLORS, PICKUP_TIME_LABELS } from '../../constants';
import toast from 'react-hot-toast';
import './StaffPages.css';

const StaffOrdersPage = () => {
  const [filters, setFilters] = useState({
    status: '',
    dateFrom: '',
    dateTo: '',
    search: ''
  });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateType, setUpdateType] = useState(''); // 'status' | 'weight'

  const { orders, isLoading, updateStatus, updateWeight, isUpdatingStatus, isUpdatingWeight } = useOrders(filters);

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

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await updateStatus({ orderId, status: newStatus });
      setShowUpdateModal(false);
      setSelectedOrder(null);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleUpdateWeight = async (orderId, actualWeight) => {
    try {
      await updateWeight({ orderId, weight: actualWeight });
      setShowUpdateModal(false);
      setSelectedOrder(null);
      toast.success('Weight and pricing updated successfully!');
    } catch (error) {
      toast.error('Failed to update weight');
    }
  };

  const openUpdateModal = (order, type) => {
    setSelectedOrder(order);
    setUpdateType(type);
    setShowUpdateModal(true);
  };

  const getNextStatus = (currentStatus) => {
    const statusFlow = [
      ORDER_STATUS.PLACED,
      ORDER_STATUS.CONFIRMED,
      ORDER_STATUS.COLLECTED,
      ORDER_STATUS.WASHING,
      ORDER_STATUS.IRONING,
      ORDER_STATUS.READY,
      ORDER_STATUS.OUT_FOR_DELIVERY,
      ORDER_STATUS.DELIVERED
    ];
    
    const currentIndex = statusFlow.indexOf(currentStatus);
    return currentIndex >= 0 && currentIndex < statusFlow.length - 1 
      ? statusFlow[currentIndex + 1] 
      : null;
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <LoadingSpinner text="Loading orders..." />
      </div>
    );
  }

  return (
    <div className="staff-orders-page">
      <div className="page-header">
        <h1>Order Management 📦</h1>
        <p>Manage all customer orders and update their status</p>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-grid">
          <div className="filter-group">
            <label>Search Orders</label>
            <input
              type="text"
              placeholder="Search by order number, customer name..."
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

      {/* Orders Table */}
      <div className="orders-table-container">
        {orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>No orders found</h3>
            <p>No orders match your current filters</p>
          </div>
        ) : (
          <div className="orders-table">
            <div className="table-header">
              <div>Order Details</div>
              <div>Customer</div>
              <div>Service & Weight</div>
              <div>Schedule</div>
              <div>Status</div>
              <div>Amount</div>
              <div>Actions</div>
            </div>
            
            {orders.map(order => (
              <div key={order.id} className="table-row">
                <div className="order-details">
                  <strong>#{order.order_number}</strong>
                  <span className="order-date">
                    {new Date(order.created_at).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="customer-details">
                  <strong>{order.customer?.name}</strong>
                  <span>{order.customer?.phone}</span>
                  {order.customer?.address && (
                    <span className="address">{order.customer.address}</span>
                  )}
                </div>
                
                <div className="service-details">
                  <strong>{order.service?.name}</strong>
                  <span>
                    {order.actual_weight || order.estimated_weight} kg
                    {!order.actual_weight && ' (est.)'}
                  </span>
                  <span className="service-type">
                    {order.service?.service_type?.toUpperCase()}
                  </span>
                </div>
                
                <div className="schedule-details">
                  <span>📅 {new Date(order.pickup_date).toLocaleDateString()}</span>
                  <span>🕐 {PICKUP_TIME_LABELS[order.pickup_time]}</span>
                </div>
                
                <div className="status-cell">
                  <span className={`badge badge-${STATUS_COLORS[order.status]}`}>
                    {STATUS_LABELS[order.status]}
                  </span>
                </div>
                
                <div className="amount-cell">
                  <strong>KSH {(order.final_price || order.total_price || 0).toLocaleString()}</strong>
                  {order.final_price && order.final_price !== order.total_price && (
                    <span className="price-updated">Updated</span>
                  )}
                </div>
                
                <div className="actions-cell">
                  <div className="action-buttons">
                    {getNextStatus(order.status) && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, getNextStatus(order.status))}
                        className="btn btn-primary btn-small"
                        disabled={isUpdatingStatus}
                      >
                        {isUpdatingStatus ? '...' : `→ ${STATUS_LABELS[getNextStatus(order.status)]}`}
                      </button>
                    )}
                    
                    {!order.actual_weight && order.status === ORDER_STATUS.COLLECTED && (
                      <button
                        onClick={() => openUpdateModal(order, 'weight')}
                        className="btn btn-warning btn-small"
                      >
                        ⚖️ Weight
                      </button>
                    )}
                    
                    <button
                      onClick={() => openUpdateModal(order, 'status')}
                      className="btn btn-secondary btn-small"
                    >
                      📝 Update
                    </button>
                  </div>
                  
                  {order.special_instructions && (
                    <div className="special-note">
                      📝 Has special instructions
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Update Modal */}
      {showUpdateModal && selectedOrder && (
        <UpdateModal
          order={selectedOrder}
          type={updateType}
          onUpdateStatus={handleUpdateStatus}
          onUpdateWeight={handleUpdateWeight}
          onClose={() => {
            setShowUpdateModal(false);
            setSelectedOrder(null);
          }}
          isUpdating={isUpdatingStatus || isUpdatingWeight}
        />
      )}
    </div>
  );
};

// Update Modal Component
const UpdateModal = ({ order, type, onUpdateStatus, onUpdateWeight, onClose, isUpdating }) => {
  const [selectedStatus, setSelectedStatus] = useState(order.status);
  const [actualWeight, setActualWeight] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (type === 'status') {
      onUpdateStatus(order.id, selectedStatus);
    } else if (type === 'weight') {
      const weight = parseFloat(actualWeight);
      if (weight > 0) {
        onUpdateWeight(order.id, weight);
      } else {
        toast.error('Please enter a valid weight');
      }
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>
            {type === 'status' ? 'Update Order Status' : 'Update Weight & Pricing'}
          </h3>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        
        <div className="modal-content">
          <div className="order-info">
            <h4>Order #{order.order_number}</h4>
            <p>Customer: {order.customer?.name}</p>
            <p>Service: {order.service?.name}</p>
          </div>
          
          <form onSubmit={handleSubmit}>
            {type === 'status' ? (
              <div className="form-group">
                <label className="form-label">New Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="form-select"
                  required
                >
                  {Object.entries(STATUS_LABELS).map(([status, label]) => (
                    <option key={status} value={status}>{label}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="form-group">
                <label className="form-label">Actual Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={actualWeight}
                  onChange={(e) => setActualWeight(e.target.value)}
                  className="form-input"
                  placeholder={`Estimated: ${order.estimated_weight} kg`}
                  required
                />
                <p className="form-help">
                  This will recalculate the final price based on actual weight
                </p>
              </div>
            )}
            
            <div className="modal-actions">
              <button type="button" onClick={onClose} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={isUpdating}>
                {isUpdating ? <LoadingSpinner size="small" color="white" /> : 'Update'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StaffOrdersPage;
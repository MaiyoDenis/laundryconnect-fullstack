import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { customersAPI } from '../../services/customerService';
import toast from 'react-hot-toast';
import './StaffPages.css';

const StaffCustomersPage = () => {
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    dateFrom: '',
    dateTo: ''
  });
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);

  const queryClient = useQueryClient();

  // Get customers
  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['customers', filters],
    queryFn: () => customersAPI.getCustomers(filters).then(res => res.data)
  });

  // Update customer mutation
  const updateCustomerMutation = useMutation({
    mutationFn: ({ id, updates }) => customersAPI.updateCustomer(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Customer updated successfully');
      setShowCustomerModal(false);
    },
    onError: () => {
      toast.error('Failed to update customer');
    }
  });

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      location: '',
      dateFrom: '',
      dateTo: ''
    });
  };

  const openCustomerModal = (customer) => {
    setSelectedCustomer(customer);
    setShowCustomerModal(true);
  };

  const handleUpdateCustomer = (updates) => {
    updateCustomerMutation.mutate({ id: selectedCustomer.id, updates });
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <LoadingSpinner text="Loading customers..." />
      </div>
    );
  }

  return (
    <div className="staff-customers-page">
      <div className="page-header">
        <h1>Customer Management 👥</h1>
        <p>View and manage customer profiles and information</p>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-grid">
          <div className="filter-group">
            <label>Search Customers</label>
            <input
              type="text"
              placeholder="Search by name, phone, email..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="form-input"
            />
          </div>
          
          <div className="filter-group">
            <label>Location</label>
            <input
              type="text"
              placeholder="Filter by location..."
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              className="form-input"
            />
          </div>

          <div className="filter-group">
            <label>Registered From</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="form-input"
            />
          </div>

          <div className="filter-group">
            <label>Registered To</label>
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

      {/* Customer Stats */}
      <div className="customer-stats">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-number">{customers.length}</div>
            <div className="stat-label">Total Customers</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <div className="stat-number">
              {customers.filter(c => {
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return new Date(c.created_at) > weekAgo;
              }).length}
            </div>
            <div className="stat-label">New This Week</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔄</div>
          <div className="stat-content">
            <div className="stat-number">
              {customers.filter(c => (c.total_orders || 0) > 0).length}
            </div>
            <div className="stat-label">Active Customers</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <div className="stat-number">
              {customers.filter(c => (c.total_orders || 0) >= 5).length}
            </div>
            <div className="stat-label">Loyal Customers</div>
          </div>
        </div>
      </div>

      {/* Customers Grid */}
      {customers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h3>No customers found</h3>
          <p>No customers match your current filters</p>
        </div>
      ) : (
        <div className="customers-grid">
          {customers.map(customer => (
            <div key={customer.id} className="customer-card">
              <div className="customer-header">
                <div className="customer-avatar">
                  {customer.name?.charAt(0).toUpperCase() || '?'}
                </div>
                <div className="customer-info">
                  <h3>{customer.name}</h3>
                  <p>{customer.email}</p>
                  <p>{customer.phone}</p>
                </div>
                <div className="customer-badge">
                  {(customer.total_orders || 0) >= 5 ? (
                    <span className="badge badge-success">Loyal</span>
                  ) : (customer.total_orders || 0) > 0 ? (
                    <span className="badge badge-info">Active</span>
                  ) : (
                    <span className="badge badge-secondary">New</span>
                  )}
                </div>
              </div>

              <div className="customer-details">
                <div className="detail-row">
                  <span className="detail-label">📍 Location:</span>
                  <span>{customer.location_name || 'Not set'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">🏠 Address:</span>
                  <span>{customer.address || 'Not provided'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">📅 Joined:</span>
                  <span>{new Date(customer.created_at).toLocaleDateString()}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">📦 Orders:</span>
                  <span>{customer.total_orders || 0} orders</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">💰 Total Spent:</span>
                  <span>KSH {(customer.total_spent || 0).toLocaleString()}</span>
                </div>
              </div>

              <div className="customer-actions">
                <button
                  onClick={() => openCustomerModal(customer)}
                  className="btn btn-primary btn-small"
                >
                  View Details
                </button>
                <a 
                  href={`tel:${customer.phone}`}
                  className="btn btn-secondary btn-small"
                >
                  📞 Call
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Customer Details Modal */}
      {showCustomerModal && selectedCustomer && (
        <CustomerDetailsModal
          customer={selectedCustomer}
          onUpdate={handleUpdateCustomer}
          onClose={() => setShowCustomerModal(false)}
          isUpdating={updateCustomerMutation.isPending}
        />
      )}
    </div>
  );
};

// Customer Details Modal Component
const CustomerDetailsModal = ({ customer, onUpdate, onClose, isUpdating }) => {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: customer.name || '',
    email: customer.email || '',
    phone: customer.phone || '',
    address: customer.address || '',
    location_name: customer.location_name || ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(formData);
    setEditMode(false);
  };

  const handleCancel = () => {
    setFormData({
      name: customer.name || '',
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || '',
      location_name: customer.location_name || ''
    });
    setEditMode(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal large">
        <div className="modal-header">
          <h3>Customer Details</h3>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        
        <div className="modal-content">
          <div className="customer-profile">
            <div className="profile-avatar large">
              {customer.name?.charAt(0).toUpperCase() || '?'}
            </div>
            <div className="profile-info">
              <h2>{customer.name}</h2>
              <p>Customer since {new Date(customer.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          {editMode ? (
            <form onSubmit={handleSubmit} className="edit-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Location Name</label>
                  <input
                    type="text"
                    value={formData.location_name}
                    onChange={(e) => handleInputChange('location_name', e.target.value)}
                    className="form-input"
                    placeholder="e.g., Home, Office"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="form-textarea"
                  rows="3"
                />
              </div>

              <div className="form-actions">
                <button type="button" onClick={handleCancel} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isUpdating}>
                  {isUpdating ? <LoadingSpinner size="small" color="white" /> : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="customer-info-grid">
              <div className="info-section">
                <h4>Contact Information</h4>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Email:</label>
                    <span>{customer.email}</span>
                  </div>
                  <div className="info-item">
                    <label>Phone:</label>
                    <span>{customer.phone}</span>
                  </div>
                  <div className="info-item">
                    <label>Location:</label>
                    <span>{customer.location_name || 'Not set'}</span>
                  </div>
                  <div className="info-item full-width">
                    <label>Address:</label>
                    <span>{customer.address || 'Not provided'}</span>
                  </div>
                </div>
              </div>

              <div className="info-section">
                <h4>Account Statistics</h4>
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-number">{customer.total_orders || 0}</span>
                    <span className="stat-label">Total Orders</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">KSH {(customer.total_spent || 0).toLocaleString()}</span>
                    <span className="stat-label">Total Spent</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">{customer.avg_rating || 'N/A'}</span>
                    <span className="stat-label">Avg Rating</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">
                      {customer.last_order ? new Date(customer.last_order).toLocaleDateString() : 'Never'}
                    </span>
                    <span className="stat-label">Last Order</span>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  onClick={() => setEditMode(true)}
                  className="btn btn-primary"
                >
                  Edit Customer
                </button>
                <a 
                  href={`tel:${customer.phone}`}
                  className="btn btn-secondary"
                >
                  📞 Call Customer
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffCustomersPage;
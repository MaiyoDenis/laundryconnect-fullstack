import React, { useState } from 'react';
import { useServices, useCreateService, useUpdateService, useDeleteService } from '../../hooks/useServices';
import { useForm } from 'react-hook-form';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { SERVICE_TYPES, PRICING_MULTIPLIERS } from '../../constants';
import toast from 'react-hot-toast';
import './AdminPages.css';

const AdminServicesPage = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  const { data: services = [], isLoading } = useServices();
  const createServiceMutation = useCreateService();
  const updateServiceMutation = useUpdateService();
  const deleteServiceMutation = useDeleteService();

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  const handleCreateService = async (data) => {
    try {
      await createServiceMutation.mutateAsync(data);
      setShowCreateModal(false);
      reset();
    } catch {
      toast.error('Failed to create service');
    }
  };

  const handleEditService = async (data) => {
    try {
      await updateServiceMutation.mutateAsync({ serviceId: selectedService.id, updates: data });
      setShowEditModal(false);
      setSelectedService(null);
      reset();
    } catch {
      toast.error('Failed to update service');
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await deleteServiceMutation.mutateAsync(serviceId);
      } catch {
        toast.error('Failed to delete service');
      }
    }
  };

  const openEditModal = (service) => {
    setSelectedService(service);
    setValue('name', service.name);
    setValue('description', service.description);
    setValue('price_per_unit', service.price_per_unit);
    setValue('unit', service.unit);
    setValue('service_type', service.service_type);
    setValue('turnaround_hours', service.turnaround_hours);
    setShowEditModal(true);
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <LoadingSpinner text="Loading services..." />
      </div>
    );
  }

  return (
    <div className="admin-services-page">
      <div className="page-header">
        <div>
          <h1>Service Management ⚙️</h1>
          <p>Manage laundry services, pricing, and service levels</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary"
        >
          + Add New Service
        </button>
      </div>

      {/* Services Overview */}
      <div className="services-overview">
        <div className="overview-stats">
          <div className="stat-card">
            <div className="stat-icon">⚙️</div>
            <div className="stat-content">
              <div className="stat-number">{services.length}</div>
              <div className="stat-label">Total Services</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <div className="stat-number">
                KSH {services.length > 0 ? (services.reduce((sum, s) => sum + s.price_per_unit, 0) / services.length).toFixed(0) : 0}
              </div>
              <div className="stat-label">Avg Price/kg</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⚡</div>
            <div className="stat-content">
              <div className="stat-number">
                {services.filter(s => s.service_type === SERVICE_TYPES.EXPRESS).length}
              </div>
              <div className="stat-label">Express Services</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💎</div>
            <div className="stat-content">
              <div className="stat-number">
                {services.filter(s => s.service_type === SERVICE_TYPES.PREMIUM).length}
              </div>
              <div className="stat-label">Premium Services</div>
            </div>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="services-grid">
        {services.map(service => (
          <div key={service.id} className="service-card-admin">
            <div className="service-header">
              <h3>{service.name}</h3>
              <span className={`service-type-badge ${service.service_type}`}>
                {service.service_type.toUpperCase()}
              </span>
            </div>
            
            <div className="service-description">
              {service.description}
            </div>
            
            <div className="service-pricing">
              <div className="base-price">
                <span className="price-label">Base Price:</span>
                <span className="price-value">KSH {service.price_per_unit}/{service.unit}</span>
              </div>
              
              {service.service_type !== SERVICE_TYPES.STANDARD && (
                <div className="final-price">
                  <span className="price-label">Final Price:</span>
                  <span className="price-value">
                    KSH {(service.price_per_unit * PRICING_MULTIPLIERS[service.service_type]).toFixed(0)}/{service.unit}
                  </span>
                  <span className="multiplier">
                    ({((PRICING_MULTIPLIERS[service.service_type] - 1) * 100).toFixed(0)}% premium)
                  </span>
                </div>
              )}
            </div>
            
            <div className="service-details">
              <div className="detail-item">
                <span className="detail-icon">⏰</span>
                <span>{service.turnaround_hours}h turnaround</span>
              </div>
              <div className="detail-item">
                <span className="detail-icon">📅</span>
                <span>Created {new Date(service.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            
            <div className="service-actions">
              <button
                onClick={() => openEditModal(service)}
                className="btn btn-primary btn-small"
                disabled={updateServiceMutation.isLoading}
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteService(service.id)}
                className="btn btn-danger btn-small"
                disabled={deleteServiceMutation.isLoading}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Service Modal */}
          {showCreateModal && (
            <ServiceModal
              title="Create New Service"
              onSubmit={handleCreateService}
              onClose={() => {
                setShowCreateModal(false);
                reset();
              }}
              isLoading={createServiceMutation.isLoading}
              register={register}
              handleSubmit={handleSubmit}
              errors={errors}
            />
          )}

      {/* Edit Service Modal */}
          {showEditModal && selectedService && (
            <ServiceModal
              title="Edit Service"
              onSubmit={handleEditService}
              onClose={() => {
                setShowEditModal(false);
                setSelectedService(null);
                reset();
              }}
              isLoading={updateServiceMutation.isLoading}
              register={register}
              handleSubmit={handleSubmit}
              errors={errors}
            />
          )}
    </div>
  );
};

// Service Modal Component
const ServiceModal = ({ title, onSubmit, onClose, isLoading, register, handleSubmit, errors }) => {
  return (
    <div className="modal-overlay">
      <div className="modal large">
        <div className="modal-header">
          <h3>{title}</h3>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        
        <div className="modal-content">
          <form onSubmit={handleSubmit(onSubmit)} className="service-form">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Service Name</label>
                <input
                  {...register('name', { required: 'Service name is required' })}
                  type="text"
                  className={`form-input ${errors.name ? 'error' : ''}`}
                  placeholder="e.g., Wash & Iron Service"
                />
                {errors.name && (
                  <span className="form-error">{errors.name.message}</span>
                )}
              </div>
              
              <div className="form-group">
                <label className="form-label">Service Type</label>
                <select
                  {...register('service_type', { required: 'Service type is required' })}
                  className={`form-select ${errors.service_type ? 'error' : ''}`}
                >
                  <option value="">Select service type...</option>
                  <option value={SERVICE_TYPES.STANDARD}>Standard</option>
                  <option value={SERVICE_TYPES.EXPRESS}>Express (+50%)</option>
                  <option value={SERVICE_TYPES.PREMIUM}>Premium (+100%)</option>
                </select>
                {errors.service_type && (
                  <span className="form-error">{errors.service_type.message}</span>
                )}
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                {...register('description')}
                className="form-textarea"
                rows="3"
                placeholder="Describe what this service includes..."
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Price per Unit</label>
                <input
                  {...register('price_per_unit', { 
                    required: 'Price is required',
                    min: { value: 0.01, message: 'Price must be greater than 0' }
                  })}
                  type="number"
                  step="0.01"
                  min="0.01"
                  className={`form-input ${errors.price_per_unit ? 'error' : ''}`}
                  placeholder="200.00"
                />
                {errors.price_per_unit && (
                  <span className="form-error">{errors.price_per_unit.message}</span>
                )}
              </div>
              
              <div className="form-group">
                <label className="form-label">Unit</label>
                <select
                  {...register('unit', { required: 'Unit is required' })}
                  className={`form-select ${errors.unit ? 'error' : ''}`}
                >
                  <option value="">Select unit...</option>
                  <option value="kg">per Kilogram (kg)</option>
                  <option value="item">per Item</option>
                  <option value="load">per Load</option>
                </select>
                {errors.unit && (
                  <span className="form-error">{errors.unit.message}</span>
                )}
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Turnaround Time (hours)</label>
              <input
                {...register('turnaround_hours', { 
                  required: 'Turnaround time is required',
                  min: { value: 1, message: 'Minimum 1 hour' }
                })}
                type="number"
                min="1"
                className={`form-input ${errors.turnaround_hours ? 'error' : ''}`}
                placeholder="48"
              />
              {errors.turnaround_hours && (
                <span className="form-error">{errors.turnaround_hours.message}</span>
              )}
            </div>
            
            <div className="form-actions">
              <button type="button" onClick={onClose} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={isLoading}>
                {isLoading ? <LoadingSpinner size="small" color="white" /> : 'Save Service'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminServicesPage;
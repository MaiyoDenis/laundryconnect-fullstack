import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useServices } from '../../hooks/useServices';
import { useOrders } from '../../hooks/useOrders';
import useAuthStore from '../../store/authStore';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { SERVICE_OPTIONS, PICKUP_TIME_LABELS, PRICING_MULTIPLIERS } from '../../constants';
import toast from 'react-hot-toast';
import './CustomerPages.css';

const PlaceOrderPage = () => {
  const { user } = useAuthStore();
  const { services, isLoading: servicesLoading } = useServices();
  const { createOrder, isCreating } = useOrders();
  const navigate = useNavigate();
  
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      pickup_date: new Date().toISOString().split('T')[0],
      pickup_time: 'morning'
    }
  });

  const [estimatedPrice, setEstimatedPrice] = useState(0);
  const [selectedService, setSelectedService] = useState(null);

  const watchedFields = watch(['service_id', 'estimated_weight', 'service_options']);

  // Calculate estimated price
  useEffect(() => {
    const serviceId = watchedFields[0];
    const weight = parseFloat(watchedFields[1]) || 0;
    const serviceOptions = watchedFields[2];

    if (serviceId && weight > 0) {
      const service = services.find(s => s.id === parseInt(serviceId));
      if (service) {
        setSelectedService(service);
        const multiplier = PRICING_MULTIPLIERS[service.service_type] || 1;
        const basePrice = service.price_per_unit * weight;
        const totalPrice = basePrice * multiplier;
        setEstimatedPrice(totalPrice);
      }
    } else {
      setEstimatedPrice(0);
      setSelectedService(null);
    }
  }, [watchedFields, services]);

  const onSubmit = async (data) => {
    if (!user?.customer) {
      toast.error('Please complete your profile first');
      navigate('/customer/profile');
      return;
    }

    const orderData = {
      service_id: parseInt(data.service_id),
      estimated_weight: parseFloat(data.estimated_weight),
      pickup_date: data.pickup_date,
      pickup_time: data.pickup_time,
      service_options: data.service_options,
      special_instructions: data.special_instructions || ''
    };

    try {
      await createOrder(orderData);
      toast.success('Order placed successfully!');
      navigate('/customer/orders');
    } catch (error) {
      toast.error('Failed to place order. Please try again.');
    }
  };

  if (servicesLoading) {
    return (
      <div className="loading-container">
        <LoadingSpinner text="Loading services..." />
      </div>
    );
  }

  return (
    <div className="place-order-page">
      <div className="page-header">
        <h1>Place New Order</h1>
        <p>Schedule your laundry pickup and delivery</p>
      </div>

      <div className="order-form-container">
        <form onSubmit={handleSubmit(onSubmit)} className="order-form">
          {/* Service Selection */}
          <div className="form-section">
            <h3>Select Service</h3>
            <div className="form-group">
              <label className="form-label">Service Type</label>
              <select
                {...register('service_id', { required: 'Please select a service' })}
                className={`form-select ${errors.service_id ? 'error' : ''}`}
              >
                <option value="">Choose a service...</option>
                {services.map(service => (
                  <option key={service.id} value={service.id}>
                    {service.name} - KSH {service.price_per_unit}/{service.unit}
                    {service.service_type === 'express' && ' (Express +50%)'}
                    {service.service_type === 'premium' && ' (Premium +100%)'}
                  </option>
                ))}
              </select>
              {errors.service_id && (
                <span className="form-error">{errors.service_id.message}</span>
              )}
            </div>

            {selectedService && (
              <div className="service-details">
                <h4>{selectedService.name}</h4>
                <p>{selectedService.description}</p>
                <div className="service-features">
                  <span className="feature-tag">
                    {selectedService.service_type} Service
                  </span>
                  <span className="feature-tag">
                    {selectedService.turnaround_hours}h turnaround
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Service Options */}
          <div className="form-section">
            <h3>Service Options</h3>
            <div className="form-group">
              <label className="form-label">What do you need?</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    {...register('service_options', { required: 'Please select service options' })}
                    type="radio"
                    value={SERVICE_OPTIONS.WASHING}
                  />
                  <span className="radio-custom"></span>
                  Washing Only
                </label>
                <label className="radio-label">
                  <input
                    {...register('service_options')}
                    type="radio"
                    value={SERVICE_OPTIONS.IRONING}
                  />
                  <span className="radio-custom"></span>
                  Ironing Only
                </label>
                <label className="radio-label">
                  <input
                    {...register('service_options')}
                    type="radio"
                    value={SERVICE_OPTIONS.BOTH}
                  />
                  <span className="radio-custom"></span>
                  Washing + Ironing
                </label>
              </div>
              {errors.service_options && (
                <span className="form-error">{errors.service_options.message}</span>
              )}
            </div>
          </div>

          {/* Weight Estimation */}
          <div className="form-section">
            <h3>Weight Estimation</h3>
            <div className="form-group">
              <label className="form-label">
                Estimated Weight ({selectedService?.unit || 'kg'})
              </label>
              <input
                {...register('estimated_weight', {
                  required: 'Please enter estimated weight',
                  min: { value: 0.5, message: 'Minimum weight is 0.5 kg' },
                  max: { value: 50, message: 'Maximum weight is 50 kg' }
                })}
                type="number"
                step="0.5"
                min="0.5"
                max="50"
                className={`form-input ${errors.estimated_weight ? 'error' : ''}`}
                placeholder="e.g. 2.5"
              />
              {errors.estimated_weight && (
                <span className="form-error">{errors.estimated_weight.message}</span>
              )}
              <div className="weight-guide">
                <h4>Weight Guide:</h4>
                <ul>
                  <li>👕 T-shirt: ~0.2 kg</li>
                  <li>👖 Jeans: ~0.7 kg</li>
                  <li>👗 Dress: ~0.4 kg</li>
                  <li>🧥 Jacket: ~1.0 kg</li>
                  <li>🛏️ Bed sheet: ~0.8 kg</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Pickup Schedule */}
          <div className="form-section">
            <h3>Pickup Schedule</h3>
            <div className="row">
              <div className="col-6">
                <div className="form-group">
                  <label className="form-label">Pickup Date</label>
                  <input
                    {...register('pickup_date', { required: 'Please select pickup date' })}
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    className={`form-input ${errors.pickup_date ? 'error' : ''}`}
                  />
                  {errors.pickup_date && (
                    <span className="form-error">{errors.pickup_date.message}</span>
                  )}
                </div>
              </div>
              <div className="col-6">
                <div className="form-group">
                  <label className="form-label">Pickup Time</label>
                  <select
                    {...register('pickup_time', { required: 'Please select pickup time' })}
                    className={`form-select ${errors.pickup_time ? 'error' : ''}`}
                  >
                    {Object.entries(PICKUP_TIME_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  {errors.pickup_time && (
                    <span className="form-error">{errors.pickup_time.message}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Special Instructions */}
          <div className="form-section">
            <h3>Special Instructions (Optional)</h3>
            <div className="form-group">
              <label className="form-label">Any special handling instructions?</label>
              <textarea
                {...register('special_instructions')}
                className="form-textarea"
                rows="4"
                placeholder="e.g., Handle with care, remove stains, use fabric softener..."
              />
            </div>
          </div>

          {/* Price Summary */}
          {estimatedPrice > 0 && (
            <div className="price-summary">
              <h3>Price Estimate</h3>
              <div className="price-breakdown">
                <div className="price-row">
                  <span>Base Price ({selectedService?.price_per_unit}/kg × {watchedFields[1]} kg)</span>
                  <span>KSH {(selectedService?.price_per_unit * (parseFloat(watchedFields[1]) || 0)).toFixed(2)}</span>
                </div>
                {selectedService?.service_type !== 'standard' && (
                  <div className="price-row">
                    <span>{selectedService?.service_type} Service Premium</span>
                    <span>+{((PRICING_MULTIPLIERS[selectedService?.service_type] - 1) * 100).toFixed(0)}%</span>
                  </div>
                )}
                <div className="price-row total">
                  <span>Estimated Total</span>
                  <span>KSH {estimatedPrice.toFixed(2)}</span>
                </div>
              </div>
              <p className="price-note">
                * Final price will be calculated based on actual weight after pickup
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary btn-large"
            disabled={isCreating || estimatedPrice === 0}
          >
            {isCreating ? <LoadingSpinner size="small" color="white" /> : 'Place Order'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PlaceOrderPage;
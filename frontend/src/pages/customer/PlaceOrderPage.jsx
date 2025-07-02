import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useServices } from '../../hooks/useServices';
import { useCreateOrder } from '../../hooks/useOrders';
import useAuthStore from '../../store/authStore';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { SERVICE_OPTIONS, PICKUP_TIME_LABELS, PRICING_MULTIPLIERS } from '../../constants';
import toast from 'react-hot-toast';
import './CustomerPages.css';

const PlaceOrderSchema = Yup.object().shape({
  service_id: Yup.number()
    .required('Please select a service')
    .typeError('Service is required'),
  estimated_weight: Yup.number()
    .required('Please enter estimated weight')
    .min(0.5, 'Minimum weight is 0.5 kg')
    .max(50, 'Maximum weight is 50 kg'),
  service_options: Yup.string()
    .required('Please select service options'),
  pickup_date: Yup.date()
    .required('Please select pickup date')
    .min(new Date(new Date().setHours(0,0,0,0)), 'Pickup date cannot be in the past'),
  pickup_time: Yup.string()
    .required('Please select pickup time'),
  special_instructions: Yup.string(),
});

const PlaceOrderPage = () => {
  const { user } = useAuthStore();
  const { data: services = [], isLoading: servicesLoading } = useServices();
  const { mutateAsync: createOrder, isLoading: isCreating } = useCreateOrder();
  const navigate = useNavigate();

  const [estimatedPrice, setEstimatedPrice] = useState(0);
  const [selectedService, setSelectedService] = useState(null);

  const formik = useFormik({
    initialValues: {
      service_id: '',
      estimated_weight: '',
      service_options: '',
      pickup_date: new Date().toISOString().split('T')[0],
      pickup_time: 'morning',
      special_instructions: '',
    },
    validationSchema: PlaceOrderSchema,
    onSubmit: async (values, { setSubmitting }) => {
      if (!user?.customer) {
        toast.error('Please complete your profile first');
        navigate('/customer/profile');
        setSubmitting(false);
        return;
      }

      const orderData = {
        service_id: parseInt(values.service_id),
        estimated_weight: parseFloat(values.estimated_weight),
        pickup_date: values.pickup_date,
        pickup_time: values.pickup_time,
        service_options: values.service_options,
        special_instructions: values.special_instructions || '',
      };

      try {
        await createOrder(orderData);
        toast.success('Order placed successfully!');
        navigate('/customer/orders');
      } catch {
        toast.error('Failed to place order. Please try again.');
      }
      setSubmitting(false);
    },
  });

  useEffect(() => {
    const serviceId = formik.values.service_id;
    const weight = parseFloat(formik.values.estimated_weight) || 0;

    if (!serviceId || !weight || weight <= 0) {
      setEstimatedPrice(0);
      setSelectedService(null);
      return;
    }
    const service = services.find(s => s.id === parseInt(serviceId));
    if (service) {
      setSelectedService(service);
      const multiplier = PRICING_MULTIPLIERS[service.service_type] || 1;
      const basePrice = service.price_per_unit * weight;
      const totalPrice = basePrice * multiplier;
      setEstimatedPrice(totalPrice);
    } else {
      setEstimatedPrice(0);
      setSelectedService(null);
    }
  }, [formik.values.service_id, formik.values.estimated_weight, services]);

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

      <form onSubmit={formik.handleSubmit} className="order-form">
        {/* Service Selection */}
        <div className="form-section">
          <h3>Select Service</h3>
          <div className="form-group">
            <label className="form-label" htmlFor="service_id">Service Type</label>
            <select
              id="service_id"
              name="service_id"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.service_id}
              className={`form-select ${formik.touched.service_id && formik.errors.service_id ? 'error' : ''}`}
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
            {formik.touched.service_id && formik.errors.service_id ? (
              <span className="form-error">{formik.errors.service_id}</span>
            ) : null}
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
            <div role="group" aria-labelledby="service_options" className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="service_options"
                  value={SERVICE_OPTIONS.WASHING}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  checked={formik.values.service_options === SERVICE_OPTIONS.WASHING}
                />
                <span className="radio-custom"></span>
                Washing Only
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="service_options"
                  value={SERVICE_OPTIONS.IRONING}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  checked={formik.values.service_options === SERVICE_OPTIONS.IRONING}
                />
                <span className="radio-custom"></span>
                Ironing Only
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="service_options"
                  value={SERVICE_OPTIONS.BOTH}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  checked={formik.values.service_options === SERVICE_OPTIONS.BOTH}
                />
                <span className="radio-custom"></span>
                Washing + Ironing
              </label>
            </div>
            {formik.touched.service_options && formik.errors.service_options ? (
              <span className="form-error">{formik.errors.service_options}</span>
            ) : null}
          </div>
        </div>

        {/* Weight Estimation */}
        <div className="form-section">
          <h3>Weight Estimation</h3>
          <div className="form-group">
            <label className="form-label" htmlFor="estimated_weight">
              Estimated Weight ({selectedService?.unit || 'kg'})
            </label>
            <input
              id="estimated_weight"
              name="estimated_weight"
              type="number"
              step="0.5"
              min="0.5"
              max="50"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.estimated_weight}
              className={`form-input ${formik.touched.estimated_weight && formik.errors.estimated_weight ? 'error' : ''}`}
              placeholder="e.g. 2.5"
            />
            {formik.touched.estimated_weight && formik.errors.estimated_weight ? (
              <span className="form-error">{formik.errors.estimated_weight}</span>
            ) : null}
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
                <label className="form-label" htmlFor="pickup_date">Pickup Date</label>
                <input
                  id="pickup_date"
                  name="pickup_date"
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.pickup_date}
                  className={`form-input ${formik.touched.pickup_date && formik.errors.pickup_date ? 'error' : ''}`}
                />
                {formik.touched.pickup_date && formik.errors.pickup_date ? (
                  <span className="form-error">{formik.errors.pickup_date}</span>
                ) : null}
              </div>
            </div>
            <div className="col-6">
              <div className="form-group">
                <label className="form-label" htmlFor="pickup_time">Pickup Time</label>
                <select
                  id="pickup_time"
                  name="pickup_time"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.pickup_time}
                  className={`form-select ${formik.touched.pickup_time && formik.errors.pickup_time ? 'error' : ''}`}
                >
                  {Object.entries(PICKUP_TIME_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                {formik.touched.pickup_time && formik.errors.pickup_time ? (
                  <span className="form-error">{formik.errors.pickup_time}</span>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {/* Special Instructions */}
        <div className="form-section">
          <h3>Special Instructions (Optional)</h3>
          <div className="form-group">
            <textarea
              id="special_instructions"
              name="special_instructions"
              rows="4"
              placeholder="e.g., Handle with care, remove stains, use fabric softener..."
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.special_instructions}
              className="form-textarea"
            />
          </div>
        </div>

        {/* Price Summary */}
        {estimatedPrice > 0 && (
          <div className="price-summary">
            <h3>Price Estimate</h3>
            <div className="price-breakdown">
              <div className="price-row">
                <span>Base Price ({selectedService?.price_per_unit}/kg × {formik.values.estimated_weight} kg)</span>
                <span>KSH {(selectedService?.price_per_unit * (parseFloat(formik.values.estimated_weight) || 0)).toFixed(2)}</span>
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
          disabled={formik.isSubmitting || estimatedPrice === 0}
        >
          {isCreating ? <LoadingSpinner size="small" color="white" /> : 'Place Order'}
        </button>
          </form>
        </div>
      );
    };

export default PlaceOrderPage;

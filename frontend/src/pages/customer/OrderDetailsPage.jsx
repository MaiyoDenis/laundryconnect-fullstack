import React, { useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useOrder } from '../../hooks/useOrders';
import { useForm } from 'react-hook-form';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { ORDER_STATUS, STATUS_LABELS, STATUS_COLORS, PICKUP_TIME_LABELS } from '../../constants';
import toast from 'react-hot-toast';
import './CustomerPages.css';

import { MdAssignment, MdCheckCircle, MdLocalShipping, MdLocalLaundryService, MdIron, MdStar, MdDoneAll, MdHome } from 'react-icons/md';

const OrderDetailsPage = () => {
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'details');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  
  const { data: order, isLoading, error } = useOrder(orderId);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmitReview = async (data) => {
    try {
      // API call to submit review
      // await reviewsAPI.createReview(orderId, data);
      toast.success('Review submitted successfully!');
      setReviewSubmitted(true);
      setActiveTab('details');
    } catch (error) {
      toast.error('Failed to submit review');
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <LoadingSpinner text="Loading order details..." />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="error-state">
        <h2>Order Not Found</h2>
        <p>The order you're looking for doesn't exist or you don't have permission to view it.</p>
        <Link to="/customer/orders" className="btn btn-primary">
          Back to Orders
        </Link>
      </div>
    );
  }

  const orderTimeline = [
    { status: ORDER_STATUS.PLACED, label: 'Order Placed', icon: <MdAssignment /> },
    { status: ORDER_STATUS.CONFIRMED, label: 'Confirmed', icon: <MdCheckCircle /> },
    { status: ORDER_STATUS.COLLECTED, label: 'Collected', icon: <MdLocalShipping /> },
    { status: ORDER_STATUS.WASHING, label: 'Washing', icon: <MdLocalLaundryService /> },
    { status: ORDER_STATUS.IRONING, label: 'Ironing', icon: <MdIron /> },
    { status: ORDER_STATUS.READY, label: 'Ready', icon: <MdDoneAll /> },
    { status: ORDER_STATUS.OUT_FOR_DELIVERY, label: 'Out for Delivery', icon: <MdLocalShipping /> },
    { status: ORDER_STATUS.DELIVERED, label: 'Delivered', icon: <MdHome /> }
  ];

  const getCurrentStep = () => {
    const currentIndex = orderTimeline.findIndex(step => step.status === order.status);
    return currentIndex >= 0 ? currentIndex : 0;
  };

  return (
    <div className="order-details-page">
      <div className="page-header">
        <div className="breadcrumb">
          <Link to="/customer/orders">My Orders</Link>
          <span>→</span>
          <span>Order #{order.order_number}</span>
        </div>
        <h1>Order #{order.order_number}</h1>
        <span className={`badge badge-${STATUS_COLORS[order.status]} large`}>
          {STATUS_LABELS[order.status]}
        </span>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'details' ? 'active' : ''}`}
          onClick={() => setActiveTab('details')}
        >
          Order Details
        </button>
        <button 
          className={`tab ${activeTab === 'tracking' ? 'active' : ''}`}
          onClick={() => setActiveTab('tracking')}
        >
          Order Tracking
        </button>
        {order.status === ORDER_STATUS.DELIVERED && (
          <button 
            className={`tab ${activeTab === 'review' ? 'active' : ''}`}
            onClick={() => setActiveTab('review')}
          >
            Leave Review
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'details' && (
          <div className="details-tab">
            <div className="details-grid">
              {/* Order Summary */}
              <div className="detail-card">
                <h3>Order Summary</h3>
                <div className="detail-row">
                  <span>Order Number:</span>
                  <span>#{order.order_number}</span>
                </div>
                <div className="detail-row">
                  <span>Date Placed:</span>
                  <span>{new Date(order.created_at).toLocaleDateString()}</span>
                </div>
                <div className="detail-row">
                  <span>Status:</span>
                  <span className={`badge badge-${STATUS_COLORS[order.status]}`}>
                    {STATUS_LABELS[order.status]}
                  </span>
                </div>
                <div className="detail-row">
                  <span>Service:</span>
                  <span>{order.service?.name}</span>
                </div>
                <div className="detail-row">
                  <span>Service Type:</span>
                  <span className="service-type-badge">
                    {order.service?.service_type?.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Pricing Information */}
              <div className="detail-card">
                <h3>Pricing Information</h3>
                <div className="detail-row">
                  <span>Estimated Weight:</span>
                  <span>{order.estimated_weight} kg</span>
                </div>
                {order.actual_weight && (
                  <div className="detail-row">
                    <span>Actual Weight:</span>
                    <span>{order.actual_weight} kg</span>
                  </div>
                )}
                <div className="detail-row">
                  <span>Price per kg:</span>
                  <span>KSH {order.service?.price_per_unit}</span>
                </div>
                <div className="detail-row">
                  <span>Initial Estimate:</span>
                  <span>KSH {order.total_price?.toLocaleString()}</span>
                </div>
                {order.final_price && order.final_price !== order.total_price && (
                  <div className="detail-row highlight">
                    <span>Final Price:</span>
                    <span>KSH {order.final_price?.toLocaleString()}</span>
                  </div>
                )}
                <div className="detail-row total">
                  <span>Total Amount:</span>
                  <span>KSH {(order.final_price || order.total_price)?.toLocaleString()}</span>
                </div>
              </div>

              {/* Schedule Information */}
              <div className="detail-card">
                <h3>Schedule</h3>
                <div className="detail-row">
                  <span>Pickup Date:</span>
                  <span>{new Date(order.pickup_date).toLocaleDateString()}</span>
                </div>
                <div className="detail-row">
                  <span>Pickup Time:</span>
                  <span>{PICKUP_TIME_LABELS[order.pickup_time]}</span>
                </div>
                {order.delivery_date && (
                  <div className="detail-row">
                    <span>Expected Delivery:</span>
                    <span>{new Date(order.delivery_date).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              {/* Special Instructions */}
              {order.special_instructions && (
                <div className="detail-card full-width">
                  <h3>Special Instructions</h3>
                  <p>{order.special_instructions}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'tracking' && (
          <div className="tracking-tab">
            <div className="timeline">
              {orderTimeline.map((step, index) => {
                const isCompleted = index <= getCurrentStep();
                const isCurrent = index === getCurrentStep();
                
                return (
                  <div key={step.status} className={`timeline-item ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
                    <div className="timeline-marker">
                      <span className="timeline-icon">{step.icon}</span>
                    </div>
                    <div className="timeline-content">
                      <h4>{step.label}</h4>
                      {isCompleted && (
                        <span className="timeline-time">
                          {/* You would get this from order history */}
                          Completed
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {order.status === ORDER_STATUS.DELIVERED && (
              <div className="delivery-confirmation">
                <div className="confirmation-icon">✅</div>
                <h3>Order Delivered Successfully!</h3>
                <p>Your laundry has been delivered. How was our service?</p>
                <button 
                  onClick={() => setActiveTab('review')}
                  className="btn btn-primary"
                >
                  Leave a Review
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'review' && order.status === ORDER_STATUS.DELIVERED && (
          <div className="review-tab">
            {reviewSubmitted ? (
              <div className="review-success">
                <div className="success-icon">🎉</div>
                <h3>Thank you for your review!</h3>
                <p>Your feedback helps us improve our service.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmitReview)} className="review-form">
                <h3>How was our service?</h3>
                
                <div className="form-group">
                  <label className="form-label">Rating</label>
                  <div className="rating-input">
                    {[1, 2, 3, 4, 5].map(rating => (
                      <label key={rating} className="star-label">
                        <input
                          {...register('rating', { required: 'Please select a rating' })}
                          type="radio"
                          value={rating}
                        />
                        <span className="star">⭐</span>
                      </label>
                    ))}
                  </div>
                  {errors.rating && (
                    <span className="form-error">{errors.rating.message}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Your Review (Optional)</label>
                  <textarea
                    {...register('comment')}
                    className="form-textarea"
                    rows="4"
                    placeholder="Tell us about your experience..."
                  />
                </div>

                <button type="submit" className="btn btn-primary">
                  Submit Review
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetailsPage;

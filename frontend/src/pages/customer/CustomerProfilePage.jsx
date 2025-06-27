import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import useAuthStore from '../../store/authStore';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import './CustomerPages.css';

const CustomerProfilePage = () => {
  const { user, updateCustomerProfile } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      name: user?.customer?.name || '',
      email: user?.email || '',
      phone: user?.customer?.phone || '',
      address: user?.customer?.address || '',
      location_name: user?.customer?.location_name || '',
      location_lat: user?.customer?.location_lat || '',
      location_lng: user?.customer?.location_lng || ''
    }
  });

  // Reset form values when user.customer changes
  useEffect(() => {
    reset({
      name: user?.customer?.name || '',
      email: user?.email || '',
      phone: user?.customer?.phone || '',
      address: user?.customer?.address || '',
      location_name: user?.customer?.location_name || '',
      location_lat: user?.customer?.location_lat || '',
      location_lng: user?.customer?.location_lng || ''
    });
  }, [user?.customer, user?.email, reset]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Sanitize optional fields: convert empty strings to null
      const sanitizedData = {
        ...data,
        address: data.address || null,
        location_lat: data.location_lat === '' ? null : parseFloat(data.location_lat),
        location_lng: data.location_lng === '' ? null : parseFloat(data.location_lng),
        location_name: data.location_name || null,
      };

      // API call to update profile
      const authService = (await import('../../services/authService')).authService;
      const updatedProfile = await authService.updateProfile(sanitizedData);
      
      // Fetch full updated user profile
      const userData = await authService.fetchCurrentUser();
      if (userData) {
        updateCustomerProfile(userData.customer);
        // Also update full user object in authStore
        const useAuthStore = (await import('../../store/authStore')).default;
        useAuthStore.getState().setUser(userData);
      }
      
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          document.querySelector('input[name="location_lat"]').value = latitude;
          document.querySelector('input[name="location_lng"]').value = longitude;
          toast.success('Location updated!');
        },
        (error) => {
          toast.error('Failed to get location');
        }
      );
    } else {
      toast.error('Geolocation is not supported by this browser');
    }
  };

  return (
    <div className="profile-page">
      <div className="page-header">
        <h1>My Profile</h1>
        <p>Manage your account information and preferences</p>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="btn btn-primary"
          >
            Edit Profile
          </button>
        )}
      </div>

      <div className="profile-container">
        <div className="profile-sidebar">
          <div className="profile-avatar">
            <div className="avatar-circle">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <h3>{user?.customer?.name || user?.username}</h3>
            <p>{user?.role?.toUpperCase()}</p>
          </div>

          <div className="profile-stats">
            <h4>Account Stats</h4>
            <div className="stat-item">
              <span className="stat-label">Member Since:</span>
              <span className="stat-value">
                {new Date(user?.created_at).toLocaleDateString()}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Orders:</span>
              <span className="stat-value">0</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Status:</span>
              <span className="stat-value status-active">Active</span>
            </div>
          </div>
        </div>

        <div className="profile-content">
          <form onSubmit={handleSubmit(onSubmit)} className="profile-form">
            {/* Personal Information */}
            <div className="form-section">
              <h3>Personal Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    {...register('name', { required: 'Name is required' })}
                    type="text"
                    className={`form-input ${errors.name ? 'error' : ''}`}
                    disabled={!isEditing}
                  />
                  {errors.name && (
                    <span className="form-error">{errors.name.message}</span>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    type="email"
                    className={`form-input ${errors.email ? 'error' : ''}`}
                    disabled={!isEditing}
                  />
                  {errors.email && (
                    <span className="form-error">{errors.email.message}</span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  {...register('phone', {
                    required: 'Phone number is required',
                    pattern: {
                      value: /^(?:\+254|0)[17]\d{8}$/,
                      message: 'Invalid Kenyan phone number format'
                    }
                  })}
                  type="tel"
                  className={`form-input ${errors.phone ? 'error' : ''}`}
                  disabled={!isEditing}
                  placeholder="0712345678 or +254712345678"
                />
                {errors.phone && (
                  <span className="form-error">{errors.phone.message}</span>
                )}
              </div>
            </div>

            {/* Address Information */}
            <div className="form-section">
              <h3>Address Information</h3>
              <div className="form-group">
                <label className="form-label">Street Address</label>
                <textarea
                  {...register('address')}
                  className="form-textarea"
                  rows="3"
                  disabled={!isEditing}
                  placeholder="Enter your complete address..."
                />
              </div>
            </div>

            {/* Location Information */}
            <div className="form-section">
              <h3>Location Information</h3>
              <p className="section-description">
                Setting your location helps us provide accurate pickup and delivery services.
              </p>

              <div className="form-group">
                <label className="form-label">Location Name</label>
                <input
                  {...register('location_name')}
                  type="text"
                  className="form-input"
                  disabled={!isEditing}
                  placeholder="e.g., Home, Office, Apartment"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Latitude</label>
                  <input
                    {...register('location_lat')}
                    type="number"
                    step="any"
                    className="form-input"
                    disabled={!isEditing}
                    placeholder="-1.2921"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Longitude</label>
                  <input
                    {...register('location_lng')}
                    type="number"
                    step="any"
                    className="form-input"
                    disabled={!isEditing}
                    placeholder="36.8219"
                  />
                </div>
              </div>

              {isEditing && (
                <button 
                  type="button"
                  onClick={getCurrentLocation}
                  className="btn btn-secondary"
                >
                  📍 Get Current Location
                </button>
              )}
            </div>

            {/* Form Actions */}
            {isEditing && (
              <div className="form-actions">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn btn-secondary"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? <LoadingSpinner size="small" color="white" /> : 'Save Changes'}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfilePage;

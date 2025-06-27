import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './AuthPages.css';

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const { register: registerUser, isRegisterLoading } = useAuth();
  const navigate = useNavigate();

  const password = watch('password');

  const onSubmit = async (data) => {
    const userData = {
      username: data.username,
      email: data.email,
      password: data.password,
      role: 'customer', // Default role for registration
      name: data.name,
      phone: data.phone,
      address: data.address,
      location_name: data.location_name,
      location_lat: data.location_lat ? parseFloat(data.location_lat) : null,
      location_lng: data.location_lng ? parseFloat(data.location_lng) : null,
    };

    registerUser(userData);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <Link to="/" className="auth-brand">
            🧺 LaundryConnect Kenya
          </Link>
          <h1>Create Account</h1>
          <p>Join thousands of satisfied customers</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              {...register('username', { 
                required: 'Username is required',
                minLength: { value: 3, message: 'Username must be at least 3 characters' },
                pattern: {
                  value: /^[a-zA-Z0-9_]+$/,
                  message: 'Username can only contain letters, numbers, and underscores'
                }
              })}
              type="text"
              className={`form-input ${errors.username ? 'error' : ''}`}
              placeholder="Choose a username"
            />
            {errors.username && (
              <span className="form-error">{errors.username.message}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              {...register('name', { required: 'Name is required' })}
              type="text"
              className={`form-input ${errors.name ? 'error' : ''}`}
              placeholder="Enter your full name"
            />
            {errors.name && (
              <span className="form-error">{errors.name.message}</span>
            )}
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
              placeholder="0712345678 or +254712345678"
            />
            {errors.phone && (
              <span className="form-error">{errors.phone.message}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Street Address</label>
            <textarea
              {...register('address')}
              className="form-textarea"
              rows="3"
              placeholder="Enter your complete address..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Location Name</label>
            <input
              {...register('location_name')}
              type="text"
              className="form-input"
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
                placeholder="36.8219"
              />
            </div>
          </div>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                  (position) => {
                    const { latitude, longitude } = position.coords;
                    document.querySelector('input[name="location_lat"]').value = latitude;
                    document.querySelector('input[name="location_lng"]').value = longitude;
                    alert('Location updated!');
                  },
                  () => {
                    alert('Failed to get location');
                  }
                );
              } else {
                alert('Geolocation is not supported by this browser');
              }
            }}
          >
            📍 Get My Location
          </button>

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
              placeholder="Enter your email"
            />
            {errors.email && (
              <span className="form-error">{errors.email.message}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="password-input">
              <input
                {...register('password', { 
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Password must be at least 6 characters' }
                })}
                type={showPassword ? 'text' : 'password'}
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder="Create a strong password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {errors.password && (
              <span className="form-error">{errors.password.message}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <div className="password-input">
              <input
                {...register('confirmPassword', { 
                  required: 'Please confirm your password',
                  validate: value => value === password || 'Passwords do not match'
                })}
                type={showConfirmPassword ? 'text' : 'password'}
                className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                placeholder="Confirm your password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="form-error">{errors.confirmPassword.message}</span>
            )}
          </div>

          <div className="checkbox-group">
            <label className="checkbox-label">
              <input
                {...register('acceptTerms', { 
                  required: 'You must accept the terms and conditions' 
                })}
                type="checkbox"
                className="checkbox-input"
              />
              <span className="checkmark"></span>
              I agree to the{' '}
              <Link to="/terms" className="auth-link">Terms and Conditions</Link>{' '}
              and{' '}
              <Link to="/privacy" className="auth-link">Privacy Policy</Link>
            </label>
            {errors.acceptTerms && (
              <span className="form-error">{errors.acceptTerms.message}</span>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary auth-submit"
            disabled={isRegisterLoading}
          >
            {isRegisterLoading ? <LoadingSpinner size="small" color="white" /> : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
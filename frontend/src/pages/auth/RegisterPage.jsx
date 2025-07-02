import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './AuthPages.css';

const phoneRegExp = /^(?:\+254|0)[17]\d{8}$/;

const RegisterSchema = Yup.object().shape({
  username: Yup.string()
    .min(3, 'Username must be at least 3 characters')
    .matches(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .required('Username is required'),
  name: Yup.string().required('Name is required'),
  phone: Yup.string()
    .matches(phoneRegExp, 'Invalid Kenyan phone number format')
    .required('Phone number is required'),
  address: Yup.string(),
  location_name: Yup.string(),
  location_lat: Yup.number().nullable(),
  location_lng: Yup.number().nullable(),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords do not match')
    .required('Please confirm your password'),
  acceptTerms: Yup.bool()
    .oneOf([true], 'You must accept the terms and conditions')
    .required('You must accept the terms and conditions'),
});

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register: registerUser, isRegisterLoading } = useAuth();

  const handleSubmit = (values) => {
    const userData = {
      username: values.username,
      email: values.email,
      password: values.password,
      role: 'customer', // Default role for registration
      name: values.name,
      phone: values.phone,
      address: values.address,
      location_name: values.location_name,
      location_lat: values.location_lat ? parseFloat(values.location_lat) : null,
      location_lng: values.location_lng ? parseFloat(values.location_lng) : null,
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

        <Formik
          initialValues={{
            username: '',
            name: '',
            phone: '',
            address: '',
            location_name: '',
            location_lat: '',
            location_lng: '',
            email: '',
            password: '',
            confirmPassword: '',
            acceptTerms: false,
          }}
          validationSchema={RegisterSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, setFieldValue }) => (
            <Form className="auth-form">
              <div className="form-group">
                <label className="form-label" htmlFor="username">Username</label>
                <Field name="username" type="text" className="form-input" placeholder="Choose a username" />
                <ErrorMessage name="username" component="span" className="form-error" />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="name">Full Name</label>
                <Field name="name" type="text" className="form-input" placeholder="Enter your full name" />
                <ErrorMessage name="name" component="span" className="form-error" />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="phone">Phone Number</label>
                <Field name="phone" type="tel" className="form-input" placeholder="0712345678 or +254712345678" />
                <ErrorMessage name="phone" component="span" className="form-error" />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="address">Street Address</label>
                <Field as="textarea" name="address" className="form-textarea" rows="3" placeholder="Enter your complete address..." />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="location_name">Location Name</label>
                <Field name="location_name" type="text" className="form-input" placeholder="e.g., Home, Office, Apartment" />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="location_lat">Latitude</label>
                  <Field name="location_lat" type="number" step="any" className="form-input" placeholder="-1.2921" />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="location_lng">Longitude</label>
                  <Field name="location_lng" type="number" step="any" className="form-input" placeholder="36.8219" />
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
                        setFieldValue('location_lat', latitude);
                        setFieldValue('location_lng', longitude);
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
                <label className="form-label" htmlFor="email">Email Address</label>
                <Field name="email" type="email" className="form-input" placeholder="Enter your email" />
                <ErrorMessage name="email" component="span" className="form-error" />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="password">Password</label>
                <div className="password-input">
                  <Field
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Create a strong password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                <ErrorMessage name="password" component="span" className="form-error" />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
                <div className="password-input">
                  <Field
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                <ErrorMessage name="confirmPassword" component="span" className="form-error" />
              </div>

              <div className="checkbox-group">
                <label className="checkbox-label">
                  <Field name="acceptTerms" type="checkbox" className="checkbox-input" />
                  <span className="checkmark"></span>
                  I agree to the{' '}
                  <Link to="/terms" className="auth-link">Terms and Conditions</Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="auth-link">Privacy Policy</Link>
                </label>
                <ErrorMessage name="acceptTerms" component="span" className="form-error" />
              </div>

              <button
                type="submit"
                className="btn btn-primary auth-submit"
                disabled={isSubmitting || isRegisterLoading}
              >
                {isRegisterLoading ? <LoadingSpinner size="small" color="white" /> : 'Create Account'}
              </button>
            </Form>
          )}
        </Formik>

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

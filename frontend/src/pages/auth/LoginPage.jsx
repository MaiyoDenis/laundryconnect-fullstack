import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../hooks/useAuth';
import useAuthStore from '../../store/authStore';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import './AuthPages.css';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login, isLoginLoading } = useAuth();
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const redirectPath = user.role === 'customer' ? '/customer/dashboard' : 
                          user.role === 'staff' ? '/staff/dashboard' : 
                          '/admin/dashboard';
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const onSubmit = (data) => {
    login(data);
  };

  const demoAccounts = [
    { username: 'admin', password: 'admin123', role: 'Admin' },
    { username: 'staff1', password: 'staff123', role: 'Staff' },
    { username: 'john_doe', password: 'password123', role: 'Customer' },
  ];

  const fillDemoAccount = (account) => {
    document.querySelector('input[name="username"]').value = account.username;
    document.querySelector('input[name="password"]').value = account.password;
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <Link to="/" className="auth-brand">
            🧺 LaundryConnect Kenya
          </Link>
          <h1>Welcome Back</h1>
          <p>Sign in to your account to continue</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              {...register('username', { 
                required: 'Username is required',
                minLength: { value: 3, message: 'Username must be at least 3 characters' }
              })}
              type="text"
              className={`form-input ${errors.username ? 'error' : ''}`}
              placeholder="Enter your username"
            />
            {errors.username && (
              <span className="form-error">{errors.username.message}</span>
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
                placeholder="Enter your password"
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

          <button
            type="submit"
            className="btn btn-primary auth-submit"
            disabled={isLoginLoading}
          >
            {isLoginLoading ? <LoadingSpinner size="small" color="white" /> : 'Sign In'}
          </button>
        </form>

        {/* Demo Accounts */}
        <div className="demo-accounts">
          <h3>Demo Accounts</h3>
          <p>Click to auto-fill login credentials:</p>
          <div className="demo-buttons">
            {demoAccounts.map((account, index) => (
              <button
                key={index}
                type="button"
                className="demo-btn"
                onClick={() => fillDemoAccount(account)}
              >
                <strong>{account.role}</strong>
                <span>{account.username}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="auth-link">
              Create one here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
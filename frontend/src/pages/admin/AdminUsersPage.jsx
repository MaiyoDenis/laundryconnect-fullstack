import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { usersAPI } from '../../services/userService';
import { USER_ROLES } from '../../constants';
import toast from 'react-hot-toast';
import './AdminPages.css';

const AdminUsersPage = () => {
  const [filters, setFilters] = useState({
    role: '',
    search: '',
    status: ''
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  // Get users
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users', filters],
    queryFn: async () => {
      try {
        const res = await usersAPI.getUsers(filters);
        return res ?? [];
      } catch {
        return [];
      }
    }
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: usersAPI.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User created successfully');
      setShowCreateModal(false);
      reset();
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to create user');
    }
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: ({ id, updates }) => usersAPI.updateUser(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User updated successfully');
      setShowEditModal(false);
      setSelectedUser(null);
      reset();
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to update user');
    }
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: usersAPI.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to delete user');
    }
  });

  // Toggle user status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, is_active }) => usersAPI.updateUser(id, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User status updated');
    },
    onError: () => {
      toast.error('Failed to update user status');
    }
  });

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({ role: '', search: '', status: '' });
  };

  const handleCreateUser = (data) => {
    createUserMutation.mutate(data);
  };

  const handleUpdateUser = (data) => {
    updateUserMutation.mutate({ id: selectedUser.id, updates: data });
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteUserMutation.mutate(userId);
    }
  };

  const handleToggleStatus = (user) => {
    toggleStatusMutation.mutate({ 
      id: user.id, 
      is_active: !user.is_active 
    });
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setValue('username', user.username);
    setValue('email', user.email);
    setValue('role', user.role);
    setValue('is_active', user.is_active);
    setShowEditModal(true);
  };

  // Calculate stats
  const stats = {
    total: users.length,
    customers: users.filter(u => u.role === USER_ROLES.CUSTOMER).length,
    staff: users.filter(u => u.role === USER_ROLES.STAFF).length,
    admins: users.filter(u => u.role === USER_ROLES.ADMIN).length,
    active: users.filter(u => u.is_active).length,
    inactive: users.filter(u => !u.is_active).length
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <LoadingSpinner text="Loading users..." />
      </div>
    );
  }

  return (
    <div className="admin-users-page">
      <div className="page-header">
        <div>
          <h1>User Management 👤</h1>
          <p>Manage system users, roles, and permissions</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary"
        >
          + Add New User
        </button>
      </div>

      {/* User Stats */}
      <div className="user-stats">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total Users</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🛒</div>
          <div className="stat-content">
            <div className="stat-number">{stats.customers}</div>
            <div className="stat-label">Customers</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👷</div>
          <div className="stat-content">
            <div className="stat-number">{stats.staff}</div>
            <div className="stat-label">Staff</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👑</div>
          <div className="stat-content">
            <div className="stat-number">{stats.admins}</div>
            <div className="stat-label">Admins</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-number">{stats.active}</div>
            <div className="stat-label">Active</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">❌</div>
          <div className="stat-content">
            <div className="stat-number">{stats.inactive}</div>
            <div className="stat-label">Inactive</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-grid">
          <div className="filter-group">
            <label>Search Users</label>
            <input
              type="text"
              placeholder="Search by username or email..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="form-input"
            />
          </div>
          
          <div className="filter-group">
            <label>Role</label>
            <select
              value={filters.role}
              onChange={(e) => handleFilterChange('role', e.target.value)}
              className="form-select"
            >
              <option value="">All Roles</option>
              <option value={USER_ROLES.CUSTOMER}>Customer</option>
              <option value={USER_ROLES.STAFF}>Staff</option>
              <option value={USER_ROLES.ADMIN}>Admin</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="form-select"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="filter-actions">
            <button onClick={clearFilters} className="btn btn-secondary">
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="users-table-container">
        {users.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👤</div>
            <h3>No users found</h3>
            <p>No users match your current filters</p>
          </div>
        ) : (
          <div className="users-table">
            <div className="table-header">
              <div>User Details</div>
              <div>Role</div>
              <div>Status</div>
              <div>Created</div>
              <div>Last Login</div>
              <div>Actions</div>
            </div>
            
            {users.map(user => (
              <div key={user.id} className="table-row">
                <div className="user-details">
                  <div className="user-avatar">
                    {user.username?.charAt(0).toUpperCase()}
                  </div>
                  <div className="user-info">
                    <strong>{user.username}</strong>
                    <span>{user.email}</span>
                  </div>
                </div>
                
                <div className="user-role">
                  <span className={`role-badge ${user.role}`}>
                    {user.role?.toUpperCase()}
                  </span>
                </div>
                
                <div className="user-status">
                  <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <div className="user-created">
                  {new Date(user.created_at).toLocaleDateString()}
                </div>
                
                <div className="user-login">
                  {user.last_login 
                    ? new Date(user.last_login).toLocaleDateString()
                    : 'Never'
                  }
                </div>
                
                <div className="user-actions">
                  <div className="action-buttons">
                    <button
                      onClick={() => openEditModal(user)}
                      className="btn btn-primary btn-small"
                      disabled={updateUserMutation.isPending}
                    >
                      Edit
                    </button>
                    
                    <button
                      onClick={() => handleToggleStatus(user)}
                      className={`btn btn-small ${user.is_active ? 'btn-warning' : 'btn-success'}`}
                      disabled={toggleStatusMutation.isPending}
                    >
                      {user.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="btn btn-danger btn-small"
                      disabled={deleteUserMutation.isPending}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <UserModal
          title="Create New User"
          onSubmit={handleCreateUser}
          onClose={() => {
            setShowCreateModal(false);
            reset();
          }}
          isLoading={createUserMutation.isPending}
          register={register}
          handleSubmit={handleSubmit}
          errors={errors}
          isCreate={true}
        />
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <UserModal
          title="Edit User"
          onSubmit={handleUpdateUser}
          onClose={() => {
            setShowEditModal(false);
            setSelectedUser(null);
            reset();
          }}
          isLoading={updateUserMutation.isPending}
          register={register}
          handleSubmit={handleSubmit}
          errors={errors}
          isCreate={false}
        />
      )}
    </div>
  );
};

// User Modal Component
const UserModal = ({ title, onSubmit, onClose, isLoading, register, handleSubmit, errors, isCreate }) => {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>{title}</h3>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        
        <div className="modal-content">
          <form onSubmit={handleSubmit(onSubmit)} className="user-form">
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                {...register('username', { 
                  required: 'Username is required',
                  minLength: { value: 3, message: 'Username must be at least 3 characters' }
                })}
                type="text"
                className={`form-input ${errors.username ? 'error' : ''}`}
                placeholder="Enter username"
              />
              {errors.username && (
                <span className="form-error">{errors.username.message}</span>
              )}
            </div>
            
            <div className="form-group">
              <label className="form-label">Email</label>
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
                placeholder="Enter email"
              />
              {errors.email && (
                <span className="form-error">{errors.email.message}</span>
              )}
            </div>
            
            {isCreate && (
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  {...register('password', { 
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' }
                  })}
                  type="password"
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  placeholder="Enter password"
                />
                {errors.password && (
                  <span className="form-error">{errors.password.message}</span>
                )}
              </div>
            )}
            
            <div className="form-group">
              <label className="form-label">Role</label>
              <select
                {...register('role', { required: 'Role is required' })}
                className={`form-select ${errors.role ? 'error' : ''}`}
              >
                <option value="">Select role...</option>
                <option value={USER_ROLES.CUSTOMER}>Customer</option>
                <option value={USER_ROLES.STAFF}>Staff</option>
                <option value={USER_ROLES.ADMIN}>Admin</option>
              </select>
              {errors.role && (
                <span className="form-error">{errors.role.message}</span>
              )}
            </div>
            
            {!isCreate && (
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    {...register('is_active')}
                    type="checkbox"
                    className="checkbox-input"
                  />
                  <span className="checkmark"></span>
                  Active User
                </label>
              </div>
            )}
            
            <div className="form-actions">
              <button type="button" onClick={onClose} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={isLoading}>
                {isLoading ? <LoadingSpinner size="small" color="white" /> : (isCreate ? 'Create User' : 'Update User')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminUsersPage;
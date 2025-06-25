import api from './api';

export const usersAPI = {
  // Get all users (admin only)
  getUsers: async (filters = {}) => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params.append(key, value);
      }
    });
    
    const response = await api.get(`/users?${params.toString()}`);
    return response.data;
  },

  // Get single user
  getUser: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  // Create user (admin only)
  createUser: async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  // Update user (admin only)
  updateUser: async (userId, updates) => {
    const response = await api.put(`/users/${userId}`, updates);
    return response.data;
  },

  // Delete user (admin only)
  deleteUser: async (userId) => {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  },

  // Change user password
  changePassword: async (userId, passwordData) => {
    const response = await api.put(`/users/${userId}/password`, passwordData);
    return response.data;
  },

  // Toggle user status
  toggleUserStatus: async (userId) => {
    const response = await api.put(`/users/${userId}/toggle-status`);
    return response.data;
  },

  // Get user activity log
  getUserActivity: async (userId) => {
    const response = await api.get(`/users/${userId}/activity`);
    return response.data;
  },
};
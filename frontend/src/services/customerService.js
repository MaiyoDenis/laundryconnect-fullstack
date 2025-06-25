import api from './api';

export const customersAPI = {
  // Get all customers (staff/admin only)
  getCustomers: async (filters = {}) => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params.append(key, value);
      }
    });
    
    const response = await api.get(`/customers?${params.toString()}`);
    return response.data;
  },

  // Get single customer
  getCustomer: async (customerId) => {
    const response = await api.get(`/customers/${customerId}`);
    return response.data;
  },

  // Get current customer profile
  getProfile: async () => {
    const response = await api.get('/customers/me');
    return response.data;
  },

  // Update customer profile
  updateProfile: async (profileData) => {
    const response = await api.put('/customers/me', profileData);
    return response.data;
  },

  // Update customer (staff/admin only)
  updateCustomer: async (customerId, updates) => {
    const response = await api.put(`/customers/${customerId}`, updates);
    return response.data;
  },

  // Create customer profile
  createCustomer: async (customerData) => {
    const response = await api.post('/customers', customerData);
    return response.data;
  },

  // Delete customer (admin only)
  deleteCustomer: async (customerId) => {
    const response = await api.delete(`/customers/${customerId}`);
    return response.data;
  },

  // Get customer statistics
  getCustomerStats: async (customerId) => {
    const response = await api.get(`/customers/${customerId}/stats`);
    return response.data;
  },

  // Get customer orders
  getCustomerOrders: async (customerId, filters = {}) => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params.append(key, value);
      }
    });
    
    const response = await api.get(`/customers/${customerId}/orders?${params.toString()}`);
    return response.data;
  },
};
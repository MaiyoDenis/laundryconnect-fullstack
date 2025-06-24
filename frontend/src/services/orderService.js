
import api from './api';

export const orderService = {
  // Get orders with filters
  getOrders: async (filters = {}) => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params.append(key, value);
      }
    });
    
    const response = await api.get(`/orders?${params.toString()}`);
    return response.data;
  },

  // Get single order
  getOrder: async (orderId) => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  },

  // Create order
  createOrder: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  // Update order
  updateOrder: async (orderId, updates) => {
    const response = await api.put(`/orders/${orderId}`, updates);
    return response.data;
  },

  // Update order status
  updateOrderStatus: async (orderId, status) => {
    const response = await api.put(`/orders/${orderId}/status`, { status });
    return response.data;
  },

  // Update order weight and pricing
  updateOrderWeight: async (orderId, actualWeight) => {
    const response = await api.put(`/orders/${orderId}/weight`, {
      actual_weight: actualWeight
    });
    return response.data;
  },

  // Assign delivery personnel
  assignDeliveryPersonnel: async (orderId, personnelId) => {
    const response = await api.put(`/orders/${orderId}/assign`, {
      personnel_id: personnelId
    });
    return response.data;
  },

  // Get order history/timeline
  getOrderHistory: async (orderId) => {
    const response = await api.get(`/orders/${orderId}/history`);
    return response.data;
  },

  // Delete order
  deleteOrder: async (orderId) => {
    const response = await api.delete(`/orders/${orderId}`);
    return response.data;
  },

  // Get pricing estimate
  getPricingEstimate: async (serviceId, weight) => {
    const response = await api.post('/orders/estimate', {
      service_id: serviceId,
      weight: weight
    });
    return response.data;
  }
};
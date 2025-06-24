import api from './api';

export const serviceService = {
  // Get all services
  getServices: async () => {
    const response = await api.get('/services');
    return response.data;
  },

  // Get single service
  getService: async (serviceId) => {
    const response = await api.get(`/services/${serviceId}`);
    return response.data;
  },

  // Create service (admin only)
  createService: async (serviceData) => {
    const response = await api.post('/services', serviceData);
    return response.data;
  },

  // Update service (admin only)
  updateService: async (serviceId, updates) => {
    const response = await api.put(`/services/${serviceId}`, updates);
    return response.data;
  },

  // Delete service (admin only)
  deleteService: async (serviceId) => {
    const response = await api.delete(`/services/${serviceId}`);
    return response.data;
  },

  // Get service pricing tiers
  getPricingTiers: async () => {
    const response = await api.get('/services/pricing-tiers');
    return response.data;
  }
};
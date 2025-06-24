import { create } from 'zustand';

const useOrderStore = create((set, get) => ({
  // State
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,
  
  // Filters
  filters: {
    status: '',
    dateFrom: null,
    dateTo: null,
    search: '',
    serviceType: ''
  },

  // Actions
  setOrders: (orders) => set({ orders, loading: false }),
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error, loading: false }),
  
  setCurrentOrder: (order) => set({ currentOrder: order }),
  
  addOrder: (order) => {
    const { orders } = get();
    set({ orders: [order, ...orders] });
  },
  
  updateOrder: (orderId, updates) => {
    const { orders, currentOrder } = get();
    
    // Update in orders list
    const updatedOrders = orders.map(order =>
      order.id === orderId ? { ...order, ...updates } : order
    );
    set({ orders: updatedOrders });
    
    // Update current order if it matches
    if (currentOrder && currentOrder.id === orderId) {
      set({ currentOrder: { ...currentOrder, ...updates } });
    }
  },
  
  removeOrder: (orderId) => {
    const { orders, currentOrder } = get();
    const filteredOrders = orders.filter(order => order.id !== orderId);
    set({ orders: filteredOrders });
    
    // Clear current order if it matches
    if (currentOrder && currentOrder.id === orderId) {
      set({ currentOrder: null });
    }
  },
  
  setFilters: (newFilters) => {
    const { filters } = get();
    set({ filters: { ...filters, ...newFilters } });
  },
  
  clearFilters: () => {
    set({
      filters: {
        status: '',
        dateFrom: null,
        dateTo: null,
        search: '',
        serviceType: ''
      }
    });
  },
  
  // Computed getters
  getOrderById: (orderId) => {
    const { orders } = get();
    return orders.find(order => order.id === orderId);
  },
  
  getOrdersByStatus: (status) => {
    const { orders } = get();
    return orders.filter(order => order.status === status);
  },
  
  getFilteredOrders: () => {
    const { orders, filters } = get();
    
    return orders.filter(order => {
      // Status filter
      if (filters.status && order.status !== filters.status) {
        return false;
      }
      
      // Service type filter
      if (filters.serviceType && order.service?.service_type !== filters.serviceType) {
        return false;
      }
      
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const searchFields = [
          order.order_number,
          order.customer?.name || '',
          order.service?.name || ''
        ].join(' ').toLowerCase();
        
        if (!searchFields.includes(searchLower)) {
          return false;
        }
      }
      
      // Date filters
      if (filters.dateFrom && new Date(order.created_at) < new Date(filters.dateFrom)) {
        return false;
      }
      
      if (filters.dateTo && new Date(order.created_at) > new Date(filters.dateTo)) {
        return false;
      }
      
      return true;
    });
  },

  // Dashboard stats
  getOrderStats: () => {
    const { orders } = get();
    
    const stats = {
      total: orders.length,
      pending: 0,
      inProgress: 0,
      completed: 0,
      cancelled: 0,
      totalRevenue: 0
    };

    orders.forEach(order => {
      // Count by status
      if (['placed', 'confirmed'].includes(order.status)) {
        stats.pending++;
      } else if (['collected', 'washing', 'ironing', 'ready', 'out_for_delivery'].includes(order.status)) {
        stats.inProgress++;
      } else if (order.status === 'delivered') {
        stats.completed++;
      } else if (order.status === 'cancelled') {
        stats.cancelled++;
      }

      // Calculate revenue (only from delivered orders)
      if (order.status === 'delivered') {
        stats.totalRevenue += order.final_price || order.total_price || 0;
      }
    });

    return stats;
  }
}));

export default useOrderStore;
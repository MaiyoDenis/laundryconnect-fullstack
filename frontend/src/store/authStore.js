import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,

      // Actions
      setAuth: (user, token) => {
        set({
          user,
          token,
          isAuthenticated: true,
          loading: false
        });
      },

      refreshUserProfile: async () => {
        const { token } = get();
        if (!token) return;
        const authService = (await import('../services/authService')).authService;
        set({ loading: true });
        try {
          const userData = await authService.fetchCurrentUser(token);
          if (userData) {
            set({ user: userData });
          }
        } catch (error) {
          console.error('Failed to refresh user profile', error);
        } finally {
          set({ loading: false });
        }
      },

      setUser: (user) => {
        set({ user });
      },

      setLoading: (loading) => {
        set({ loading });
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          loading: false
        });
        localStorage.removeItem('auth-storage');
      },

      // Getters
      getUser: () => get().user,
      getToken: () => get().token,
      hasRole: (role) => {
        const { user } = get();
        if (!user) return false;
        
        if (Array.isArray(role)) {
          return role.includes(user.role);
        }
        
        return user.role === role;
      },

      isCustomer: () => get().hasRole('customer'),
      isStaff: () => get().hasRole('staff'),
      isAdmin: () => get().hasRole('admin'),

      // Customer profile management
      updateCustomerProfile: (profileData) => {
        const { user } = get();
        if (user && user.customer) {
          set({
            user: {
              ...user,
              customer: {
                ...user.customer,
                ...profileData
              }
            }
          });
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
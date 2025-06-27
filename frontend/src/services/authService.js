import api from './api';

export const authService = {
  login: async (credentials) => {
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);
    
    const response = await api.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    // Save token to auth store and fetch user and customer profile
    const { access_token, token_type } = response.data;
    if (access_token && token_type) {
      const useAuthStore = (await import('../store/authStore')).default;
      useAuthStore.getState().setAuth(null, access_token);
      try {
        const userResponse = await api.get('/auth/me', {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        });
        let userData = userResponse.data;
        if (userData.role === 'customer') {
          try {
            const customerResponse = await api.get('/customers/me', {
              headers: {
                Authorization: `Bearer ${access_token}`,
              },
            });
            userData = { ...userData, customer: customerResponse.data };
          } catch (error) {
            console.error('Failed to fetch customer profile after login', error);
          }
        }
        useAuthStore.getState().setAuth(userData, access_token);
      } catch (error) {
        console.error('Failed to fetch user profile after login', error);
      }
    }
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/customers/me', profileData);
    return response.data;
  },

  logout: async () => {
    // Optional: implement server-side logout if needed
    return Promise.resolve();
  },

  fetchCurrentUser: async (token) => {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    try {
      const userResponse = await api.get('/auth/me', { headers });
      let userData = userResponse.data;
      if (userData.role === 'customer') {
        try {
          const customerResponse = await api.get('/customers/me', { headers });
          userData = { ...userData, customer: customerResponse.data };
        } catch (error) {
          console.error('Failed to fetch customer profile', error);
        }
      }
      return userData;
    } catch (error) {
      console.error('Failed to fetch user profile', error);
      return null;
    }
  }
};

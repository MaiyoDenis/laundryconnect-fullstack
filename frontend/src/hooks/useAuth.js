import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import useAuthStore from '../store/authStore';
import { USER_ROLES } from '../constants';
import toast from 'react-hot-toast';

export const useAuth = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { 
    setAuth, 
    logout: logoutStore, 
    setLoading, 
    user, 
    isAuthenticated,
    token 
  } = useAuthStore();

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authService.login,
    onMutate: () => {
      logout();
      setLoading(true);
    },
    onSuccess: async (data) => {
      try {
        // Store token temporarily for the getCurrentUser call
        const tempToken = data.access_token;
        
        // Get user info with the new token
        const userResponse = await authService.getCurrentUser();
        
        // Set auth in store with both user and token
        setAuth(userResponse, tempToken);
        
        // Navigate based on role
        const redirectPath = 
          userResponse.role === USER_ROLES.CUSTOMER ? '/customer/dashboard' :
          userResponse.role === USER_ROLES.STAFF ? '/staff/dashboard' :
          userResponse.role === USER_ROLES.ADMIN ? '/admin/dashboard' :
          '/';
        
        navigate(redirectPath, { replace: true });
        toast.success(`Welcome back, ${userResponse.username}!`);
      } catch (error) {
        setLoading(false);
        toast.error('Failed to get user information');
        console.error('Login error:', error);
      }
    },
    onError: (error) => {
      setLoading(false);
      const message = error.response?.data?.detail || 'Login failed. Please check your credentials.';
      toast.error(message);
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: () => {
      toast.success('Registration successful! Please login with your credentials.');
      navigate('/login');
    },
    onError: (error) => {
      const message = error.response?.data?.detail || 'Registration failed. Please try again.';
      toast.error(message);
    },
  });

  // Get current user query (only runs when authenticated)
  const userQuery = useQuery({
    queryKey: ['currentUser'],
    queryFn: authService.getCurrentUser,
    enabled: isAuthenticated && !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on 401 errors
      if (error.response?.status === 401) {
        return false;
      }
      return failureCount < 2;
    },
    onError: (error) => {
      if (error.response?.status === 401) {
        // Token is invalid, logout user
        logout();
      }
    }
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: authService.updateProfile,
    onSuccess: (updatedUser) => {
      // Update user in store
      setAuth(updatedUser, token);
      queryClient.setQueryData(['currentUser'], updatedUser);
      toast.success('Profile updated successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.detail || 'Failed to update profile';
      toast.error(message);
    },
  });

  // Logout function
  const logout = async () => {
    try {
      // Call server logout endpoint if it exists
      await authService.logout();
    } catch (error) {
      // Even if server logout fails, continue with client logout
      console.warn('Server logout failed:', error);
    } finally {
      // Clear client state
      logoutStore();
      queryClient.clear();
      navigate('/', { replace: true });
      toast.success('Logged out successfully');
    }
  };

  // Check if user has specific permission
  const hasPermission = (permission) => {
    if (!user) return false;
    
    const rolePermissions = {
      [USER_ROLES.CUSTOMER]: ['view_own_orders', 'create_order', 'update_own_profile'],
      [USER_ROLES.STAFF]: ['view_all_orders', 'update_orders', 'view_customers', 'update_order_status'],
      [USER_ROLES.ADMIN]: ['*'] // Admin has all permissions
    };
    
    const userPermissions = rolePermissions[user.role] || [];
    return userPermissions.includes('*') || userPermissions.includes(permission);
  };

  // Get user role helpers
  const isCustomer = () => user?.role === USER_ROLES.CUSTOMER;
  const isStaff = () => user?.role === USER_ROLES.STAFF;
  const isAdmin = () => user?.role === USER_ROLES.ADMIN;
  const isStaffOrAdmin = () => isStaff() || isAdmin();

  return {
    // Actions
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout,
    updateProfile: updateProfileMutation.mutate,
    
    // State
    user,
    isAuthenticated,
    token,
    
    // Loading states
    isLoading: loginMutation.isPending || registerMutation.isPending || userQuery.isLoading,
    isLoginLoading: loginMutation.isPending,
    isRegisterLoading: registerMutation.isPending,
    isUpdatingProfile: updateProfileMutation.isPending,
    
    // Errors
    loginError: loginMutation.error,
    registerError: registerMutation.error,
    userError: userQuery.error,
    
    // Helpers
    hasPermission,
    isCustomer,
    isStaff,
    isAdmin,
    isStaffOrAdmin,
    
    // Query helpers
    refetchUser: userQuery.refetch,
  };
};

// Hook for checking authentication status
export const useAuthStatus = () => {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  
  return {
    isAuthenticated,
    user,
    isLoading,
    isCustomer: user?.role === USER_ROLES.CUSTOMER,
    isStaff: user?.role === USER_ROLES.STAFF,
    isAdmin: user?.role === USER_ROLES.ADMIN,
  };
};
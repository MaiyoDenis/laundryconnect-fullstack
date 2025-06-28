import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { serviceService } from '../services/serviceService';

// Hook to fetch all services
export function useServices() {
  return useQuery({
    queryKey: ['services'],
    queryFn: () => serviceService.getServices(),
  });
}

// Hook to fetch a single service by ID
export function useService(serviceId) {
  return useQuery(['service', serviceId], () => serviceService.getService(serviceId), {
    enabled: !!serviceId,
  });
}

// Hook to create a new service (admin only)
export function useCreateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: serviceService.createService,
    onSuccess: () => {
      queryClient.invalidateQueries(['services']);
    },
  });
}

// Hook to update a service by ID (admin only)
export function useUpdateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ serviceId, updates }) => serviceService.updateService(serviceId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries(['services']);
    },
  });
}

// Hook to delete a service by ID (admin only)
export function useDeleteService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: serviceService.deleteService,
    onSuccess: () => {
      queryClient.invalidateQueries(['services']);
    },
  });
}

// Hook to get service pricing tiers
export function usePricingTiers() {
  return useQuery(['pricingTiers'], () => serviceService.getPricingTiers());
}

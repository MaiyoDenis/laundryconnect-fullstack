import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService } from '../services/orderService';

// Hook to fetch orders list with optional filters
export function useOrders(filters = {}) {
  return useQuery(['orders', filters], () => orderService.getOrders(filters), {
    keepPreviousData: true,
  });
}

// Hook to fetch a single order by ID
export function useOrder(orderId) {
  return useQuery(['order', orderId], () => orderService.getOrder(orderId), {
    enabled: !!orderId,
  });
}

// Hook to create a new order
export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation(orderService.createOrder, {
    onSuccess: () => {
      queryClient.invalidateQueries(['orders']);
    },
  });
}

// Hook to update an order by ID
export function useUpdateOrder() {
  const queryClient = useQueryClient();
  return useMutation(({ orderId, updates }) => orderService.updateOrder(orderId, updates), {
    onSuccess: () => {
      queryClient.invalidateQueries(['orders']);
    },
  });
}

// Hook to update order status
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation(({ orderId, status }) => orderService.updateOrderStatus(orderId, status), {
    onSuccess: () => {
      queryClient.invalidateQueries(['orders']);
    },
  });
}

// Hook to update order weight
export function useUpdateOrderWeight() {
  const queryClient = useQueryClient();
  return useMutation(({ orderId, actualWeight }) => orderService.updateOrderWeight(orderId, actualWeight), {
    onSuccess: () => {
      queryClient.invalidateQueries(['orders']);
    },
  });
}

// Hook to assign delivery personnel
export function useAssignDeliveryPersonnel() {
  const queryClient = useQueryClient();
  return useMutation(({ orderId, personnelId }) => orderService.assignDeliveryPersonnel(orderId, personnelId), {
    onSuccess: () => {
      queryClient.invalidateQueries(['orders']);
    },
  });
}

// Hook to get order history/timeline
export function useOrderHistory(orderId) {
  return useQuery(['orderHistory', orderId], () => orderService.getOrderHistory(orderId), {
    enabled: !!orderId,
  });
}

// Hook to delete an order
export function useDeleteOrder() {
  const queryClient = useQueryClient();
  return useMutation(orderService.deleteOrder, {
    onSuccess: () => {
      queryClient.invalidateQueries(['orders']);
    },
  });
}

// Hook to get pricing estimate
export function usePricingEstimate() {
  return useMutation(({ serviceId, weight }) => orderService.getPricingEstimate(serviceId, weight));
}

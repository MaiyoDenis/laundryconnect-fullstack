// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// User Roles
export const USER_ROLES = {
  CUSTOMER: 'customer',
  STAFF: 'staff',
  ADMIN: 'admin'
};

// Order Statuses
export const ORDER_STATUS = {
  PLACED: 'placed',
  CONFIRMED: 'confirmed',
  COLLECTED: 'collected',
  WASHING: 'washing',
  IRONING: 'ironing',
  READY: 'ready',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

// Service Types
export const SERVICE_TYPES = {
  STANDARD: 'standard',
  EXPRESS: 'express',
  PREMIUM: 'premium'
};

// Service Options
export const SERVICE_OPTIONS = {
  WASHING: 'washing',
  IRONING: 'ironing',
  BOTH: 'both'
};

// Pricing Multipliers
export const PRICING_MULTIPLIERS = {
  [SERVICE_TYPES.STANDARD]: 1.0,
  [SERVICE_TYPES.EXPRESS]: 1.5,
  [SERVICE_TYPES.PREMIUM]: 2.0
};

// Pickup Times
export const PICKUP_TIMES = {
  MORNING: 'morning',
  AFTERNOON: 'afternoon',
  EVENING: 'evening'
};

export const PICKUP_TIME_LABELS = {
  [PICKUP_TIMES.MORNING]: 'Morning (8:00 AM - 12:00 PM)',
  [PICKUP_TIMES.AFTERNOON]: 'Afternoon (12:00 PM - 4:00 PM)',
  [PICKUP_TIMES.EVENING]: 'Evening (4:00 PM - 8:00 PM)'
};

// Status Display Labels
export const STATUS_LABELS = {
  [ORDER_STATUS.PLACED]: 'Order Placed',
  [ORDER_STATUS.CONFIRMED]: 'Confirmed',
  [ORDER_STATUS.COLLECTED]: 'Collected',
  [ORDER_STATUS.WASHING]: 'Washing',
  [ORDER_STATUS.IRONING]: 'Ironing',
  [ORDER_STATUS.READY]: 'Ready for Pickup',
  [ORDER_STATUS.OUT_FOR_DELIVERY]: 'Out for Delivery',
  [ORDER_STATUS.DELIVERED]: 'Delivered',
  [ORDER_STATUS.CANCELLED]: 'Cancelled'
};

// Status Colors for badges
export const STATUS_COLORS = {
  [ORDER_STATUS.PLACED]: 'secondary',
  [ORDER_STATUS.CONFIRMED]: 'info',
  [ORDER_STATUS.COLLECTED]: 'info',
  [ORDER_STATUS.WASHING]: 'warning',
  [ORDER_STATUS.IRONING]: 'warning',
  [ORDER_STATUS.READY]: 'success',
  [ORDER_STATUS.OUT_FOR_DELIVERY]: 'info',
  [ORDER_STATUS.DELIVERED]: 'success',
  [ORDER_STATUS.CANCELLED]: 'error'
};
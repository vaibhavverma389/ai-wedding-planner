import { apiClient } from './client.js';

export const checkoutApi = {
  initializeCheckout: (data) => apiClient.post('/checkout/initialize', data),
  verifyPayment: (data) => apiClient.post('/payments/verify', data)
};

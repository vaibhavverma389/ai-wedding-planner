import { apiClient } from './client.js';

export const cartApi = {
  getCart: () => apiClient.get('/cart'),
  addToCart: (itemData) => apiClient.post('/cart/items', itemData),
  updateItemQuantity: (itemId, quantity) => apiClient.patch(`/cart/items/${itemId}`, { quantity }),
  removeItem: (itemId) => apiClient.delete(`/cart/items/${itemId}`),
  applyCoupon: (couponCode) => apiClient.post('/cart/coupon', { couponCode })
};

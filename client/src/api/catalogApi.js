import { apiClient } from './client.js';

export const catalogApi = {
  getCategories: () => apiClient.get('/categories'),
  getCategoryBySlug: (slug) => apiClient.get(`/categories/${slug}`),
  getListings: (params = {}) => apiClient.get('/listings', { params }),
  getListingBySlug: (slug) => apiClient.get(`/listings/${slug}`),
  getListingById: (id) => apiClient.get(`/listings/id/${id}`),
  checkAvailability: (params) => apiClient.get('/availability/check', { params })
};

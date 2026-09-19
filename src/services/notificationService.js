/**
 * services/notificationService.js
 * API service for push notification management — uses the central Axios instance.
 */

import api from './api';

/**
 * Send a push notification to users.
 * @param {Object} payload - { title, subtitle, body, imageUrl, targetType, topic, targetUserId, data }
 */
export const sendNotification = async (payload) => {
  const response = await api.post('/api/notifications/send', payload);
  return response.data;
};

/**
 * Fetch paginated notification history.
 * @param {Object} params - { page, limit, targetType, status }
 */
export const getNotifications = async (params = {}) => {
  const response = await api.get('/api/notifications', { params });
  return response.data;
};

/**
 * Delete a notification history record.
 * @param {string} id - Notification ID
 */
export const deleteNotification = async (id) => {
  const response = await api.delete(`/api/notifications/${id}`);
  return response.data;
};

/**
 * Fetch customer list for individual targeting (dropdown).
 * API returns: { success, data: { customers: [], pagination: {} } }
 */
export const getCustomers = async () => {
  const response = await api.get('/api/customers', { params: { limit: 500, page: 1 } });
  // Normalise across different response shapes
  const d = response.data;
  return d?.data?.customers ?? d?.customers ?? d?.data ?? [];
};


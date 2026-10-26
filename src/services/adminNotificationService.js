/**
 * services/adminNotificationService.js
 * API service for Admin In-App Notifications & real-time SSE stream.
 */

import api from './api';

/**
 * Fetch paginated admin notifications
 * @param {Object} params - { page, limit, unreadOnly }
 */
export const getAdminNotifications = async (params = {}) => {
  const response = await api.get('/api/admin-notifications', { params });
  return response.data;
};

/**
 * Get current unread notification count
 */
export const getAdminUnreadCount = async () => {
  const response = await api.get('/api/admin-notifications/unread-count');
  return response.data;
};

/**
 * Mark a single notification as read
 * @param {string} id - Notification ID
 */
export const markAdminNotificationAsRead = async (id) => {
  const response = await api.patch(`/api/admin-notifications/${id}/read`);
  return response.data;
};

/**
 * Mark all unread notifications as read
 */
export const markAllAdminNotificationsAsRead = async () => {
  const response = await api.patch('/api/admin-notifications/read-all');
  return response.data;
};

/**
 * Helper to build the SSE live stream URL including admin token
 */
export const getAdminNotificationStreamUrl = () => {
  const token = localStorage.getItem('admin_token');
  if (!token) return null;
  const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
  return `${baseUrl}/api/admin-notifications/stream?token=${encodeURIComponent(token)}`;
};

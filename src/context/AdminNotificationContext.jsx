import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';
import {
  getAdminNotifications,
  getAdminUnreadCount,
  markAdminNotificationAsRead,
  markAllAdminNotificationsAsRead,
  getAdminNotificationStreamUrl
} from '../services/adminNotificationService';

const AdminNotificationContext = createContext(null);

export const AdminNotificationProvider = ({ children }) => {
  const { token } = useAuth();
  const { showNotification } = useNotification();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const eventSourceRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  // ── Fetch notifications list & unread count ──────────────────────────────
  const fetchNotifications = useCallback(async (isBackground = false) => {
    if (!token) return;
    if (!isBackground) setLoading(true);
    try {
      const res = await getAdminNotifications({ limit: 30 });
      if (res.success && res.data) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(typeof res.data.unreadCount === 'number' ? res.data.unreadCount : 0);
      }
    } catch (err) {
      console.error('[AdminNotifications] Failed to load notifications:', err);
    } finally {
      if (!isBackground) setLoading(false);
    }
  }, [token]);

  // ── Mark a single notification as read ────────────────────────────────────
  const markAsRead = useCallback(async (id) => {
    if (!id) return;
    // Optimistic UI update
    setNotifications((prev) =>
      prev.map((item) => (item._id === id ? { ...item, isRead: true } : item))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await markAdminNotificationAsRead(id);
    } catch (err) {
      console.error('[AdminNotifications] Failed to mark as read:', err);
      // Re-sync on failure
      fetchNotifications(true);
    }
  }, [fetchNotifications]);

  // ── Mark all unread notifications as read ─────────────────────────────────
  const markAllAsRead = useCallback(async () => {
    // Optimistic UI update
    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
    setUnreadCount(0);

    try {
      await markAllAdminNotificationsAsRead();
    } catch (err) {
      console.error('[AdminNotifications] Failed to mark all as read:', err);
      // Re-sync on failure
      fetchNotifications(true);
    }
  }, [fetchNotifications]);

  // ── Real-Time SSE Stream Setup ────────────────────────────────────────────
  const connectSSE = useCallback(() => {
    if (!token) return;

    const streamUrl = getAdminNotificationStreamUrl();
    if (!streamUrl) return;

    // Close any prior connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    try {
      const es = new EventSource(streamUrl);
      eventSourceRef.current = es;

      es.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);

          if (payload.event === 'new_order_notification' && payload.notification) {
            const newNotif = payload.notification;

            // Prepend new notification avoiding duplicates
            setNotifications((prev) => {
              if (prev.some((n) => n._id === newNotif._id || (n.orderNumber && n.orderNumber === newNotif.orderNumber))) {
                return prev;
              }
              return [newNotif, ...prev];
            });

            // Update badge count
            if (typeof payload.unreadCount === 'number') {
              setUnreadCount(payload.unreadCount);
            } else {
              setUnreadCount((prev) => prev + 1);
            }

            // Visual Toast Alert in admin panel
            if (showNotification) {
              showNotification(
                newNotif.message || `New Order Received: #${newNotif.orderNumber || ''}`,
                'info'
              );
            }
          } else if (payload.event === 'read_status_changed') {
            setNotifications((prev) =>
              prev.map((n) => (n._id === payload.notificationId ? { ...n, isRead: true } : n))
            );
            if (typeof payload.unreadCount === 'number') {
              setUnreadCount(payload.unreadCount);
            }
          } else if (payload.event === 'all_read') {
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
            setUnreadCount(0);
          }
        } catch (parseErr) {
          // Ignore comments or keepalive messages
        }
      };

      es.onerror = () => {
        // Browser EventSource automatically attempts reconnection; we schedule a fallback re-init
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
          eventSourceRef.current = null;
        }
        if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = setTimeout(() => {
          connectSSE();
        }, 5000);
      };
    } catch (err) {
      console.warn('[AdminNotifications] SSE connection init error:', err);
    }
  }, [token, showNotification]);

  // Connect & load on login/mount
  useEffect(() => {
    if (!token) {
      setNotifications([]);
      setUnreadCount(0);
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      return;
    }

    fetchNotifications(false);
    connectSSE();

    // Fallback sync interval every 30 seconds to guarantee fresh data across tabs
    const interval = setInterval(() => {
      fetchNotifications(true);
    }, 30000);

    // Refresh immediately on window focus
    const onFocus = () => {
      fetchNotifications(true);
    };
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [token, fetchNotifications, connectSSE]);

  const value = {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refreshNotifications: fetchNotifications
  };

  return (
    <AdminNotificationContext.Provider value={value}>
      {children}
    </AdminNotificationContext.Provider>
  );
};

export const useAdminNotifications = () => {
  const context = useContext(AdminNotificationContext);
  if (!context) {
    throw new Error('useAdminNotifications must be used within an AdminNotificationProvider');
  }
  return context;
};

import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Menu, Sun, Moon, Bell, ChevronDown, User, LogOut, ShoppingBag, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useAdminNotifications } from '../context/AdminNotificationContext';

const formatTimeAgo = (dateStr) => {
  if (!dateStr) return '';
  const diffSec = Math.floor((new Date() - new Date(dateStr)) / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(dateStr).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
};

const Navbar = ({ toggleSidebar, toggleMobileSidebar }) => {
  const { admin, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const { notifications, unreadCount, loading: notifLoading, markAsRead, markAllAsRead } = useAdminNotifications();
  const location = useLocation();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  // Parse path breadcrumbs
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard Overview';
    if (path.startsWith('/products')) return 'Products Management';
    if (path.startsWith('/categories')) return 'Categories & Brands';
    if (path.startsWith('/orders')) return 'Orders Fulfilment';
    if (path.startsWith('/customers')) return 'Customers Accounts';
    if (path.startsWith('/coupons')) return 'Promo Coupons';
    if (path.startsWith('/inventory')) return 'Inventory Audit';
    if (path.startsWith('/banners')) return 'Storefront Sliders';
    if (path.startsWith('/reviews')) return 'Ratings & Moderations';
    if (path.startsWith('/reports')) return 'Business Analytics';
    if (path.startsWith('/settings')) return 'Global Configurations';
    if (path.startsWith('/logs')) return 'Admins Activity Logs';
    return 'Admin Core';
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 right-0 z-20 h-16 w-full glass-navbar flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        {/* Toggle buttons */}
        <button
          onClick={toggleMobileSidebar}
          className="lg:hidden text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
        >
          <Menu className="w-5 h-5" />
        </button>
        <button
          onClick={toggleSidebar}
          className="hidden lg:block text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight">
          {getPageTitle()}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Theme Mode toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-650 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition-colors"
          title="Toggle Theme"
        >
          {darkMode ? <Sun className="w-4.5 h-4.5 text-amber-500" /> : <Moon className="w-4.5 h-4.5" />}
        </button>

        {/* Notifications Bell & Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setNotifOpen(!notifOpen);
              setProfileOpen(false);
            }}
            aria-label="Notifications"
            title="Notifications"
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-650 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 relative transition-colors"
          >
            <Bell className="w-4.5 h-4.5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center leading-none">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <>
              {/* Overlay back to close */}
              <div onClick={() => setNotifOpen(false)} className="fixed inset-0 z-30" />
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl shadow-xl z-40 overflow-hidden">
                {/* Dropdown Header */}
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-800 dark:text-white">
                      Notifications
                    </span>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => markAllAsRead()}
                      className="text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 transition-colors"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                {/* Notifications List */}
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                  {notifLoading && notifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
                      Loading notifications...
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="py-8 px-4 text-center flex flex-col items-center justify-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                        <Bell className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        No notifications yet
                      </span>
                      <span className="text-[11px] text-slate-450 dark:text-slate-400">
                        New orders will show up here in real time
                      </span>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n._id}
                        onClick={() => {
                          if (!n.isRead) markAsRead(n._id);
                          setNotifOpen(false);
                          if (n.orderId) {
                            navigate(`/orders/${n.orderId}`);
                          } else {
                            navigate('/orders');
                          }
                        }}
                        className={`flex items-start gap-3 p-3.5 cursor-pointer transition-colors ${
                          !n.isRead
                            ? 'bg-brand-50/30 dark:bg-brand-950/20 hover:bg-brand-50/50 dark:hover:bg-brand-950/30'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0 mt-0.5">
                          <ShoppingBag className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <span
                              className={`text-xs truncate ${
                                !n.isRead
                                  ? 'font-bold text-slate-800 dark:text-white'
                                  : 'font-medium text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              {n.title || 'New Order Received'}
                            </span>
                            <span className="text-[10px] text-slate-450 dark:text-slate-400 shrink-0">
                              {formatTimeAgo(n.createdAt)}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-350 line-clamp-2 leading-relaxed">
                            {n.message}
                          </p>
                          {n.orderNumber && (
                            <div className="mt-1 flex items-center gap-2">
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                #{n.orderNumber}
                              </span>
                              {n.amount > 0 && (
                                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                                  ₹{Number(n.amount).toLocaleString('en-IN')}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        {!n.isRead && (
                          <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 mt-2" />
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Dropdown Footer */}
                <div className="p-2 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-850/50">
                  <Link
                    to="/orders"
                    onClick={() => setNotifOpen(false)}
                    className="flex items-center justify-center gap-1.5 w-full py-1.5 text-xs font-semibold text-slate-650 hover:text-brand-600 dark:text-slate-300 dark:hover:text-brand-400 rounded-lg transition-colors"
                  >
                    <span>View All Orders</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Profile Card dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setProfileOpen(!profileOpen);
              setNotifOpen(false);
            }}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center font-bold text-brand-600 dark:text-brand-400 text-xs">
              {admin?.name ? admin.name.substring(0, 2).toUpperCase() : 'AD'}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 leading-tight">
                {admin?.name}
              </span>
              <span className="text-[10px] text-slate-450 dark:text-slate-400 capitalize">
                {admin?.role}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {profileOpen && (
            <>
              {/* Overlay back to close */}
              <div onClick={() => setProfileOpen(false)} className="fixed inset-0 z-30" />
              <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl shadow-xl z-40 py-2">
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800/60 flex flex-col">
                  <span className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                    {admin?.name}
                  </span>
                  <span className="text-xs text-slate-450 dark:text-slate-400 truncate">
                    {admin?.email}
                  </span>
                </div>
                <Link
                  to="/settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-650 hover:bg-slate-50 dark:text-slate-350 dark:hover:bg-slate-800 transition-colors"
                >
                  <User className="w-4 h-4" />
                  My Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2.5 w-full text-left px-4 py-2 text-sm text-rose-650 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/20 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;

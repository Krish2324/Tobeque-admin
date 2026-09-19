import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, Send, Users, Tag, User, Upload, Image, Trash2, RefreshCw,
  CheckCircle2, XCircle, AlertCircle, ChevronDown, Eye, X,
  Megaphone, BarChart2, Clock, Smartphone, Link2
} from 'lucide-react';
import api from '../services/api';
import { getNotifications, sendNotification, deleteNotification, getCustomers } from '../services/notificationService';
import { resolveImageUrl } from '../utils/imageUrl';

// ─── Constants ──────────────────────────────────────────────────────────────────────

const TARGET_OPTIONS = [
  {
    value: 'all',
    label: 'All Users',
    icon: Users,
    description: 'Broadcast to every user with the app installed',
    disabled: false
  },
  {
    value: 'topic',
    label: 'By Topic / Segment',
    icon: Tag,
    description: 'Send to a specific user segment (e.g. Android, iOS)',
    disabled: true,
    comingSoon: true
  },
  {
    value: 'individual',
    label: 'Individual User',
    icon: User,
    description: 'Pick one specific customer to test with',
    disabled: false
  }
];

const TOPICS = [
  { value: 'all_users', label: 'All Users' },
  { value: 'android', label: 'Android Users' },
  { value: 'ios', label: 'iOS Users' },
  { value: 'new_arrivals', label: 'New Arrivals Subscribers' },
  { value: 'sale', label: 'Sale Subscribers' },
];

const STATUS_CONFIG = {
  sent: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10', label: 'Sent' },
  failed: { icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-500/10', label: 'Failed' },
  partial: { icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10', label: 'Partial' }
};

// ─── Phone Preview Component ──────────────────────────────────────────────────

const PhonePreview = ({ title, subtitle, body, imageUrl }) => {
  return (
    <div className="relative mx-auto w-[260px]">
      {/* Phone frame */}
      <div className="bg-slate-900 rounded-[2.5rem] p-3 shadow-2xl border-2 border-slate-700">
        {/* Screen */}
        <div className="bg-slate-100 dark:bg-slate-800 rounded-[2rem] overflow-hidden min-h-[420px]">
          {/* Status bar */}
          <div className="bg-slate-200 dark:bg-slate-700 flex justify-between items-center px-5 py-2 text-[10px] font-medium text-slate-600 dark:text-slate-300">
            <span>9:41</span>
            <div className="w-16 h-4 bg-slate-900 rounded-full mx-auto absolute left-1/2 -translate-x-1/2 top-5"></div>
            <span>●●●</span>
          </div>

          {/* Notification card */}
          <div className="m-3 mt-8 bg-white dark:bg-slate-700 rounded-2xl shadow-lg overflow-hidden">
            {/* Notification header */}
            <div className="flex items-center gap-2 px-3 pt-3 pb-1">
              <div className="w-5 h-5 bg-gradient-to-br from-violet-500 to-blue-500 rounded-md flex items-center justify-center">
                <Bell className="w-3 h-3 text-white" />
              </div>
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Tobeque
              </span>
              <span className="ml-auto text-[10px] text-slate-400">now</span>
            </div>

            {/* Notification content */}
            <div className="px-3 pb-3">
              <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                {title || 'Your notification title'}
              </p>
              {subtitle && (
                <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                  {subtitle}
                </p>
              )}
              <p className="text-[10px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed line-clamp-3">
                {body || 'Your notification message will appear here...'}
              </p>
              {imageUrl && (
                <div className="mt-2 rounded-lg overflow-hidden h-20">
                  <img
                    src={resolveImageUrl(imageUrl)}
                    alt="preview"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* App grid placeholder */}
          <div className="grid grid-cols-4 gap-3 px-5 py-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-600/50 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
      <p className="text-center text-xs text-slate-400 mt-3">Live Preview</p>
    </div>
  );
};

// ─── History Row Component ────────────────────────────────────────────────────

const HistoryRow = ({ notification, onDelete }) => {
  const StatusInfo = STATUS_CONFIG[notification.status] || STATUS_CONFIG.sent;
  const StatusIcon = StatusInfo.icon;

  return (
    <motion.tr
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
    >
      {/* Notification Info */}
      <td className="px-4 py-4">
        <div className="flex items-start gap-3">
          {notification.imageUrl ? (
            <img
              src={resolveImageUrl(notification.imageUrl)}
              alt=""
              className="w-10 h-10 rounded-lg object-cover shrink-0 border border-slate-200 dark:border-slate-700"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-100 to-blue-100 dark:from-violet-900/30 dark:to-blue-900/30 flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5 text-violet-500" />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate max-w-[220px]">
              {notification.title}
            </p>
            {notification.subtitle && (
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[220px]">
                {notification.subtitle}
              </p>
            )}
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 line-clamp-1 max-w-[220px]">
              {notification.body}
            </p>
          </div>
        </div>
      </td>

      {/* Target */}
      <td className="px-4 py-4">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          {notification.targetType === 'all' && <Users className="w-3 h-3" />}
          {notification.targetType === 'topic' && <Tag className="w-3 h-3" />}
          {notification.targetType === 'individual' && <User className="w-3 h-3" />}
          {notification.targetType === 'all'
            ? 'All Users'
            : notification.targetType === 'topic'
            ? notification.topic || 'Topic'
            : notification.targetUserId?.firstName
            ? `${notification.targetUserId.firstName} ${notification.targetUserId.lastName}`
            : 'Individual'}
        </span>
      </td>

      {/* Status */}
      <td className="px-4 py-4">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${StatusInfo.bg} ${StatusInfo.color}`}>
          <StatusIcon className="w-3 h-3" />
          {StatusInfo.label}
        </span>
      </td>

      {/* Sent At */}
      <td className="px-4 py-4 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          {new Date(notification.createdAt).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </td>

      {/* Actions */}
      <td className="px-4 py-4">
        <button
          onClick={() => onDelete(notification._id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"
          title="Delete from history"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </td>
    </motion.tr>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const PushNotifications = () => {
  // Form state
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [body, setBody] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageMode, setImageMode] = useState('url'); // 'url' | 'upload'
  const [imageUploading, setImageUploading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState('');
  const imageFileRef = useRef(null);
  const [targetType, setTargetType] = useState('all');
  const [targetUserId, setTargetUserId] = useState('');
  const [dataPayload, setDataPayload] = useState('{}');

  // UI state
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState(null);
  const [showPreview, setShowPreview] = useState(true);

  // History
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotal, setHistoryTotal] = useState(0);

  // Customers (for individual targeting)
  const [customers, setCustomers] = useState([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const customerRef = useRef(null);

  // Stats
  const totalSent = history.filter(n => n.status === 'sent').length;
  const totalFailed = history.filter(n => n.status === 'failed').length;

  // ─── Data fetching ─────────────────────────────────────────────────────────

  const fetchHistory = useCallback(async (page = 1) => {
    setHistoryLoading(true);
    try {
      const result = await getNotifications({ page, limit: 15 });
      setHistory(result.data || []);
      setHistoryTotal(result.pagination?.total || 0);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const fetchCustomers = useCallback(async () => {
    try {
      const result = await getCustomers();
      // getCustomers now returns the array directly after normalisation
      setCustomers(Array.isArray(result) ? result : []);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setCustomers([]); // Never crash — just show empty list
    }
  }, []);

  useEffect(() => {
    fetchHistory(historyPage);
  }, [fetchHistory, historyPage]);

  useEffect(() => {
    if (targetType === 'individual') fetchCustomers();
  }, [targetType, fetchCustomers]);

  // Close customer dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (customerRef.current && !customerRef.current.contains(e.target)) {
        setCustomerDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Image upload handler
  const handleImageFileUpload = async (file) => {
    if (!file) return;
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setImageUploadError('Only JPG, PNG, WEBP or GIF allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setImageUploadError('Image must be under 5MB.');
      return;
    }
    setImageUploading(true);
    setImageUploadError('');
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await api.post('/api/banners/upload-misc', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const url = res.data?.url || res.data?.imageUrl || res.data?.path || '';
      setImageUrl(url);
    } catch (err) {
      // Fallback: create a temporary object URL for preview only
      const objectUrl = URL.createObjectURL(file);
      setImageUrl(objectUrl);
      setImageUploadError('Could not upload to server — using local preview. Add an upload endpoint to persist.');
    } finally {
      setImageUploading(false);
    }
  };

  // ─── Send handler ──────────────────────────────────────────────────────────

  const handleSend = async (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    setSending(true);
    setSendResult(null);

    let parsedData = {};
    try {
      parsedData = JSON.parse(dataPayload || '{}');
    } catch {
      parsedData = {};
    }

    const payload = {
      title: title.trim(),
      subtitle: subtitle.trim(),
      body: body.trim(),
      imageUrl: imageUrl.trim() || null,
      targetType,
      topic: targetType === 'all' ? 'all_users' : null,
      targetUserId: targetType === 'individual' ? targetUserId : null,
      data: parsedData
    };

    try {
      const result = await sendNotification(payload);
      setSendResult({ success: result.success, message: result.message });
      if (result.success) {
        // Reset form
        setTitle('');
        setSubtitle('');
        setBody('');
        setImageUrl('');
        setImageUploadError('');
        setDataPayload('{}');
        setSelectedCustomer(null);
        setTargetUserId('');
        // Refresh history
        await fetchHistory(1);
        setHistoryPage(1);
      }
    } catch (err) {
      setSendResult({ success: false, message: err.message || 'Failed to send notification' });
    } finally {
      setSending(false);
      // Auto clear result after 6 seconds
      setTimeout(() => setSendResult(null), 6000);
    }
  };

  // ─── Delete handler ────────────────────────────────────────────────────────

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      setHistory(prev => prev.filter(n => n._id !== id));
      setHistoryTotal(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  // Filtered customers for search
  const filteredCustomers = customers.filter(c => {
    const q = customerSearch.toLowerCase();
    return (
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
      (c.phone || '').includes(q) ||
      (c.email || '').toLowerCase().includes(q)
    );
  });

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8">
      {/* ── Page Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 shadow-lg shadow-violet-500/20">
              <Bell className="w-5 h-5 text-white" />
            </div>
            Push Notifications
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Compose and broadcast real-time push notifications to your app users via Firebase.
          </p>
        </div>

        <button
          onClick={() => fetchHistory(historyPage)}
          className="flex items-center gap-2 px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Sent', value: historyTotal, icon: Megaphone, gradient: 'from-violet-500 to-blue-500' },
          { label: 'Successful', value: totalSent, icon: CheckCircle2, gradient: 'from-emerald-500 to-teal-500' },
          { label: 'Failed', value: totalFailed, icon: XCircle, gradient: 'from-rose-500 to-pink-500' },
          { label: 'This Page', value: history.length, icon: BarChart2, gradient: 'from-amber-500 to-orange-500' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-dark-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  {stat.label}
                </span>
                <div className={`p-1.5 rounded-lg bg-gradient-to-br ${stat.gradient} shadow`}>
                  <Icon className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
            </motion.div>
          );
        })}
      </div>

      {/* ── Main Grid: Composer + Preview ── */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">

        {/* Composer Form */}
        <div className="xl:col-span-3">
          <div className="bg-white dark:bg-dark-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
              <Send className="w-5 h-5 text-violet-500" />
              <h2 className="text-base font-bold text-slate-800 dark:text-white">Compose Notification</h2>
            </div>

            <form onSubmit={handleSend} className="p-6 space-y-6">
              {/* Send Result Banner */}
              <AnimatePresence>
                {sendResult && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    className={`flex items-start gap-3 p-4 rounded-xl border ${
                      sendResult.success
                        ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                        : 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-300'
                    }`}
                  >
                    {sendResult.success ? (
                      <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{sendResult.success ? 'Notification Sent!' : 'Send Failed'}</p>
                      <p className="text-sm opacity-80 mt-0.5">{sendResult.message}</p>
                    </div>
                    <button type="button" onClick={() => setSendResult(null)} className="shrink-0 opacity-60 hover:opacity-100">
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Target Type Selector */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2.5">
                  Target Audience <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {TARGET_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = targetType === opt.value && !opt.disabled;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        disabled={opt.disabled}
                        onClick={() => !opt.disabled && setTargetType(opt.value)}
                        className={`relative flex flex-col items-start gap-1.5 p-3.5 rounded-xl border-2 text-left transition-all duration-200 ${
                          opt.disabled
                            ? 'border-slate-200 dark:border-slate-700/50 opacity-60 cursor-not-allowed bg-slate-50/50 dark:bg-slate-800/20'
                            : isSelected
                            ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10 shadow-sm shadow-brand-500/10'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                      >
                        <div className={`flex items-center gap-2 ${
                          opt.disabled ? 'text-slate-400 dark:text-slate-500'
                          : isSelected ? 'text-brand-600 dark:text-brand-400'
                          : 'text-slate-600 dark:text-slate-400'
                        }`}>
                          <Icon className="w-4 h-4" />
                          <span className="text-sm font-semibold">{opt.label}</span>
                          {opt.comingSoon && (
                            <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 tracking-wide uppercase">
                              Soon
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">{opt.description}</p>
                        {isSelected && (
                          <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-brand-500" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Individual User Selector */}
              <AnimatePresence>
                {targetType === 'individual' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    ref={customerRef}
                    className="relative"
                  >
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Select Customer <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setCustomerDropdownOpen(!customerDropdownOpen)}
                      className="w-full flex items-center justify-between bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-left transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
                    >
                      <span className={selectedCustomer ? 'text-slate-800 dark:text-slate-100 font-medium' : 'text-slate-400'}>
                        {selectedCustomer
                          ? `${selectedCustomer.firstName || ''} ${selectedCustomer.lastName || ''} — ${selectedCustomer.phone || selectedCustomer.email || ''}`
                          : 'Search and select a customer...'}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${customerDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {customerDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden"
                        >
                          <div className="p-2 border-b border-slate-100 dark:border-slate-800">
                            <input
                              type="text"
                              placeholder="Search by name, phone, email..."
                              value={customerSearch}
                              onChange={e => setCustomerSearch(e.target.value)}
                              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 text-slate-800 dark:text-slate-100"
                            />
                          </div>
                          <div className="max-h-52 overflow-y-auto">
                            {filteredCustomers.length === 0 ? (
                              <p className="text-center text-sm text-slate-400 py-4">No customers found</p>
                            ) : (
                              filteredCustomers.slice(0, 50).map(c => (
                                <button
                                  key={c._id || c.id}
                                  type="button"
                                  onClick={() => {
                                    setSelectedCustomer(c);
                                    setTargetUserId(c._id || c.id);
                                    setCustomerDropdownOpen(false);
                                    setCustomerSearch('');
                                  }}
                                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors"
                                >
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-200 to-blue-200 dark:from-violet-900 dark:to-blue-900 flex items-center justify-center shrink-0">
                                    <span className="text-xs font-bold text-violet-700 dark:text-violet-300">
                                      {(c.firstName || c.phone || '?').charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
                                      {`${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Unknown'}
                                    </p>
                                    <p className="text-xs text-slate-400 truncate">
                                      {c.phone || c.email || 'No contact info'}
                                      {!c.fcmToken && ' · ⚠ No FCM token'}
                                    </p>
                                  </div>
                                </button>
                              ))
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Notification Title <span className="text-rose-500">*</span>
                  <span className={`ml-2 text-xs font-normal ${title.length > 60 ? 'text-amber-500' : 'text-slate-400'}`}>
                    {title.length}/65
                  </span>
                </label>
                <input
                  id="notif-title"
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value.slice(0, 65))}
                  placeholder="e.g. New Arrivals Just Dropped! 🎉"
                  required
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-colors"
                />
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Subtitle
                  <span className={`ml-2 text-xs font-normal ${subtitle.length > 90 ? 'text-amber-500' : 'text-slate-400'}`}>
                    {subtitle.length}/100 — optional
                  </span>
                </label>
                <input
                  id="notif-subtitle"
                  type="text"
                  value={subtitle}
                  onChange={e => setSubtitle(e.target.value.slice(0, 100))}
                  placeholder="e.g. Summer Collection 2026"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-colors"
                />
              </div>

              {/* Body / Description */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Message Body <span className="text-rose-500">*</span>
                  <span className={`ml-2 text-xs font-normal ${body.length > 220 ? 'text-amber-500' : 'text-slate-400'}`}>
                    {body.length}/240
                  </span>
                </label>
                <textarea
                  id="notif-body"
                  rows={3}
                  value={body}
                  onChange={e => setBody(e.target.value.slice(0, 240))}
                  placeholder="e.g. Check out our latest summer collection with up to 40% off. Shop now and get free delivery on orders above ₹999."
                  required
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-colors resize-none"
                />
              </div>

              {/* Notification Image — URL or Upload */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  <span className="flex items-center gap-2">
                    <Image className="w-4 h-4" />
                    Notification Image
                    <span className="text-xs font-normal text-slate-400">optional — appears on Android</span>
                  </span>
                </label>

                {/* Mode Toggle */}
                <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-3 w-fit">
                  <button
                    type="button"
                    onClick={() => { setImageMode('url'); setImageUploadError(''); }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      imageMode === 'url'
                        ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    <Link2 className="w-3 h-3" />
                    Paste URL
                  </button>
                  <button
                    type="button"
                    onClick={() => { setImageMode('upload'); setImageUploadError(''); }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      imageMode === 'upload'
                        ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    <Upload className="w-3 h-3" />
                    Upload File
                  </button>
                </div>

                {/* URL Input */}
                <AnimatePresence mode="wait">
                  {imageMode === 'url' && (
                    <motion.div
                      key="url"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex gap-2"
                    >
                      <input
                        id="notif-image-url"
                        type="url"
                        value={imageUrl}
                        onChange={e => setImageUrl(e.target.value)}
                        placeholder="https://backend.tobeque.com/uploads/misc/banner.jpg"
                        className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-colors"
                      />
                      {imageUrl && (
                        <button
                          type="button"
                          onClick={() => setImageUrl('')}
                          className="px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-500 hover:border-rose-300 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </motion.div>
                  )}

                  {/* File Upload */}
                  {imageMode === 'upload' && (
                    <motion.div
                      key="upload"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <input
                        ref={imageFileRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="hidden"
                        onChange={e => handleImageFileUpload(e.target.files?.[0])}
                      />
                      <button
                        type="button"
                        onClick={() => imageFileRef.current?.click()}
                        disabled={imageUploading}
                        className={`w-full flex flex-col items-center justify-center gap-2 py-8 rounded-xl border-2 border-dashed transition-all ${
                          imageUrl
                            ? 'border-emerald-400 dark:border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-500/5'
                            : 'border-slate-300 dark:border-slate-600 hover:border-brand-400 dark:hover:border-brand-500 bg-slate-50 dark:bg-slate-800/50'
                        }`}
                      >
                        {imageUploading ? (
                          <>
                            <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                            <span className="text-sm text-slate-500">Uploading...</span>
                          </>
                        ) : imageUrl ? (
                          <>
                            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                            <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Image ready!</span>
                            <span className="text-xs text-slate-400">Click to replace</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-6 h-6 text-slate-400" />
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Click to upload image</span>
                            <span className="text-xs text-slate-400">JPG, PNG, WEBP or GIF · max 5MB</span>
                          </>
                        )}
                      </button>
                      {imageUploadError && (
                        <p className="mt-1.5 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          {imageUploadError}
                        </p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Image preview (both modes) */}
                <AnimatePresence>
                  {imageUrl && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 relative group/img"
                    >
                      <img
                        src={resolveImageUrl(imageUrl)}
                        alt="Preview"
                        className="w-full h-36 object-cover rounded-xl border border-slate-200 dark:border-slate-700"
                        onError={(e) => { e.target.style.opacity = '0.3'; }}
                      />
                      <button
                        type="button"
                        onClick={() => { setImageUrl(''); if (imageFileRef.current) imageFileRef.current.value = ''; }}
                        className="absolute top-2 right-2 p-1 rounded-lg bg-slate-900/60 text-white opacity-0 group-hover/img:opacity-100 transition-opacity hover:bg-rose-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Data Payload (Advanced) - Hidden for now */}
              {/*
              <details className="group">
                <summary className="cursor-pointer text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors flex items-center gap-2 select-none">
                  <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
                  Advanced: Custom Data Payload (Deep Linking)
                </summary>
                <div className="mt-3">
                  <p className="text-xs text-slate-400 dark:text-slate-500 mb-2">
                    Optional JSON object passed to the Flutter app. Use it to navigate users to a specific screen on tap.
                    Example: <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">{"{ \"screen\": \"product\", \"productId\": \"abc123\" }"}</code>
                  </p>
                  <textarea
                    id="notif-data-payload"
                    rows={3}
                    value={dataPayload}
                    onChange={e => setDataPayload(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-mono text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-colors resize-none"
                    placeholder='{ "screen": "home" }'
                  />
                </div>
              </details>
              */}

              {/* Submit Button */}
              <div className="flex items-center gap-3 pt-2">
                <motion.button
                  type="submit"
                  disabled={sending || !title.trim() || !body.trim()}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex-1 flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 shadow-lg ${
                    sending || !title.trim() || !body.trim()
                      ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-none'
                      : 'bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white shadow-violet-500/25'
                  }`}
                >
                  {sending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Push Notification
                    </>
                  )}
                </motion.button>

                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center gap-2 px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors xl:hidden"
                >
                  <Eye className="w-4 h-4" />
                  {showPreview ? 'Hide' : 'Preview'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Phone Preview */}
        <AnimatePresence>
          {(showPreview) && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="xl:col-span-2"
            >
              <div className="bg-white dark:bg-dark-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sticky top-8">
                <div className="flex items-center gap-3 mb-6">
                  <Smartphone className="w-5 h-5 text-violet-500" />
                  <h2 className="text-base font-bold text-slate-800 dark:text-white">Device Preview</h2>
                </div>
                <PhonePreview
                  title={title}
                  subtitle={subtitle}
                  body={body}
                  imageUrl={imageUrl}
                />
                <div className="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    <strong>Note:</strong> Actual appearance may vary by device OS and notification shade settings.
                    Image is shown only on Android natively; iOS requires Notification Service Extension.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── History Table ── */}
      <div className="bg-white dark:bg-dark-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-violet-500" />
            <h2 className="text-base font-bold text-slate-800 dark:text-white">Notification History</h2>
            <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
              {historyTotal} total
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          {historyLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-3 border-violet-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-slate-400">Loading history...</span>
              </div>
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800">
                <Bell className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-medium">No notifications sent yet</p>
              <p className="text-slate-400 text-sm">Send your first push notification above</p>
            </div>
          ) : (
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/50 text-left">
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Notification
                  </th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Target
                  </th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Sent At
                  </th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {history.map((notification) => (
                    <HistoryRow
                      key={notification._id}
                      notification={notification}
                      onDelete={handleDelete}
                    />
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!historyLoading && historyTotal > 15 && (
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Page {historyPage} of {Math.ceil(historyTotal / 15)} · {historyTotal} total
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setHistoryPage(p => Math.max(1, p - 1))}
                disabled={historyPage === 1}
                className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300"
              >
                Previous
              </button>
              <button
                onClick={() => setHistoryPage(p => p + 1)}
                disabled={historyPage >= Math.ceil(historyTotal / 15)}
                className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PushNotifications;

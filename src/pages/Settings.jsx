import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Mail, CreditCard, Shield, Save } from 'lucide-react';
import axios from 'axios';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Settings State
  const [storeName, setStoreName] = useState('');
  const [storeEmail, setStoreEmail] = useState('');
  const [storeCurrency, setStoreCurrency] = useState('INR');
  const [deliveryEstimateMin, setDeliveryEstimateMin] = useState('3');
  const [deliveryEstimateMax, setDeliveryEstimateMax] = useState('5');
  
  // SMTP State
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');

  // Stripe State
  const [stripePublishableKey, setStripePublishableKey] = useState('');
  const [stripeSecretKey, setStripeSecretKey] = useState('');

  // Profile update state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const { showNotification } = useNotification();
  const { admin, login } = useAuth();

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/settings');
      if (res.data.success) {
        const settings = res.data.settings;
        setStoreName(settings.storeName || '');
        setStoreEmail(settings.storeEmail || '');
        setStoreCurrency(settings.storeCurrency || 'INR');
        setDeliveryEstimateMin(settings.deliveryEstimateMin || '3');
        setDeliveryEstimateMax(settings.deliveryEstimateMax || '5');
        setSmtpHost(settings.smtpHost || '');
        setSmtpPort(settings.smtpPort || '587');
        setSmtpUser(settings.smtpUser || '');
        setSmtpPass(settings.smtpPassword || '');
        setStripePublishableKey(settings.stripePublishableKey || '');
        setStripeSecretKey(settings.stripeSecretKey || '');
      }

      if (admin) {
        setFirstName(admin.firstName || '');
        setLastName(admin.lastName || '');
        setEmail(admin.email || '');
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
      showNotification('Failed to load system settings.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [admin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (activeTab === 'profile') {
        // Profile update endpoint
        const payload = { firstName, lastName, email };
        if (newPassword) payload.password = newPassword;

        const res = await axios.put(`/api/auth/profile`, payload);
        if (res.data.success) {
          showNotification('Profile updated successfully! Session refreshed.', 'success');
          setNewPassword('');
        }
      } else {
        // System settings payload
        const payload = {
          storeName,
          storeEmail,
          storeCurrency,
          deliveryEstimateMin,
          deliveryEstimateMax,
          smtpHost,
          smtpPort,
          smtpUser,
          smtpPassword: smtpPass,
          stripePublishableKey,
          stripeSecretKey
        };

        const res = await axios.post('/api/settings', payload);
        if (res.data.success) {
          showNotification('System settings saved successfully!', 'success');
        }
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to save settings details.';
      showNotification(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-semibold text-slate-400">Loading system settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">System Settings</h1>
        <p className="text-xs text-slate-450 dark:text-slate-400 font-medium">Configure SMTP email templates dispatches, Stripe integration keys, and update profile passwords</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Tabs Navigation */}
        <div className="lg:col-span-1 glass-card p-4 h-fit flex flex-col gap-1.5">
          <button
            onClick={() => setActiveTab('general')}
            className={`w-full text-left text-xs font-semibold px-4 py-3 rounded-xl flex items-center gap-2.5 transition-all ${
              activeTab === 'general'
                ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20'
                : 'text-slate-650 hover:bg-slate-50 dark:text-slate-350 dark:hover:bg-slate-850'
            }`}
          >
            <SettingsIcon className="w-4.5 h-4.5" />
            General Branding
          </button>
          <button
            onClick={() => setActiveTab('smtp')}
            className={`w-full text-left text-xs font-semibold px-4 py-3 rounded-xl flex items-center gap-2.5 transition-all ${
              activeTab === 'smtp'
                ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20'
                : 'text-slate-650 hover:bg-slate-50 dark:text-slate-350 dark:hover:bg-slate-850'
            }`}
          >
            <Mail className="w-4.5 h-4.5" />
            SMTP SMTP dispatch
          </button>
          <button
            onClick={() => setActiveTab('stripe')}
            className={`w-full text-left text-xs font-semibold px-4 py-3 rounded-xl flex items-center gap-2.5 transition-all ${
              activeTab === 'stripe'
                ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20'
                : 'text-slate-650 hover:bg-slate-50 dark:text-slate-350 dark:hover:bg-slate-850'
            }`}
          >
            <CreditCard className="w-4.5 h-4.5" />
            Stripe Stripe Integration
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full text-left text-xs font-semibold px-4 py-3 rounded-xl flex items-center gap-2.5 transition-all ${
              activeTab === 'profile'
                ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20'
                : 'text-slate-650 hover:bg-slate-50 dark:text-slate-350 dark:hover:bg-slate-850'
            }`}
          >
            <Shield className="w-4.5 h-4.5" />
            Admin Profile Password
          </button>
        </div>

        {/* Right Tab Content View */}
        <div className="lg:col-span-3 glass-card p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {activeTab === 'general' && (
              <div className="space-y-5">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-850">
                  Storefront Branding Settings
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label text-xs">E-Commerce Brand Name</label>
                    <input
                      type="text"
                      placeholder="EX: Tobeque Inc."
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      className="form-input text-xs"
                    />
                  </div>
                  <div>
                    <label className="form-label text-xs">Support Contact Email</label>
                    <input
                      type="email"
                      placeholder="EX: support@tobeque.com"
                      value={storeEmail}
                      onChange={(e) => setStoreEmail(e.target.value)}
                      className="form-input text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="form-label text-xs">Store Base Checkout Currency</label>
                  <select
                    value={storeCurrency}
                    onChange={(e) => setStoreCurrency(e.target.value)}
                    className="form-input text-xs h-[38px] py-1 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="USD">USD - US Dollar ($)</option>
                    <option value="EUR">EUR - Euro (€)</option>
                    <option value="GBP">GBP - British Pound Sterling (£)</option>
                    <option value="INR">INR - Indian Rupee (₹)</option>
                  </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label text-xs">Delivery Estimate Min (Days)</label>
                    <input
                      type="number"
                      value={deliveryEstimateMin}
                      onChange={(e) => setDeliveryEstimateMin(e.target.value)}
                      className="form-input text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                  <div>
                    <label className="form-label text-xs">Delivery Estimate Max (Days)</label>
                    <input
                      type="number"
                      value={deliveryEstimateMax}
                      onChange={(e) => setDeliveryEstimateMax(e.target.value)}
                      className="form-input text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'smtp' && (
              <div className="space-y-5">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-850">
                  SMTP Mail Server Configuration
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="form-label text-xs">SMTP Host Address</label>
                    <input
                      type="text"
                      placeholder="EX: smtp.mailgun.org, smtp.gmail.com"
                      value={smtpHost}
                      onChange={(e) => setSmtpHost(e.target.value)}
                      className="form-input text-xs"
                    />
                  </div>
                  <div>
                    <label className="form-label text-xs">SMTP Port</label>
                    <input
                      type="number"
                      placeholder="587, 465"
                      value={smtpPort}
                      onChange={(e) => setSmtpPort(e.target.value)}
                      className="form-input text-xs"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label text-xs">Mail Username</label>
                    <input
                      type="text"
                      placeholder="EX: postmaster@tobeque.com"
                      value={smtpUser}
                      onChange={(e) => setSmtpUser(e.target.value)}
                      className="form-input text-xs"
                    />
                  </div>
                  <div>
                    <label className="form-label text-xs">Mail Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={smtpPass}
                      onChange={(e) => setSmtpPass(e.target.value)}
                      className="form-input text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'stripe' && (
              <div className="space-y-5">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-850">
                  Stripe Payment gateway integrations
                </h3>
                <div>
                  <label className="form-label text-xs">Stripe Publishable Key (pk_test...)</label>
                  <input
                    type="text"
                    placeholder="pk_test_..."
                    value={stripePublishableKey}
                    onChange={(e) => setStripePublishableKey(e.target.value)}
                    className="form-input text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="form-label text-xs">Stripe Secret Key (sk_test...)</label>
                  <input
                    type="password"
                    placeholder="sk_test_..."
                    value={stripeSecretKey}
                    onChange={(e) => setStripeSecretKey(e.target.value)}
                    className="form-input text-xs font-mono"
                  />
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="space-y-5">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-850">
                  Administrator Profile Credentials
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label text-xs">First Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Rushabh"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="form-input text-xs"
                    />
                  </div>
                  <div>
                    <label className="form-label text-xs">Last Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Desai"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="form-input text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="form-label text-xs">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="admin@tobeque.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input text-xs"
                  />
                </div>
                <div>
                  <label className="form-label text-xs">Change Password (Leave empty to retain current)</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="form-input text-xs"
                  />
                </div>
              </div>
            )}

            {/* Save Buttons Footer */}
            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-850">
              <button
                type="submit"
                disabled={saving}
                className="btn-primary py-2.5 px-6 rounded-xl text-xs font-semibold shadow-lg shadow-brand-500/20"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Settings Options
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
};

export default Settings;

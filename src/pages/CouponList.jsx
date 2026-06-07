import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Ticket, Check, X } from 'lucide-react';
import axios from 'axios';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

const CouponList = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal Coupon State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [code, setCode] = useState('');
  const [type, setType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [minOrderAmount, setMinOrderAmount] = useState('0');
  const [usageLimit, setUsageLimit] = useState('100');
  const [startDate, setStartDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [status, setStatus] = useState(true);
  const [saving, setSaving] = useState(false);

  const { showNotification } = useNotification();
  const { admin } = useAuth();

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/coupons');
      if (res.data.success) {
        setCoupons(res.data.coupons);
      }
    } catch (err) {
      console.error('Error fetching coupons:', err);
      showNotification('Failed to retrieve promo coupons.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const openModal = (coupon = null) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setCode(coupon.code);
      setType(coupon.type);
      setDiscountValue(coupon.discountValue);
      setMinOrderAmount(coupon.minOrderAmount);
      setUsageLimit(coupon.usageLimit);
      setStartDate(coupon.startDate ? coupon.startDate.substring(0, 10) : '');
      setExpiryDate(coupon.expiryDate ? coupon.expiryDate.substring(0, 10) : '');
      setStatus(coupon.status);
    } else {
      setEditingCoupon(null);
      setCode('');
      setType('percentage');
      setDiscountValue('');
      setMinOrderAmount('0');
      setUsageLimit('100');
      
      // Auto dates
      const today = new Date().toISOString().substring(0, 10);
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      
      setStartDate(today);
      setExpiryDate(nextMonth.toISOString().substring(0, 10));
      setStatus(true);
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code || !discountValue) {
      showNotification('Please fill in coupon code and value.', 'warning');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        code,
        type,
        discountValue,
        minOrderAmount,
        usageLimit,
        startDate,
        expiryDate,
        status
      };

      let res;
      if (editingCoupon) {
        res = await axios.put(`/api/coupons/${editingCoupon.id}`, payload);
      } else {
        res = await axios.post('/api/coupons', payload);
      }

      if (res.data.success) {
        showNotification(`Coupon successfully ${editingCoupon ? 'updated' : 'published'}!`, 'success');
        setModalOpen(false);
        fetchCoupons();
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to save coupon.';
      showNotification(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, codeStr) => {
    if (!window.confirm(`Are you absolutely sure you want to delete coupon "${codeStr}"?`)) return;

    try {
      const res = await axios.delete(`/api/coupons/${id}`);
      if (res.data.success) {
        showNotification(`Coupon "${codeStr}" successfully removed.`, 'success');
        fetchCoupons();
      }
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to delete coupon.', 'error');
    }
  };

  // Table columns
  const columns = [
    {
      header: 'Promo Code',
      accessor: 'code',
      cell: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-650 flex items-center justify-center">
            <Ticket className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">{row.code}</span>
        </div>
      )
    },
    {
      header: 'Discount rate',
      accessor: 'discountValue',
      cell: (row) => (
        <span className="font-extrabold text-slate-800 dark:text-white">
          {row.type === 'percentage' ? `${row.discountValue}% Off` : `₹${row.discountValue} Off`}
        </span>
      )
    },
    {
      header: 'Min purchase',
      accessor: 'minOrderAmount',
      cell: (row) => <span className="font-semibold text-slate-500 dark:text-slate-400">${parseFloat(row.minOrderAmount).toFixed(2)}</span>
    },
    {
      header: 'Limits',
      accessor: 'usageLimit',
      cell: (row) => <span className="font-semibold text-slate-700 dark:text-slate-350">{row.usageLimit} times</span>
    },
    {
      header: 'Expiration',
      accessor: 'expiryDate',
      cell: (row) => (
        <span className="text-xs text-slate-500 font-medium">
          {new Date(row.expiryDate).toLocaleDateString()}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => (
        <span className={`px-2 py-0.5 rounded-lg text-[10px] uppercase font-bold tracking-wider ${
          row.status 
            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-450' 
            : 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-450'
        }`}>
          {row.status ? 'Active' : 'Expired'}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: 'id',
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => openModal(row)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-650 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300"
          >
            <Edit className="w-4 h-4" />
          </button>
          {['superadmin', 'manager'].includes(admin?.role) && (
            <button
              onClick={() => handleDelete(row.id, row.code)}
              className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/20 dark:hover:bg-rose-950/30 dark:text-rose-450"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">Discount Coupons</h1>
          <p className="text-xs text-slate-450 dark:text-slate-400 font-medium">Issue shop voucher campaigns and configure minimum order values</p>
        </div>
        <button
          onClick={() => openModal()}
          className="btn-primary py-2.5 px-4 rounded-xl text-sm font-semibold shadow-lg shadow-brand-500/20"
        >
          <Plus className="w-4.5 h-4.5" />
          Create Coupon
        </button>
      </div>

      {/* Table */}
      <div className="glass-card p-6">
        <Table
          columns={columns}
          data={coupons}
          loading={loading}
          exportFileName="discount-coupons"
        />
      </div>

      {/* Editor Popup Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCoupon ? `Edit Coupon: ${code}` : 'Issue New Shop Coupon'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label text-xs">Voucher Code *</label>
            <input
              type="text"
              required
              placeholder="EX: WELCOME10, SUMMER50"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="form-input text-xs uppercase"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label text-xs">Reduction Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="form-input text-xs h-[38px] py-1 bg-slate-50 dark:bg-slate-800"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>
            <div>
              <label className="form-label text-xs">Deduction Value *</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                placeholder={type === 'percentage' ? '10' : '15.00'}
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                className="form-input text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label text-xs">Minimum Order Amount (₹)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="49.99"
                value={minOrderAmount}
                onChange={(e) => setMinOrderAmount(e.target.value)}
                className="form-input text-xs"
              />
            </div>
            <div>
              <label className="form-label text-xs">Voucher Usage Limit</label>
              <input
                type="number"
                min="1"
                placeholder="200"
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value)}
                className="form-input text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label text-xs">Start Valid Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="form-input text-xs"
              />
            </div>
            <div>
              <label className="form-label text-xs">Expiration End Date</label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="form-input text-xs"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 py-1.5">
            <input
              type="checkbox"
              id="couponStatus"
              checked={status}
              onChange={(e) => setStatus(e.target.checked)}
              className="w-4 h-4 text-brand-600 border-slate-350 rounded"
            />
            <label htmlFor="couponStatus" className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Coupon is Active and usable
            </label>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn-primary w-full text-xs py-2.5 mt-2 font-semibold shadow-lg shadow-brand-500/20"
          >
            {saving ? 'Processing...' : 'Publish Discount Coupon'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default CouponList;

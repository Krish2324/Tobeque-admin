import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ExternalLink, Package, ShoppingBag, Eye, X } from 'lucide-react';
import api from '../services/api';
import Table from '../components/Table';
import { useNotification } from '../context/NotificationContext';
import DeleteModal from '../components/DeleteModal';
import { resolveImageUrl } from '../utils/imageUrl';

const STATUS_STYLES = {
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  under_review: 'bg-blue-50 text-blue-700 border-blue-200',
  approved: 'bg-green-50 text-green-700 border-green-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
  auto_cancelled: 'bg-gray-50 text-gray-600 border-gray-200',
};

const ALL_STATUSES = ['pending', 'under_review', 'approved', 'rejected', 'auto_cancelled'];

const STATUS_LABELS = {
  pending: 'Pending',
  under_review: 'Under Review',
  approved: 'Approved',
  rejected: 'Rejected',
  auto_cancelled: 'Auto Cancelled',
};

const RETURN_REASON_LABELS = {
  wrong_size: 'Wrong Size',
  damaged_defective: 'Damaged / Defective',
  not_as_described: 'Not as Described',
  changed_mind: 'Changed Mind',
  other: 'Other',
};

export default function RefundRequestList() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'cancel' | 'return'
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
  const [orderDetailsModal, setOrderDetailsModal] = useState({ open: false, order: null, loading: false });
  const { showNotification } = useNotification();

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (typeFilter !== 'all') params.requestType = typeFilter;
      const { data } = await api.get('/api/refund-requests', { params });
      setRequests(data.requests || []);
    } catch (error) {
      showNotification('Failed to load requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter, typeFilter]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/api/refund-requests/${id}/status`, { status: newStatus });
      showNotification(`Status updated to ${STATUS_LABELS[newStatus]}`, 'success');
      fetchRequests();
    } catch {
      showNotification('Failed to update status', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/refund-requests/${id}`);
      showNotification('Request deleted', 'success');
      fetchRequests();
    } catch {
      showNotification('Failed to delete request', 'error');
    } finally {
      setDeleteModal({ open: false, id: null });
    }
  };

  const openOrderDetails = async (orderId) => {
    setOrderDetailsModal({ open: true, order: null, loading: true });
    try {
      const res = await api.get(`/api/orders/${orderId}`);
      if (res.data.success) {
        setOrderDetailsModal({ open: true, order: res.data.order, loading: false });
      } else {
        setOrderDetailsModal({ open: false, order: null, loading: false });
        showNotification('Failed to fetch order details', 'error');
      }
    } catch (error) {
      setOrderDetailsModal({ open: false, order: null, loading: false });
      showNotification('Failed to fetch order details', 'error');
    }
  };

  const columns = [
    {
      header: 'Date',
      accessor: (row) => new Date(row.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    },
    {
      header: 'Type',
      accessor: (row) => (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
          row.requestType === 'cancel'
            ? 'bg-orange-50 text-orange-700 border-orange-200'
            : 'bg-indigo-50 text-indigo-700 border-indigo-200'
        }`}>
          {row.requestType === 'cancel' ? (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          ) : (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
          )}
          {row.requestType === 'cancel' ? 'Cancel' : 'Return'}
        </span>
      )
    },
    {
      header: 'Customer',
      accessor: (row) => (
        <div>
          <div className="font-medium text-on-surface text-sm">{row.name}</div>
          <div className="text-xs text-on-surface-variant">{row.email}</div>
          <div className="text-xs text-on-surface-variant">{row.phone}</div>
        </div>
      )
    },
    {
      header: 'Order ID',
      accessor: (row) => (
        <span className="text-sm font-mono font-medium text-slate-600 dark:text-slate-400">
          {row.orderId}
        </span>
      )
    },
    {
      header: 'Reason',
      accessor: (row) => {
        const displayReason = row.requestType === 'return' && row.returnReason
          ? RETURN_REASON_LABELS[row.returnReason] || row.returnReason
          : row.cancelReason || row.reason;
        const extraNote = row.requestType === 'return' && row.reason ? row.reason : null;
        return (
          <div className="max-w-[200px]">
            <span className="text-xs font-medium text-on-surface">
              {displayReason || <span className="italic text-gray-400">No reason</span>}
            </span>
            {extraNote && (
              <p className="text-xs text-on-surface-variant truncate mt-0.5" title={extraNote}>{extraNote}</p>
            )}
            {row.proofImage && (
              <a 
                href={row.proofImage.startsWith('http') ? row.proofImage : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${row.proofImage}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-semibold text-brand-600 hover:text-brand-700 bg-brand-50 px-2 py-1 rounded-md"
              >
                <ExternalLink className="w-3 h-3" /> View Proof Image
              </a>
            )}
          </div>
        );
      }
    },
    {
      header: 'Status',
      accessor: (row) => (
        <select
          value={row.status}
          onChange={(e) => handleStatusChange(row._id, e.target.value)}
          className={`px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full border cursor-pointer appearance-none ${STATUS_STYLES[row.status] || 'bg-slate-50 text-slate-600 border-slate-200'}`}
        >
          {ALL_STATUSES.map(s => (
            <option key={s} value={s} className="text-slate-800 bg-white normal-case text-xs font-normal">
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      )
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => openOrderDetails(row.order)}
            className="p-1.5 text-slate-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded-lg transition-colors"
            title="View Order Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteModal({ open: true, id: row._id })}
            className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
            title="Delete Request"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  const cancelCount = requests.filter(r => r.requestType === 'cancel').length;
  const returnCount = requests.filter(r => r.requestType === 'return').length;

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-headline-sm font-headline-sm text-primary mb-1">Cancel & Return Requests</h1>
          <p className="text-body-md text-on-surface-variant">
            Review and process customer cancellation and return requests
          </p>
        </div>
      </div>

      {/* Type Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-0">
        {[
          { key: 'all', label: `All (${requests.length})` },
          { key: 'cancel', label: `Cancellations (${cancelCount})` },
          { key: 'return', label: `Returns (${returnCount})` },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setTypeFilter(tab.key)}
            className={`px-4 py-2.5 text-xs font-semibold transition-all border-b-2 -mb-px ${
              typeFilter === tab.key
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}

        {/* Status filter on right side */}
        <div className="ml-auto flex items-center gap-2 pb-1">
          <label className="text-xs font-medium text-on-surface-variant">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500/30 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            {ALL_STATUSES.map(s => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Status Pills */}
      <div className="flex flex-wrap gap-3">
        {ALL_STATUSES.map(s => {
          const count = requests.filter(r => r.status === s).length;
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(statusFilter === s ? 'all' : s)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                statusFilter === s
                  ? STATUS_STYLES[s] + ' shadow-sm'
                  : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
              }`}
            >
              {STATUS_LABELS[s]} ({count})
            </button>
          );
        })}
      </div>

      <Table
        columns={columns}
        data={requests}
        loading={loading}
        emptyMessage="No requests found."
      />

      <DeleteModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: null })}
        onConfirm={() => handleDelete(deleteModal.id)}
        title="Delete Request"
        message="Are you sure you want to delete this request? This action cannot be undone."
      />

      {/* Order Details Modal */}
      {orderDetailsModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-brand-500" />
                Order Details
              </h3>
              <button 
                onClick={() => setOrderDetailsModal({ open: false, order: null, loading: false })}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              {orderDetailsModal.loading ? (
                <div className="flex justify-center py-10">
                  <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : orderDetailsModal.order ? (
                <div className="space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs text-slate-400">Order ID</p>
                      <p className="font-mono font-bold text-slate-800 dark:text-white">{orderDetailsModal.order.orderNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400">Total Amount</p>
                      <p className="font-extrabold text-brand-600">₹{orderDetailsModal.order.totalAmount}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-3">Purchased Items</h4>
                    <div className="space-y-3">
                      {orderDetailsModal.order.items?.map(item => {
                        const rawImg = item.image || item.imageSrc || item.product?.thumbnail || item.product?.images?.[0] || '';
                        const resolvedImg = resolveImageUrl(rawImg);
                        const fallbackImg = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100';
                        return (
                          <div key={item._id || item.id} className="flex gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                            <img
                              src={resolvedImg || fallbackImg}
                              alt={item.productName}
                              className="w-14 h-14 rounded-lg object-cover"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = fallbackImg;
                              }}
                            />
                            <div className="flex-1">
                              <p className="text-sm font-bold text-slate-800 dark:text-white line-clamp-1">{item.productName}</p>
                              <p className="text-xs text-slate-500">Qty: {item.quantity} × ₹{item.price}</p>
                            </div>
                            <div className="text-right font-bold text-slate-800 dark:text-white">
                              ₹{item.quantity * item.price}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                    <Link 
                      to={`/orders/${orderDetailsModal.order._id || orderDetailsModal.order.id}`} 
                      className="btn-primary py-2 px-4 text-xs flex items-center gap-2"
                    >
                      View Full Order Page <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ) : (
                <p className="text-center py-10 text-slate-500">Could not load order details.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

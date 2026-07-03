import React, { useState, useEffect } from 'react';
import { Trash2, ChevronDown } from 'lucide-react';
import api from '../services/api';
import Table from '../components/Table';
import { useNotification } from '../context/NotificationContext';

const STATUS_STYLES = {
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  under_review: 'bg-blue-50 text-blue-700 border-blue-200',
  approved: 'bg-green-50 text-green-700 border-green-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
};

const ALL_STATUSES = ['pending', 'under_review', 'approved', 'rejected'];

const STATUS_LABELS = {
  pending: 'Pending',
  under_review: 'Under Review',
  approved: 'Approved',
  rejected: 'Rejected',
};

export default function RefundRequestList() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const { showNotification } = useNotification();

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = statusFilter !== 'all' ? { status: statusFilter } : {};
      const { data } = await api.get('/api/refund-requests', { params });
      setRequests(data.requests || []);
    } catch (error) {
      showNotification('Failed to load refund requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

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
    if (!window.confirm('Delete this refund request? This cannot be undone.')) return;
    try {
      await api.delete(`/api/refund-requests/${id}`);
      showNotification('Refund request deleted', 'success');
      fetchRequests();
    } catch {
      showNotification('Failed to delete request', 'error');
    }
  };

  const columns = [
    {
      header: 'Date',
      accessor: (row) => new Date(row.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
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
        <span className="text-sm font-mono font-medium text-on-surface">{row.orderId}</span>
      )
    },
    {
      header: 'Reason',
      accessor: (row) => (
        <div className="max-w-[200px] text-xs text-on-surface-variant truncate" title={row.reason}>
          {row.reason || <span className="italic text-gray-400">No reason provided</span>}
        </div>
      )
    },
    {
      header: 'Status',
      accessor: (row) => (
        <select
          value={row.status}
          onChange={(e) => handleStatusChange(row._id, e.target.value)}
          className={`px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full border cursor-pointer appearance-none pr-6 ${STATUS_STYLES[row.status] || 'bg-slate-50 text-slate-600 border-slate-200'}`}
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
        <button
          onClick={() => handleDelete(row._id)}
          className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/20 dark:hover:bg-rose-950/30 dark:text-rose-450 transition-colors"
          title="Delete Request"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )
    }
  ];

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-headline-sm font-headline-sm text-primary mb-1">Refund Requests</h1>
          <p className="text-body-md text-on-surface-variant">
            Review and process customer refund requests
          </p>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-on-surface-variant">Filter by status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500/30 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            {ALL_STATUSES.map(s => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Pills */}
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
        emptyMessage="No refund requests found."
      />
    </div>
  );
}

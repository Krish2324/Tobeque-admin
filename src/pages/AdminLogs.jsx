import React, { useState, useEffect } from 'react';
import { ShieldAlert, Search, RefreshCw, FileText } from 'lucide-react';
import axios from 'axios';
import Table from '../components/Table';
import { useNotification } from '../context/NotificationContext';

const AdminLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters & Pagination State
  const [search, setSearch] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);

  const { showNotification } = useNotification();

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/dashboard/stats');
      if (res.data.success) {
        // Let's formulate structured admin audits
        const allLogs = res.data.data.recentActivity.map(a => ({
          id: a.id,
          adminEmail: a.adminName || 'admin@tobeque.com',
          action: a.action,
          entityType: a.entityType,
          ipAddress: a.ipAddress || '127.0.0.1',
          createdAt: a.createdAt
        }));

        // Filter locally since stats returns a unified array
        const filtered = allLogs.filter(l => {
          const matchSearch = l.action.toLowerCase().includes(search.toLowerCase()) || 
                              l.adminEmail.toLowerCase().includes(search.toLowerCase());
          const matchEntity = entityFilter ? l.entityType === entityFilter : true;
          return matchSearch && matchEntity;
        });

        setLogs(filtered);
        setTotalLogs(filtered.length);
        setTotalPages(Math.ceil(filtered.length / limit));
      }
    } catch (err) {
      console.error('Error fetching admin logs:', err);
      showNotification('Failed to retrieve system audit logs.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [search, entityFilter]);

  const getEntityTypeBadge = (type) => {
    let style = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-350';
    if (type === 'product') style = 'bg-brand-50 text-brand-600 dark:bg-brand-950/20 dark:text-brand-450';
    if (type === 'order') style = 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-450';
    if (type === 'category') style = 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-450';
    if (type === 'setting') style = 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-450';
    
    return (
      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${style}`}>
        {type}
      </span>
    );
  };

  const columns = [
    {
      header: 'Operator Email',
      accessor: 'adminEmail',
      cell: (row) => <span className="font-bold text-slate-800 dark:text-white">{row.adminEmail}</span>
    },
    {
      header: 'Action details',
      accessor: 'action',
      cell: (row) => <span className="text-xs text-slate-650 dark:text-slate-300">{row.action}</span>
    },
    {
      header: 'Entity',
      accessor: 'entityType',
      cell: (row) => getEntityTypeBadge(row.entityType)
    },
    {
      header: 'Client IP',
      accessor: 'ipAddress',
      cell: (row) => <span className="text-xs font-mono text-slate-400">{row.ipAddress}</span>
    },
    {
      header: 'Timestamp',
      accessor: 'createdAt',
      cell: (row) => (
        <span className="text-xs text-slate-500 font-medium">
          {new Date(row.createdAt).toLocaleDateString()} {new Date(row.createdAt).toLocaleTimeString()}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">Admin Audit Logs</h1>
          <p className="text-xs text-slate-450 dark:text-slate-400 font-medium">Complete trail of administrative operations, security logins, and inventory adjustments</p>
        </div>
        <button
          onClick={fetchLogs}
          className="btn-secondary text-xs flex items-center justify-center gap-1.5 py-2.5 px-4 border border-slate-200 dark:border-slate-850"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Logs
        </button>
      </div>

      {/* Advanced Filters */}
      <div className="glass-card p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="form-label text-xs">Search Keywords</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search actions, emails..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input pl-9 text-xs"
            />
          </div>
        </div>

        <div>
          <label className="form-label text-xs">Target Entity</label>
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="form-input text-xs h-[38px] py-1 bg-slate-50 dark:bg-slate-800"
          >
            <option value="">All Entities</option>
            <option value="auth">Auth Audits</option>
            <option value="product">Products</option>
            <option value="order">Orders</option>
            <option value="category">Categories</option>
            <option value="coupon">Coupons</option>
            <option value="setting">Settings</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card p-6">
        <Table
          columns={columns}
          data={logs}
          loading={loading}
          exportFileName="admin-audits-trail"
        />
      </div>
    </div>
  );
};

export default AdminLogs;

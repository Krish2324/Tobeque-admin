import React, { useState, useEffect } from 'react';
import { Trash2, Mail } from 'lucide-react';
import api from '../services/api';
import Table from '../components/Table';
import { useNotification } from '../context/NotificationContext';

export default function SubscriberList() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/subscribers');
      setSubscribers(data.subscribers || []);
    } catch (error) {
      showNotification('Failed to load subscribers', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subscriber?')) return;
    try {
      await api.delete(`/api/subscribers/${id}`);
      showNotification('Subscriber deleted', 'success');
      fetchSubscribers();
    } catch (error) {
      showNotification('Failed to delete subscriber', 'error');
    }
  };

  const columns = [
    {
      header: 'Subscribed Date',
      accessor: (row) => new Date(row.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    },
    {
      header: 'Email Address',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-slate-400" />
          <span className="font-medium text-on-surface">{row.email}</span>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: (row) => (
        <span className={`px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full border ${
          row.status === 'active' 
            ? 'bg-green-50 text-green-700 border-green-200' 
            : 'bg-slate-50 text-slate-600 border-slate-200'
        }`}>
          {row.status}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <button
          onClick={() => handleDelete(row._id)}
          className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/20 dark:hover:bg-rose-950/30 dark:text-rose-450 transition-colors"
          title="Delete Subscriber"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )
    }
  ];

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-headline-sm font-headline-sm text-primary mb-1">Newsletter Subscribers</h1>
          <p className="text-body-md text-on-surface-variant">
            Manage your email list and export subscribers.
          </p>
        </div>
      </div>

      <Table
        columns={columns}
        data={subscribers}
        loading={loading}
        emptyMessage="No subscribers found."
      />
    </div>
  );
}

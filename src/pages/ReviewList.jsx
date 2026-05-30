import React, { useState, useEffect } from 'react';
import { Trash2, CheckCircle, ShieldAlert, Star, ShoppingBag, Eye, ShieldX } from 'lucide-react';
import axios from 'axios';
import Table from '../components/Table';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

const ReviewList = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();
  const { admin } = useAuth();

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/reviews');
      if (res.data.success) {
        setReviews(res.data.reviews);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
      showNotification('Failed to load reviews catalog.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleToggleApproval = async (id, currentVal, prodName) => {
    const nextVal = !currentVal;
    try {
      const res = await axios.put(`/api/reviews/${id}/approve`, { approve: nextVal });
      if (res.data.success) {
        showNotification(
          `Review for "${prodName}" has been successfully ${nextVal ? 'approved and published' : 'hidden'}!`,
          'success'
        );
        fetchReviews();
      }
    } catch (err) {
      showNotification('Failed to update review status.', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this product review?')) return;

    try {
      const res = await axios.delete(`/api/reviews/${id}`);
      if (res.data.success) {
        showNotification('Review deleted successfully.', 'success');
        fetchReviews();
      }
    } catch (err) {
      showNotification('Failed to delete review.', 'error');
    }
  };

  // Render Stars
  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-0.5 text-amber-400">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-3.5 h-3.5 ${i < rating ? 'fill-amber-400' : 'text-slate-200 dark:text-slate-800'}`}
          />
        ))}
      </div>
    );
  };

  const columns = [
    {
      header: 'Product Catalog Item',
      accessor: 'productId',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <img
            src={row.product?.thumbnail || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100'}
            alt={row.product?.name}
            className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-800 flex-shrink-0"
          />
          <div className="flex flex-col text-xs truncate max-w-xs">
            <span className="font-semibold text-slate-800 dark:text-white truncate">{row.product?.name}</span>
            <span className="text-[9px] text-slate-450 uppercase font-bold tracking-wider">{row.product?.sku}</span>
          </div>
        </div>
      )
    },
    {
      header: 'User review details',
      accessor: 'comment',
      cell: (row) => (
        <div className="flex flex-col gap-1 text-xs max-w-sm">
          {renderStars(row.rating)}
          <p className="font-semibold text-slate-700 dark:text-slate-200 italic">"{row.comment}"</p>
          <span className="text-[10px] text-slate-450">
            By: {row.user ? `${row.user.firstName} ${row.user.lastName}` : 'Anonymous'} ({row.user?.email})
          </span>
        </div>
      )
    },
    {
      header: 'Publish Status',
      accessor: 'isApproved',
      cell: (row) => (
        <span className={`px-2 py-0.5 rounded-lg text-[10px] uppercase font-bold tracking-wider ${
          row.isApproved 
            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-450' 
            : 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-450'
        }`}>
          {row.isApproved ? 'Approved' : 'Pending Moderation'}
        </span>
      )
    },
    {
      header: 'Date Posted',
      accessor: 'createdAt',
      cell: (row) => (
        <span className="text-xs text-slate-450">
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: 'id',
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleToggleApproval(row.id, row.isApproved, row.product?.name)}
            className={`p-2 rounded-xl flex items-center justify-center transition-colors ${
              row.isApproved
                ? 'bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-950/20 dark:text-amber-400'
                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-450'
            }`}
            title={row.isApproved ? 'Hide Review' : 'Approve Review'}
          >
            {row.isApproved ? <ShieldX className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
          </button>
          {['superadmin', 'manager'].includes(admin?.role) && (
            <button
              onClick={() => handleDelete(row.id)}
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
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">Customer Reviews</h1>
        <p className="text-xs text-slate-450 dark:text-slate-400 font-medium">Moderate product feedback, check stars distribution and block spam ratings</p>
      </div>

      {/* Table */}
      <div className="glass-card p-6">
        <Table
          columns={columns}
          data={reviews}
          loading={loading}
          exportFileName="product-reviews"
        />
      </div>
    </div>
  );
};

export default ReviewList;

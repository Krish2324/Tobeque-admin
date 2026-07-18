import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Search, BookOpen, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useNotification } from '../context/NotificationContext';
import Table from '../components/Table';
import DeleteModal from '../components/DeleteModal';

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
  const { showNotification } = useNotification();

  const fetchBlogs = async () => {
    try {
      const res = await axios.get('/api/blogs');
      setBlogs(res.data.data);
    } catch (err) {
      showNotification('Failed to fetch Style Journal articles', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/blogs/${id}`);
      showNotification('Article deleted successfully', 'success');
      fetchBlogs();
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to delete article', 'error');
    } finally {
      setDeleteModal({ open: false, id: null });
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'draft' ? 'published' : 'draft';
    try {
      await axios.patch(`/api/blogs/${id}/status`, { status: newStatus });
      showNotification(`Article ${newStatus === 'published' ? 'published' : 'moved to draft'}`, 'success');
      fetchBlogs();
    } catch (err) {
      showNotification('Failed to update status', 'error');
    }
  };

  const filteredBlogs = blogs.filter(b => 
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      header: 'Article',
      accessor: 'title',
      cell: (row) => (
        <div className="flex items-center gap-3">
          {row.image ? (
            <img src={row.image} alt={row.title} className="w-12 h-12 rounded object-cover" />
          ) : (
            <div className="w-12 h-12 rounded bg-slate-100 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-slate-400" />
            </div>
          )}
          <div>
            <div className="font-semibold text-slate-800 dark:text-white">{row.title}</div>
            <div className="text-xs text-slate-500">/{row.slug}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Author',
      accessor: 'author',
      cell: (row) => <span className="text-sm">{row.author}</span>
    },
    {
      header: 'Date',
      accessor: 'createdAt',
      cell: (row) => <span className="text-sm">{new Date(row.createdAt).toLocaleDateString()}</span>
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => (
        <button
          onClick={() => toggleStatus(row.id, row.status)}
          className={`px-2.5 py-1 text-xs font-semibold rounded-full border transition-colors ${
            row.status === 'published' 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
              : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
          }`}
        >
          {row.status === 'published' ? 'Published' : 'Draft'}
        </button>
      )
    },
    {
      header: 'Actions',
      accessor: 'id',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Link to={`/style-journal/edit/${row.id}`} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
            <Edit className="w-4 h-4" />
          </Link>
          <button onClick={() => setDeleteModal({ open: true, id: row.id })} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Style Journal</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your blog articles and posts</p>
        </div>
        <Link to="/style-journal/new" className="btn-primary py-2.5">
          <Plus className="w-4.5 h-4.5 mr-2" />
          New Article
        </Link>
      </div>

      <div className="glass-card mb-6">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search articles by title or slug..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input pl-10"
            />
          </div>
        </div>
        
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-500">Loading articles...</p>
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">No Articles Found</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
              You haven't published any Style Journal articles yet, or no articles match your search.
            </p>
            <Link to="/style-journal/new" className="btn-primary py-2 px-6 inline-flex">
              <Plus className="w-4 h-4 mr-2" />
              Write First Article
            </Link>
          </div>
        ) : (
          <Table columns={columns} data={filteredBlogs} />
        )}
      </div>

      <DeleteModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: null })}
        onConfirm={() => handleDelete(deleteModal.id)}
        title="Delete Article"
        message="Are you sure you want to delete this article? This action cannot be undone."
      />
    </div>
  );
};

export default BlogList;

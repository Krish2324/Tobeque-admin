import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Camera, Plus, Search, Edit2, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import axios from 'axios';
import { useNotification } from '../context/NotificationContext';
import DeleteModal from '../components/DeleteModal';

const CommunityStyleList = () => {
  const [styles, setStyles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [styleToDelete, setStyleToDelete] = useState(null);
  
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchStyles();
  }, []);

  const fetchStyles = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/community-styles');
      setStyles(res.data.data || []);
    } catch (err) {
      showNotification('Failed to fetch styles', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (style) => {
    setStyleToDelete(style);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!styleToDelete) return;
    try {
      await axios.delete(`/api/community-styles/${styleToDelete.id}`);
      showNotification('Style deleted successfully', 'success');
      fetchStyles();
    } catch (err) {
      showNotification('Failed to delete style', 'error');
    } finally {
      setIsDeleteModalOpen(false);
      setStyleToDelete(null);
    }
  };

  const moveOrder = async (index, direction) => {
    if (direction === -1 && index === 0) return;
    if (direction === 1 && index === styles.length - 1) return;

    const currentItem = styles[index];
    const swapItem = styles[index + direction];

    try {
      await axios.put(`/api/community-styles/${currentItem.id}`, { order: swapItem.order || (index + direction) });
      await axios.put(`/api/community-styles/${swapItem.id}`, { order: currentItem.order || index });
      fetchStyles();
    } catch (err) {
      showNotification('Failed to update order', 'error');
    }
  };

  const filteredStyles = styles.filter(s => 
    s.altText?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.tag?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Steal The Style</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage community looks and style images.</p>
        </div>
        <Link to="/community-styles/new" className="btn-primary flex items-center justify-center gap-2">
          <Plus className="w-4.5 h-4.5" />
          <span>Add Style</span>
        </Link>
      </div>

      <div className="glass-card mb-6 p-4">
        <div className="relative max-w-md">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by tag or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input pl-10"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredStyles.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Camera className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">No styles found</h3>
          <p className="text-slate-500 dark:text-slate-400">Add some community styles to showcase.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredStyles.map((style, index) => (
            <div key={style.id} className="glass-card overflow-hidden group">
              <div className="relative aspect-[3/4] bg-slate-100 dark:bg-slate-800">
                <img 
                  src={style.image.startsWith('http') ? style.image : `http://localhost:5000${style.image}`}
                  alt={style.altText} 
                  className="w-full h-full object-cover" 
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                  <Link 
                    to={`/community-styles/edit/${style.id}`}
                    className="p-2 bg-white rounded-full text-slate-800 hover:text-brand-600 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Link>
                  <button 
                    onClick={() => handleDeleteClick(style)}
                    className="p-2 bg-white rounded-full text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="absolute top-2 left-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button 
                    onClick={() => moveOrder(index, -1)}
                    disabled={index === 0}
                    className="p-1.5 bg-white/90 backdrop-blur rounded text-slate-700 hover:bg-white disabled:opacity-50"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => moveOrder(index, 1)}
                    disabled={index === styles.length - 1}
                    className="p-1.5 bg-white/90 backdrop-blur rounded text-slate-700 hover:bg-white disabled:opacity-50"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-slate-800 dark:text-white truncate">{style.tag}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${style.status === 'Active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                    {style.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{style.altText}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Style"
        message="Are you sure you want to delete this image? It will be removed from the frontend."
      />
    </div>
  );
};

export default CommunityStyleList;

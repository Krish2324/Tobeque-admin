import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Plus, Search, Edit2, Trash2 } from 'lucide-react';
import axios from 'axios';
import { useNotification } from '../context/NotificationContext';
import Table from '../components/Table';
import DeleteModal from '../components/DeleteModal';

const JobPostingList = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/job-postings');
      setJobs(res.data.data || []);
    } catch (err) {
      showNotification('Failed to fetch jobs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (job) => {
    setJobToDelete(job);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!jobToDelete) return;
    try {
      await axios.delete(`/api/job-postings/${jobToDelete.id}`);
      showNotification('Job deleted successfully', 'success');
      fetchJobs();
    } catch (err) {
      showNotification('Failed to delete job', 'error');
    } finally {
      setIsDeleteModalOpen(false);
      setJobToDelete(null);
    }
  };

  const filteredJobs = jobs.filter(j => 
    j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      header: 'Job Title',
      accessor: (row) => (
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-500 mr-3">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <div className="font-semibold text-slate-800 dark:text-white">{row.title}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">{row.department} • {row.location}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Type',
      accessor: (row) => (
        <span className="text-sm text-slate-600 dark:text-slate-300">
          {row.type}
        </span>
      )
    },
    {
      header: 'Status',
      accessor: (row) => (
        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
          row.status === 'Open' 
            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
        }`}>
          {row.status}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <Link 
            to={`/job-postings/edit/${row.id}`}
            className="p-2 text-slate-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit2 className="w-4.5 h-4.5" />
          </Link>
          <button 
            onClick={() => handleDeleteClick(row)}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4.5 h-4.5" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Job Postings</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage career opportunities on the website.</p>
        </div>
        <Link to="/job-postings/new" className="btn-primary flex items-center justify-center gap-2">
          <Plus className="w-4.5 h-4.5" />
          <span>Post Job</span>
        </Link>
      </div>

      <div className="glass-card mb-6 p-4">
        <div className="relative max-w-md">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search jobs by title or dept..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input pl-10"
          />
        </div>
      </div>

      <div className="glass-card">
        <Table 
          columns={columns} 
          data={filteredJobs} 
          isLoading={loading} 
          emptyMessage="No job postings found. Create your first opening."
        />
      </div>

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Job"
        message={`Are you sure you want to delete the job "${jobToDelete?.title}"? This action cannot be undone.`}
      />
    </div>
  );
};

export default JobPostingList;

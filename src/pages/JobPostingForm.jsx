import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Plus, X } from 'lucide-react';
import axios from 'axios';
import { useNotification } from '../context/NotificationContext';

const JobPostingForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    location: '',
    type: 'Full-time',
    description: '',
    requirements: [],
    status: 'Open'
  });
  
  const [newRequirement, setNewRequirement] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);

  useEffect(() => {
    if (isEditMode) {
      fetchJob();
    }
  }, [id]);

  const fetchJob = async () => {
    try {
      const res = await axios.get(`/api/job-postings/${id}`);
      setFormData(res.data.data);
    } catch (err) {
      showNotification('Failed to fetch job details', 'error');
      navigate('/job-postings');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddRequirement = () => {
    if (newRequirement.trim()) {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, newRequirement.trim()]
      }));
      setNewRequirement('');
    }
  };

  const handleRemoveRequirement = (index) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isEditMode) {
        await axios.put(`/api/job-postings/${id}`, formData);
        showNotification('Job updated successfully', 'success');
      } else {
        await axios.post('/api/job-postings', formData);
        showNotification('Job posted successfully', 'success');
      }
      navigate('/job-postings');
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to save job', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link to="/job-postings" className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
              {isEditMode ? 'Edit Job Posting' : 'Create Job Posting'}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Add details for a new career opportunity at Tobeque.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="glass-card p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="form-label">Job Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="e.g. Senior Fashion Designer"
                className="form-input text-lg font-medium"
              />
            </div>
            
            <div>
              <label className="form-label">Department *</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
                placeholder="e.g. Design, Marketing"
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">Location *</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                placeholder="e.g. New Delhi, Remote"
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">Employment Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="form-input"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            <div>
              <label className="form-label">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="form-input"
              >
                <option value="Open">Open</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="form-label">Job Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="6"
              placeholder="Describe the role, responsibilities, and team..."
              className="form-input"
            ></textarea>
          </div>

          <div>
            <label className="form-label mb-3">Requirements</label>
            
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newRequirement}
                onChange={(e) => setNewRequirement(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddRequirement())}
                placeholder="Add a requirement..."
                className="form-input flex-1"
              />
              <button 
                type="button" 
                onClick={handleAddRequirement}
                className="btn-secondary whitespace-nowrap"
              >
                <Plus className="w-4 h-4 mr-1" /> Add
              </button>
            </div>

            {formData.requirements.length > 0 ? (
              <ul className="space-y-2">
                {formData.requirements.map((req, index) => (
                  <li key={index} className="flex items-start justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700">
                    <span className="text-sm text-slate-700 dark:text-slate-300 flex-1">{req}</span>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveRequirement(index)}
                      className="text-slate-400 hover:text-red-500 transition-colors shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-slate-500 dark:text-slate-400 italic">No requirements added yet.</div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link to="/job-postings" className="btn-secondary py-3 px-6">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary py-3 px-8 flex items-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Save className="w-4.5 h-4.5" />
                {isEditMode ? 'Update Job' : 'Post Job'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default JobPostingForm;

import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import Modal from './Modal';

const DeleteModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col items-center text-center p-2">
        <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center mb-4 text-red-600 dark:text-red-400">
          <AlertTriangle className="w-6 h-6" />
        </div>
        
        <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm">
          {message || "Are you sure you want to delete this item? This action cannot be undone."}
        </p>

        <div className="flex w-full gap-3 mt-2">
          <button 
            onClick={onClose} 
            className="flex-1 btn-secondary py-2.5"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm} 
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl text-sm transition-colors flex items-center justify-center gap-2 py-2.5"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteModal;

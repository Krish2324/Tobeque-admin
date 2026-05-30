import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const showNotification = useCallback((message, type = 'success') => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, type }]);

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((item) => item.id !== id));
    }, 4000);
  }, []);

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}

      {/* Toast Stack Absolute Overlay */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 w-full max-w-sm">
        <AnimatePresence>
          {notifications.map((n) => {
            let icon = <CheckCircle className="w-5 h-5 text-emerald-500" />;
            let bgClass = 'bg-white border-emerald-100 dark:bg-slate-900 dark:border-emerald-950/50';
            
            if (n.type === 'error') {
              icon = <XCircle className="w-5 h-5 text-rose-500" />;
              bgClass = 'bg-white border-rose-100 dark:bg-slate-900 dark:border-rose-950/50';
            } else if (n.type === 'warning') {
              icon = <AlertTriangle className="w-5 h-5 text-amber-500" />;
              bgClass = 'bg-white border-amber-100 dark:bg-slate-900 dark:border-amber-950/50';
            } else if (n.type === 'info') {
              icon = <Info className="w-5 h-5 text-sky-500" />;
              bgClass = 'bg-white border-sky-100 dark:bg-slate-900 dark:border-sky-950/50';
            }

            return (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 100, transition: { duration: 0.15 } }}
                className={`flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md ${bgClass}`}
              >
                <div className="flex-shrink-0 mt-0.5">{icon}</div>
                <div className="flex-grow text-sm font-medium text-slate-700 dark:text-slate-200">
                  {n.message}
                </div>
                <button
                  onClick={() => removeNotification(n.id)}
                  className="flex-shrink-0 text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);

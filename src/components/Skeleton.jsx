import React from 'react';

export const SkeletonLine = ({ className = 'h-4 w-full' }) => (
  <div className={`bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse ${className}`} />
);

export const SkeletonCircle = ({ className = 'w-10 h-10' }) => (
  <div className={`bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse ${className}`} />
);

export const SkeletonCard = () => (
  <div className="glass-card p-6 flex flex-col justify-between h-40 animate-pulse">
    <div className="flex items-start justify-between">
      <div className="flex-1 space-y-3">
        <SkeletonLine className="h-3 w-1/3" />
        <SkeletonLine className="h-7 w-2/3" />
      </div>
      <SkeletonCircle className="w-12 h-12 rounded-2xl" />
    </div>
    <div className="border-t border-slate-100 dark:border-slate-800/40 pt-3 mt-4">
      <SkeletonLine className="h-3.5 w-1/2" />
    </div>
  </div>
);

export const SkeletonDashboard = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="glass-card p-6 h-96 lg:col-span-2 space-y-4">
        <SkeletonLine className="h-5 w-1/4" />
        <SkeletonLine className="h-64" />
      </div>
      <div className="glass-card p-6 h-96 space-y-4">
        <SkeletonLine className="h-5 w-1/3" />
        <SkeletonLine className="h-64" />
      </div>
    </div>
  </div>
);

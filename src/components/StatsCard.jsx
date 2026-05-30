import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatsCard = ({ title, value, icon: Icon, trend, description, color = 'brand' }) => {
  let iconBg = 'bg-gradient-to-tr from-brand-600 to-violet-500 text-white shadow-md shadow-brand-500/20';
  let borderHover = 'hover:border-brand-500/35';

  if (color === 'emerald') {
    iconBg = 'bg-gradient-to-tr from-teal-500 to-emerald-600 text-white shadow-md shadow-emerald-500/20';
    borderHover = 'hover:border-emerald-500/35';
  } else if (color === 'rose') {
    iconBg = 'bg-gradient-to-tr from-rose-500 to-pink-500 text-white shadow-md shadow-rose-500/20';
    borderHover = 'hover:border-rose-500/35';
  } else if (color === 'amber') {
    iconBg = 'bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/20';
    borderHover = 'hover:border-amber-500/35';
  } else if (color === 'sky') {
    iconBg = 'bg-gradient-to-tr from-sky-400 to-blue-500 text-white shadow-md shadow-sky-500/20';
    borderHover = 'hover:border-sky-500/35';
  }

  return (
    <div className={`glass-card p-6 flex flex-col justify-between transition-all duration-300 border-transparent hover:-translate-y-1 hover:shadow-xl ${borderHover}`}>
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-450 uppercase tracking-wider">
            {title}
          </span>
          <span className="text-2xl md:text-3xl font-bold tracking-tight text-slate-800 dark:text-white mt-1">
            {value}
          </span>
        </div>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${iconBg}`}>
          <Icon className="w-5.5 h-5.5" />
        </div>
      </div>

      {/* Trend badges */}
      {(trend || description) && (
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/40 text-xs">
          {trend && (
            <span className={`flex items-center gap-1 font-bold px-2 py-0.5 rounded-lg ${
              trend.type === 'up' 
                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-450' 
                : 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-450'
            }`}>
              {trend.type === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {trend.value}
            </span>
          )}
          {description && (
            <span className="text-slate-450 dark:text-slate-400 font-medium">
              {description}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default StatsCard;

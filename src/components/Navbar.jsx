import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Menu, Sun, Moon, Bell, ChevronDown, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = ({ toggleSidebar, toggleMobileSidebar }) => {
  const { admin, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);

  // Parse path breadcrumbs
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard Overview';
    if (path.startsWith('/products')) return 'Products Management';
    if (path.startsWith('/categories')) return 'Categories & Brands';
    if (path.startsWith('/orders')) return 'Orders Fulfilment';
    if (path.startsWith('/customers')) return 'Customers Accounts';
    if (path.startsWith('/coupons')) return 'Promo Coupons';
    if (path.startsWith('/inventory')) return 'Inventory Audit';
    if (path.startsWith('/banners')) return 'Storefront Sliders';
    if (path.startsWith('/reviews')) return 'Ratings & Moderations';
    if (path.startsWith('/reports')) return 'Business Analytics';
    if (path.startsWith('/settings')) return 'Global Configurations';
    if (path.startsWith('/logs')) return 'Admins Activity Logs';
    return 'Admin Core';
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 right-0 z-20 h-16 w-full glass-navbar flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        {/* Toggle buttons */}
        <button
          onClick={toggleMobileSidebar}
          className="lg:hidden text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
        >
          <Menu className="w-5 h-5" />
        </button>
        <button
          onClick={toggleSidebar}
          className="hidden lg:block text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight">
          {getPageTitle()}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        {/* Theme Mode toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-650 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition-colors"
          title="Toggle Theme"
        >
          {darkMode ? <Sun className="w-4.5 h-4.5 text-amber-500" /> : <Moon className="w-4.5 h-4.5" />}
        </button>

        {/* Notifications mock icon */}
        <button className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-650 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 relative transition-colors">
          <Bell className="w-4.5 h-4.5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500" />
        </button>

        {/* Profile Card dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center font-bold text-brand-600 dark:text-brand-400 text-xs">
              {admin?.name ? admin.name.substring(0, 2).toUpperCase() : 'AD'}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 leading-tight">
                {admin?.name}
              </span>
              <span className="text-[10px] text-slate-450 dark:text-slate-400 capitalize">
                {admin?.role}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {profileOpen && (
            <>
              {/* Overlay back to close */}
              <div onClick={() => setProfileOpen(false)} className="fixed inset-0 z-30" />
              <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl shadow-xl z-40 py-2">
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800/60 flex flex-col">
                  <span className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                    {admin?.name}
                  </span>
                  <span className="text-xs text-slate-450 dark:text-slate-400 truncate">
                    {admin?.email}
                  </span>
                </div>
                <Link
                  to="/settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-650 hover:bg-slate-50 dark:text-slate-350 dark:hover:bg-slate-800 transition-colors"
                >
                  <User className="w-4 h-4" />
                  My Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2.5 w-full text-left px-4 py-2 text-sm text-rose-650 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/20 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;

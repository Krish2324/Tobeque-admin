import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, ShoppingBag, FolderTree, ShoppingCart, Users,
  Ticket, ClipboardList, Image, Star, FileBarChart, Settings,
  Activity, LogOut, ChevronLeft, ChevronRight, Menu, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, toggleSidebar, mobileOpen, toggleMobileSidebar }) => {
  const { logout, admin } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['superadmin', 'manager', 'editor'] },
    { name: 'Products', path: '/products', icon: ShoppingBag, roles: ['superadmin', 'manager', 'editor'] },
    { name: 'Categories & Brands', path: '/categories', icon: FolderTree, roles: ['superadmin', 'manager', 'editor'] },
    { name: 'Orders', path: '/orders', icon: ShoppingCart, roles: ['superadmin', 'manager', 'editor'] },
    { name: 'Customers', path: '/customers', icon: Users, roles: ['superadmin', 'manager'] },
    { name: 'Coupons', path: '/coupons', icon: Ticket, roles: ['superadmin', 'manager'] },
    { name: 'Inventory Logs', path: '/inventory', icon: ClipboardList, roles: ['superadmin', 'manager'] },
    { name: 'Promo Banners', path: '/banners', icon: Image, roles: ['superadmin', 'manager'] },
    { name: 'Reviews', path: '/reviews', icon: Star, roles: ['superadmin', 'manager', 'editor'] },
    { name: 'Reports & Stats', path: '/reports', icon: FileBarChart, roles: ['superadmin', 'manager'] },
    { name: 'System Settings', path: '/settings', icon: Settings, roles: ['superadmin'] },
    { name: 'Activity Logs', path: '/logs', icon: Activity, roles: ['superadmin'] }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredItems = navItems.filter(item => !item.roles || item.roles.includes(admin?.role));

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white text-slate-800 dark:bg-dark-950 dark:text-slate-100 border-r border-slate-200/50 dark:border-slate-800/40 transition-colors duration-300">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800/55 h-16">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🛍️</span>
          {(isOpen || mobileOpen) && (
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-lg font-extrabold tracking-wider bg-gradient-to-r from-brand-600 to-violet-500 dark:from-brand-400 dark:to-violet-300 bg-clip-text text-transparent"
            >
              TOBEQUE
            </motion.h1>
          )}
        </div>
        {mobileOpen && (
          <button onClick={toggleMobileSidebar} className="lg:hidden text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Admin Quick Profile Display */}
      {(isOpen || mobileOpen) && (
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800/40 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-50 border border-brand-200 dark:bg-brand-500/20 dark:border-brand-500/30 flex items-center justify-center font-bold text-brand-600 dark:text-brand-300 text-sm">
            {admin?.name ? admin.name.substring(0, 2).toUpperCase() : 'AD'}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">{admin?.name}</span>
            <span className="text-[10px] text-brand-600 dark:text-brand-400 uppercase font-bold tracking-wider">{admin?.role}</span>
          </div>
        </div>
      )}

      {/* Navigation list */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto custom-scrollbar">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => mobileOpen && toggleMobileSidebar()}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 relative group ${
                  isActive
                    ? 'bg-gradient-to-r from-brand-600 via-brand-600 to-violet-600 text-white shadow-lg shadow-brand-500/20 scale-[1.02]'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/40 dark:hover:text-slate-100'
                }`
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {(isOpen || mobileOpen) && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="truncate"
                >
                  {item.name}
                </motion.span>
              )}
              {/* Tooltip on collapsed state */}
              {!isOpen && !mobileOpen && (
                <div className="absolute left-14 bg-slate-900 text-white text-xs rounded px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-[999] shadow-md border border-slate-800">
                  {item.name}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Logout Footer Row */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800/55">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/10 dark:hover:text-rose-450 transition-all"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {(isOpen || mobileOpen) && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar drawer */}
      <aside 
        className={`hidden lg:block h-screen fixed top-0 left-0 z-30 transition-all duration-200 ${
          isOpen ? 'w-64' : 'w-20'
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Drawer Slide overlay */}
      <div className={`lg:hidden fixed inset-0 z-[999] transition-opacity duration-200 ${
        mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}>
        {/* Backdrop filter overlay */}
        <div onClick={toggleMobileSidebar} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <div className={`absolute top-0 left-0 bottom-0 w-64 transform transition-transform duration-200 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <SidebarContent />
        </div>
      </div>
    </>
  );
};

export default Sidebar;

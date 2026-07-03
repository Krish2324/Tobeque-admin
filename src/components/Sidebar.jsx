import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, ShoppingBag, FolderTree, ShoppingCart, Users,
  Ticket, ClipboardList, Image, Star, FileBarChart, Settings,
  Activity, LogOut, ChevronLeft, ChevronRight, Menu, X, Layers, MessageSquare, Briefcase, HelpCircle, Mail
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, toggleSidebar, mobileOpen, toggleMobileSidebar }) => {
  const { logout, admin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navGroups = [
    {
      title: 'Core',
      items: [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['superadmin', 'manager', 'editor'] },
        { name: 'Reports & Stats', path: '/reports', icon: FileBarChart, roles: ['superadmin', 'manager'] },
      ]
    },
    {
      title: 'E-Commerce',
      items: [
        { name: 'Products', path: '/products', icon: ShoppingBag, roles: ['superadmin', 'manager', 'editor'] },
        { name: 'Categories & Brands', path: '/categories', icon: FolderTree, roles: ['superadmin', 'manager', 'editor'] },
        { name: 'Orders', path: '/orders', icon: ShoppingCart, roles: ['superadmin', 'manager', 'editor'] },
        { name: 'Inventory Logs', path: '/inventory', icon: ClipboardList, roles: ['superadmin', 'manager'] },
      ]
    },
    {
      title: 'Marketing & Content',
      items: [
        { name: 'Promo Banners', path: '/banners', icon: Image, roles: ['superadmin', 'manager'] },
        { name: 'Season Collection', path: '/season-collection', icon: Layers, roles: ['superadmin', 'manager', 'editor'] },
        { name: 'Coupons', path: '/coupons', icon: Ticket, roles: ['superadmin', 'manager'] },
      ]
    },
    {
      title: 'Support & Engagement',
      items: [
        { name: 'Customers', path: '/customers', icon: Users, roles: ['superadmin', 'manager'] },
        { name: 'Inquiries', path: '/inquiries', icon: MessageSquare, roles: ['superadmin', 'manager', 'editor'] },
        { name: 'Refund Requests', path: '/refund-requests', icon: ClipboardList, roles: ['superadmin', 'manager', 'editor'] },
        { name: 'Reviews', path: '/reviews', icon: Star, roles: ['superadmin', 'manager', 'editor'] },
        { name: 'FAQs', path: '/faqs', icon: HelpCircle, roles: ['superadmin', 'manager', 'editor'] },
        { name: 'Newsletter', path: '/subscribers', icon: Mail, roles: ['superadmin', 'manager', 'editor'] },
        { name: 'Job Applications', path: '/job-applications', icon: Briefcase, roles: ['superadmin', 'manager'] },
      ]
    },
    {
      title: 'System',
      items: [
        { name: 'Settings', path: '/settings', icon: Settings, roles: ['superadmin'] },
        { name: 'Activity Logs', path: '/logs', icon: Activity, roles: ['superadmin'] }
      ]
    }
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white text-slate-800 dark:bg-dark-950 dark:text-slate-100 border-r border-slate-200/50 dark:border-slate-800/40 transition-colors duration-300">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800/55 h-16 shrink-0">
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

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-6 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
        <div className="px-3 space-y-6">
          {navGroups.map((group, groupIdx) => {
            const groupItems = group.items.filter(item => !item.roles || item.roles.includes(admin?.role));
            if (groupItems.length === 0) return null;

            return (
              <div key={groupIdx} className="flex flex-col gap-1.5">
                {/* Group Header */}
                {(isOpen || mobileOpen) ? (
                  <div className="px-4 pb-1">
                    <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400 dark:text-slate-500">
                      {group.title}
                    </span>
                  </div>
                ) : (
                  <div className="w-full h-px bg-slate-200 dark:bg-slate-700/50 my-1.5" />
                )}

                {/* Group Items */}
                <div className="flex flex-col gap-1">
                  {groupItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={index}
                        to={item.path}
                        onClick={() => mobileOpen && toggleMobileSidebar()}
                        className={({ isActive }) => `
                          flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative
                          ${isActive 
                            ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300 font-medium shadow-sm' 
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-200'
                          }
                        `}
                        title={(!isOpen && !mobileOpen) ? item.name : undefined}
                      >
                        <Icon className={`w-5 h-5 shrink-0 transition-colors ${!isOpen && !mobileOpen ? 'mx-auto' : ''}`} />
                        {(isOpen || mobileOpen) && (
                          <span className="text-sm whitespace-nowrap">{item.name}</span>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* User Footer */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800/55 shrink-0 bg-slate-50/50 dark:bg-slate-900/30">
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 px-3 py-3 w-full rounded-xl text-slate-600 dark:text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 transition-colors group
            ${!isOpen && !mobileOpen ? 'justify-center' : ''}`}
          title={(!isOpen && !mobileOpen) ? 'Logout' : undefined}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {(isOpen || mobileOpen) && (
            <span className="text-sm font-medium whitespace-nowrap">Logout</span>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleMobileSidebar}
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 lg:hidden ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </div>

      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isOpen ? '280px' : '80px' }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="hidden lg:block fixed inset-y-0 left-0 z-40 bg-white dark:bg-dark-950 border-r border-slate-200/50 dark:border-slate-800/40"
      >
        <SidebarContent />
        
        {/* Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-20 bg-white dark:bg-dark-950 border border-slate-200 dark:border-slate-700 rounded-full p-1.5 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 shadow-sm transition-colors z-50"
        >
          {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </motion.aside>

      {/* Top Navbar for Mobile */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-dark-950 border-b border-slate-200 dark:border-slate-800 z-30 flex items-center px-4">
        <button
          onClick={toggleMobileSidebar}
          className="p-2 -ml-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="ml-4 text-lg font-bold tracking-widest bg-gradient-to-r from-brand-600 to-violet-500 bg-clip-text text-transparent">
          TOBEQUE
        </div>
      </div>
    </>
  );
};

export default Sidebar;

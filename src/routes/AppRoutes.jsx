import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import ProductList from '../pages/ProductList';
import ProductForm from '../pages/ProductForm';
import CategoryList from '../pages/CategoryList';
import OrderList from '../pages/OrderList';
import OrderDetail from '../pages/OrderDetail';
import CustomerList from '../pages/CustomerList';
import CouponList from '../pages/CouponList';
import InventoryList from '../pages/InventoryList';
import BannerList from '../pages/BannerList';
import ReviewList from '../pages/ReviewList';
import Reports from '../pages/Reports';
import Settings from '../pages/Settings';
import AdminLogs from '../pages/AdminLogs';
import SeasonCollection from '../pages/SeasonCollection';
import InquiryList from '../pages/InquiryList';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />

      {/* Private Admin Console Routes */}
      <Route path="/" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        
        {/* Products */}
        <Route path="products" element={<ProductList />} />
        <Route path="products/new" element={<ProductForm />} />
        <Route path="products/edit/:id" element={<ProductForm />} />

        {/* Categories & Brands */}
        <Route path="categories" element={<CategoryList />} />

        {/* Orders */}
        <Route path="orders" element={<OrderList />} />
        <Route path="orders/:id" element={<OrderDetail />} />

        {/* Customers */}
        <Route path="customers" element={<CustomerList />} />

        {/* Coupons */}
        <Route path="coupons" element={<CouponList />} />

        {/* Inventory Audit logs */}
        <Route path="inventory" element={<InventoryList />} />

        {/* Banner carousel uploads */}
        <Route path="banners" element={<BannerList />} />

        {/* Product Reviews */}
        <Route path="reviews" element={<ReviewList />} />

        {/* Customer Inquiries */}
        <Route path="inquiries" element={<InquiryList />} />

        {/* Financial Business Reports */}
        <Route path="reports" element={<Reports />} />

        {/* System & Profile Settings */}
        <Route path="settings" element={<Settings />} />

        {/* Season Collection */}
        <Route path="season-collection" element={<SeasonCollection />} />

        {/* Security Logs Audit Trail */}
        <Route path="logs" element={<AdminLogs />} />
      </Route>

      {/* Wildcard Fallback redirection */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;

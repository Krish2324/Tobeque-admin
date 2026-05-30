import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Search, Filter, Image, Package, Check, X } from 'lucide-react';
import axios from 'axios';
import Table from '../components/Table';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  
  // Filtering & Pagination State
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState('DESC');

  const { showNotification } = useNotification();
  const { admin } = useAuth();
  const navigate = useNavigate();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/products', {
        params: {
          page,
          limit,
          search,
          category: categoryFilter,
          brand: brandFilter,
          status: statusFilter,
          sortBy,
          sortDir
        }
      });
      if (res.data.success) {
        setProducts(res.data.data.products);
        setTotalPages(res.data.data.pagination.pages);
        setTotalProducts(res.data.data.pagination.total);
      }
    } catch (err) {
      console.error('Error loading products:', err);
      showNotification('Failed to fetch catalog list.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchFilters = async () => {
    try {
      const [catRes, brandRes] = await Promise.all([
        axios.get('/api/categories'),
        axios.get('/api/categories/brands/all')
      ]);
      if (catRes.data.success) setCategories(catRes.data.categories);
      if (brandRes.data.success) setBrands(brandRes.data.brands);
    } catch (err) {
      console.error('Error loading filters list:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, search, categoryFilter, brandFilter, statusFilter, sortBy, sortDir]);

  useEffect(() => {
    fetchFilters();
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you absolutely sure you want to delete "${name}"? This cascades to images!`)) return;

    try {
      const res = await axios.delete(`/api/products/${id}`);
      if (res.data.success) {
        showNotification(`Product "${name}" deleted successfully.`, 'success');
        fetchProducts();
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to delete product.';
      showNotification(msg, 'error');
    }
  };

  // Define Table Columns
  const columns = [
    {
      header: 'Item',
      accessor: 'name',
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-3">
          <img
            src={row.thumbnail || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100'}
            alt={row.name}
            className="w-11 h-11 rounded-xl object-cover border border-slate-200 dark:border-slate-800"
          />
          <div className="flex flex-col">
            <span className="font-semibold text-slate-850 dark:text-white line-clamp-1">{row.name}</span>
            <span className="text-[10px] text-slate-450 dark:text-slate-450 uppercase font-bold tracking-wider">{row.sku}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Category',
      accessor: 'categoryId',
      cell: (row) => (
        <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-300 px-2.5 py-1 rounded-lg">
          {row.category?.name || 'Unassigned'}
        </span>
      )
    },
    {
      header: 'Brand',
      accessor: 'brandId',
      cell: (row) => (
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-350">
          {row.brand?.name || 'Generic'}
        </span>
      )
    },
    {
      header: 'Price',
      accessor: 'price',
      sortable: true,
      cell: (row) => (
        <div className="flex flex-col">
          {row.discountPrice ? (
            <>
              <span className="font-extrabold text-slate-800 dark:text-white">₹{parseFloat(row.discountPrice).toFixed(2)}</span>
              <span className="text-[10px] text-rose-500 line-through">₹{parseFloat(row.price).toFixed(2)}</span>
            </>
          ) : (
            <span className="font-extrabold text-slate-850 dark:text-white">₹{parseFloat(row.price).toFixed(2)}</span>
          )}
        </div>
      )
    },
    {
      header: 'Stock',
      accessor: 'stockQuantity',
      sortable: true,
      cell: (row) => {
        const qty = row.stockQuantity;
        let style = 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-450';
        if (qty === 0) style = 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-450';
        else if (qty <= 10) style = 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-450';

        return (
          <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${style}`}>
            {qty} units
          </span>
        );
      }
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => {
        const status = row.status;
        let style = 'bg-slate-100 text-slate-650 dark:bg-slate-800 dark:text-slate-400';
        if (status === 'published') style = 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-450';
        if (status === 'draft') style = 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-450';

        return (
          <span className={`px-2.5 py-1 rounded-lg text-xs font-extrabold capitalize tracking-wide ${style}`}>
            {status}
          </span>
        );
      }
    },
    {
      header: 'Actions',
      accessor: 'id',
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          <Link
            to={`/products/edit/${row.id}`}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-350 transition-colors"
          >
            <Edit className="w-4 h-4" />
          </Link>
          {['superadmin', 'manager'].includes(admin?.role) && (
            <button
              onClick={() => handleDelete(row.id, row.name)}
              className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/20 dark:hover:bg-rose-950/30 dark:text-rose-450 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">Products Catalog</h1>
          <p className="text-xs text-slate-450 dark:text-slate-400 font-medium">Add, modify, and delete catalog items, sizes/color variants, and photo galleries</p>
        </div>
        <Link to="/products/new" className="btn-primary py-2.5 px-4 rounded-xl text-sm font-semibold shadow-lg">
          <Plus className="w-4.5 h-4.5" />
          Add Product
        </Link>
      </div>

      {/* Advanced Filters Row */}
      <div className="glass-card p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="form-label text-xs">Search Keywords</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, SKU..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="form-input pl-9 text-xs"
            />
          </div>
        </div>

        <div>
          <label className="form-label text-xs">Category</label>
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            className="form-input text-xs h-[38px] py-1 bg-slate-50 dark:bg-slate-800"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="form-label text-xs">Brand</label>
          <select
            value={brandFilter}
            onChange={(e) => { setBrandFilter(e.target.value); setPage(1); }}
            className="form-input text-xs h-[38px] py-1 bg-slate-50 dark:bg-slate-800"
          >
            <option value="">All Brands</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="form-label text-xs">Catalog Status</label>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="form-input text-xs h-[38px] py-1 bg-slate-50 dark:bg-slate-800"
          >
            <option value="">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Main Catalog Table */}
      <div className="glass-card p-6">
        <Table
          columns={columns}
          data={products}
          loading={loading}
          pagination={{
            total: totalProducts,
            page,
            limit,
            pages: totalPages,
            onPageChange: (p) => setPage(p)
          }}
          sorting={{
            sortBy,
            sortDir,
            onSort: (col, dir) => {
              setSortBy(col);
              setSortDir(dir);
            }
          }}
          exportFileName="products-catalog"
        />
      </div>
    </div>
  );
};

export default ProductList;

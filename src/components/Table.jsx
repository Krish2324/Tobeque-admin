import React from 'react';
import { ChevronUp, ChevronDown, Download, Search } from 'lucide-react';

const Table = ({
  columns,
  data = [],
  loading = false,
  searchPlaceholder = 'Search records...',
  searchValue = '',
  onSearchChange,
  pagination = null, // { total, page, limit, pages, onPageChange }
  sorting = null, // { sortBy, sortDir, onSort }
  exportFileName = 'report'
}) => {
  
  // Dynamic column sorting trigger
  const handleSortClick = (key) => {
    if (!sorting || !key) return;
    const isAsc = sorting.sortBy === key && sorting.sortDir === 'ASC';
    sorting.onSort(key, isAsc ? 'DESC' : 'ASC');
  };

  // Dynamic CSV formatting and downloading
  const handleExportCSV = () => {
    if (data.length === 0) return;
    
    // Extract headers
    const headers = columns.map(c => c.header).join(',');
    
    // Extract row cell values
    const rows = data.map(row => {
      return columns.map(col => {
        const val = typeof col.accessor === 'function' 
          ? col.accessor(row) 
          : row[col.accessor];
        // Clean values for CSV syntax
        const cleaned = val !== undefined && val !== null 
          ? `"${val.toString().replace(/"/g, '""')}"` 
          : '""';
        return cleaned;
      }).join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${exportFileName}-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Top Filter and Actions Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {onSearchChange && (
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="form-input pl-10 text-sm"
            />
          </div>
        )}
        
        {data.length > 0 && (
          <button
            onClick={handleExportCSV}
            className="btn-secondary text-xs flex items-center justify-center gap-1.5 py-2 px-3 border border-slate-200 dark:border-slate-800 self-end md:self-auto"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        )}
      </div>

      {/* Grid Container */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200/50 dark:border-slate-800/80 bg-white/50 dark:bg-dark-950/20 backdrop-blur-md">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-slate-100/70 dark:bg-slate-850/50 text-slate-600 dark:text-slate-350 border-b border-slate-200/50 dark:border-slate-800/60 uppercase font-bold tracking-wider text-[10px]">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  onClick={() => col.sortable && handleSortClick(col.accessor)}
                  className={`px-6 py-4 ${col.sortable ? 'cursor-pointer select-none hover:bg-slate-200/50 dark:hover:bg-slate-800/30' : ''}`}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {col.sortable && sorting && sorting.sortBy === col.accessor && (
                      sorting.sortDir === 'ASC' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-150 dark:divide-slate-800/50">
            {loading ? (
              // Renders skeleton rows
              Array.from({ length: 5 }).map((_, rIdx) => (
                <tr key={rIdx} className="animate-pulse">
                  {columns.map((_, cIdx) => (
                    <td key={cIdx} className="px-6 py-4.5">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-450 dark:text-slate-400 font-semibold">
                  No records matching your search queries.
                </td>
              </tr>
            ) : (
              data.map((row, rIdx) => (
                <tr
                  key={rIdx}
                  className="hover:bg-slate-50/50 dark:hover:bg-dark-850/30 transition-colors"
                >
                  {columns.map((col, cIdx) => (
                    <td key={cIdx} className="px-6 py-4.5 text-slate-700 dark:text-slate-300 font-medium">
                      {col.cell ? col.cell(row) : (typeof col.accessor === 'function' ? col.accessor(row) : row[col.accessor])}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls Row */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between px-2 text-xs font-semibold text-slate-500 mt-2">
          <span>
            Showing Page {pagination.page} of {pagination.pages} ({pagination.total} total items)
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none dark:bg-slate-800 dark:border-slate-750 dark:hover:bg-slate-700 dark:text-slate-200 transition-all"
            >
              Previous
            </button>
            <button
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none dark:bg-slate-800 dark:border-slate-750 dark:hover:bg-slate-700 dark:text-slate-200 transition-all"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;

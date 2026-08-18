/**
 * Resolves any image URL or backend upload path to a full working image URL.
 * Handles:
 * - full http(s) URLs & data URLs (returned as-is)
 * - Windows paths with backslashes (converted to /)
 * - Relative paths like "uploads/categories/..." or "/uploads/categories/..."
 * - Appends VITE_API_URL when configured
 * - Automatically falls back to production backend (https://backend.tobeque.com) when running on Hostinger domain (admin.tobeque.com / tobeque.com)
 */
export const resolveImageUrl = (path) => {
  if (!path || typeof path !== 'string') return '';
  const trimmed = path.trim();
  if (!trimmed) return '';

  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }

  const normalizedPath = trimmed.replace(/\\/g, '/');
  const cleanPath = normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`;

  let apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

  // Smart fallback for production hostinger domains if VITE_API_URL was not set during build
  if (!apiBase && typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host && !host.includes('localhost') && !host.includes('127.0.0.1')) {
      apiBase = 'https://backend.tobeque.com';
    }
  }

  return apiBase ? `${apiBase}${cleanPath}` : cleanPath;
};

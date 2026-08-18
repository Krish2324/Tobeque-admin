/**
 * Resolves any image URL or backend upload path to a full working image URL.
 * Handles:
 * - full http(s) URLs & data URLs (returned as-is)
 * - Windows paths with backslashes (converted to /)
 * - Relative paths like "uploads/categories/..." or "/uploads/categories/..."
 * - Appends VITE_API_URL when configured, or returns clean leading slash for local Vite proxy
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

  const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
  return apiBase ? `${apiBase}${cleanPath}` : cleanPath;
};

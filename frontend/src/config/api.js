const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export const buildApiUrl = (value = '') => {
  if (!value) return API_URL || '/';
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  const normalized = value.startsWith('/') ? value : `/${value}`;
  return API_URL ? `${API_URL}${normalized}` : normalized;
};

export default API_URL;

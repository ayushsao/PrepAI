const envApiBase = import.meta.env.VITE_API_URL;
const envApiPort = import.meta.env.VITE_API_PORT || '3001';

const trimTrailingSlash = (value: string) => value.replace(/\/$/, '');

const resolveApiBase = () => {
  if (envApiBase) {
    return trimTrailingSlash(envApiBase);
  }

  if (import.meta.env.PROD) {
    return '/api';
  }

  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol;
    const host = window.location.hostname;
    return `${protocol}//${host}:${envApiPort}/api`;
  }

  return 'http://localhost:3001/api';
};

export const API_BASE = resolveApiBase();

export const apiUrl = (path: string) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${normalizedPath}`;
};

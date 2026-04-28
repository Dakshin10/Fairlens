/**
 * Backend origin for API calls.
 * - Dev: leave `VITE_API_BASE_URL` unset → relative `/audits/...` (Vite proxies to FastAPI).
 * - Prod / remote API: set `VITE_API_BASE_URL=https://api.example.com` (no trailing slash).
 */
export function apiUrl(path: string): string {
  const raw = import.meta.env.VITE_API_BASE_URL;
  const base = typeof raw === 'string' ? raw.trim().replace(/\/$/, '') : '';
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

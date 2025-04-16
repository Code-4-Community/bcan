// src/api.ts
const API = import.meta.env.VITE_API_URL;

export function api(path: string, init?: RequestInit) {
  return fetch(`${API}${path.startsWith('/') ? '' : '/'}${path}`, init);
}
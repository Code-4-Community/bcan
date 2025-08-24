// API INDEX

const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export async function api(
  path: string,
  init: RequestInit = {}
): Promise<Response> {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${BASE}${cleanPath}`;

  return fetch(url, {
    credentials: 'include',  // ← send & receive the jwt cookie
    ...init,
  });
}

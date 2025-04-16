const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export async function api(
  path: string,
  init?: RequestInit
): Promise<Response> {
  // Ensure path starts with a single slash
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${BASE}${cleanPath}`;
  return fetch(url, init);
}

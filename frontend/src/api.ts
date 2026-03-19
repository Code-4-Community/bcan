// API INDEX
const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

type ApiInit = RequestInit & { __retry?: boolean };
let refreshInFlight: Promise<boolean> | null = null;

async function refreshTokens(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    try {
      const refreshResp = await fetch(`${BASE}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      return refreshResp.ok;
    } catch {
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

export async function api(
  path: string,
  init: RequestInit = {}
): Promise<Response> {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${BASE}${cleanPath}`;

  const typedInit = init as ApiInit;
  const { __retry, ...fetchInit } = typedInit;

  const resp = await fetch(url, {
    credentials: 'include', // send & receive the jwt cookie
    ...fetchInit,
  });

  // If access token is expired/invalid, try refreshing once and replay the request.
  if (!__retry && resp.status === 401 && cleanPath !== '/auth/refresh') {
    const refreshed = await refreshTokens();
    if (refreshed) {
      return fetch(url, {
        credentials: 'include',
        ...fetchInit,
      });
    }
  }

  return resp;
}

// API INDEX

const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
export const COOKIE_MISSING_EVENT = 'bcan:cookie-missing';
let hasDispatchedCookieMissingEvent = false;

function notifyCookieMissing(path: string): void {
  if (hasDispatchedCookieMissingEvent || typeof window === 'undefined') {
    return;
  }

  hasDispatchedCookieMissingEvent = true;
  window.dispatchEvent(
    new CustomEvent(COOKIE_MISSING_EVENT, {
      detail: { path },
    })
  );
}

export async function api(
  path: string,
  init: RequestInit = {}
): Promise<Response> {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${BASE}${cleanPath}`;

  const response = await fetch(url, {
    credentials: 'include',  // ← send & receive the jwt cookie
    ...init,
  });

  if (response.status === 401) {
    notifyCookieMissing(cleanPath);
  }

  return response;
}

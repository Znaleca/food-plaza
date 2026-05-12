import { cookies, headers } from 'next/headers';

export default async function getSessionCookie(sessionCookieParam) {
  if (typeof sessionCookieParam === 'string') return { value: sessionCookieParam };
  if (sessionCookieParam && typeof sessionCookieParam === 'object' && 'value' in sessionCookieParam) return sessionCookieParam;

  // Try cookies() first
  try {
    const c = await cookies();
    if (c) {
      if (typeof c.get === 'function') {
        const v = c.get('appwrite-session');
        if (v) return v;
      }
      if (typeof c.getAll === 'function') {
        const arr = await c.getAll();
        if (Array.isArray(arr)) {
          const found = arr.find((it) => it.name === 'appwrite-session');
          if (found) return found;
        }
      }
      if (typeof c === 'object') {
        if (c['appwrite-session']) return c['appwrite-session'];
        if (c.cookies && c.cookies['appwrite-session']) return c.cookies['appwrite-session'];
      }
    }
  } catch (e) {
    // ignore
  }

  // Fallback to headers
  try {
    const h = await headers();
    if (h && typeof h.get === 'function') {
      const cookieHeader = h.get('cookie') || '';
      const match = cookieHeader.split(';').map(s => s.trim()).find(s => s.startsWith('appwrite-session='));
      if (match) return { value: decodeURIComponent(match.split('=')[1]) };
    }
    if (h && typeof h === 'object') {
      const cookieHeader = h.cookie || (h.headers && h.headers.cookie) || '';
      if (cookieHeader) {
        const match = cookieHeader.split(';').map(s => s.trim()).find(s => s.startsWith('appwrite-session='));
        if (match) return { value: decodeURIComponent(match.split('=')[1]) };
      }
    }
  } catch (e) {
    // ignore
  }

  return null;
}

'use server';

import { createSessionClient } from '@/config/appwrite';
import { cookies, headers } from 'next/headers';

async function checkAuth(sessionCookieParam) {
  let sessionCookie;

  // If a string is passed (e.g. from middleware request.cookies.get), treat it as value
  if (typeof sessionCookieParam === 'string') {
    sessionCookie = { value: sessionCookieParam };
  } else if (sessionCookieParam && typeof sessionCookieParam === 'object' && 'value' in sessionCookieParam) {
    sessionCookie = sessionCookieParam;
  } else {
    // Default: use Next.js server cookies (server components / actions)
    // Try multiple shapes returned by Next's `cookies()` and `headers()` across runtimes
    const tryExtractFromCookies = async () => {
      try {
        const c = await cookies();
        if (!c) return null;
        if (typeof c.get === 'function') {
          const v = c.get('appwrite-session');
          return v || null;
        }
        if (typeof c.getAll === 'function') {
          const arr = await c.getAll();
          if (Array.isArray(arr)) return arr.find((it) => it.name === 'appwrite-session') || null;
        }
        // plain object shape
        if (typeof c === 'object') {
          if (c['appwrite-session']) return c['appwrite-session'];
          if (c.cookies && c.cookies['appwrite-session']) return c.cookies['appwrite-session'];
        }
      } catch (e) {}
      return null;
    };

    const tryExtractFromHeaders = async () => {
      try {
        const h = await headers();
        if (!h) return null;
        if (typeof h.get === 'function') {
          const cookieHeader = h.get('cookie') || '';
          const match = cookieHeader.split(';').map(s => s.trim()).find(s => s.startsWith('appwrite-session='));
          if (match) return { value: decodeURIComponent(match.split('=')[1]) };
        }
        // plain object shape
        if (typeof h === 'object') {
          const cookieHeader = h.cookie || (h.headers && h.headers.cookie) || '';
          if (cookieHeader) {
            const match = cookieHeader.split(';').map(s => s.trim()).find(s => s.startsWith('appwrite-session='));
            if (match) return { value: decodeURIComponent(match.split('=')[1]) };
          }
        }
      } catch (e) {}
      return null;
    };

    sessionCookie = (await tryExtractFromCookies()) || (await tryExtractFromHeaders());
  }

  if (!sessionCookie) {
    return {
      isAuthenticated: false,
      user: null,
      labels: [],
    };
  }

  try {
    const { account } = await createSessionClient(sessionCookie.value);
    const user = await account.get();

    const labels = user.labels || [];

    return {
      isAuthenticated: true,
      user: {
        id: user.$id,
        name: user.name,
        email: user.email,
        phone: user.phone || null, // ✅ added phone
      },
      labels,
    };
  } catch (error) {
    console.error("Authentication error:", error);
    return {
      isAuthenticated: false,
      user: null,
      labels: [],
    };
  }
}

export default checkAuth;

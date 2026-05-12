'use server';

import { createSessionClient, createAdminClient } from '@/config/appwrite';
import { cookies, headers } from 'next/headers';

async function getAllSpaces(sessionCookieParam) {
  let sessionCookie;

  if (typeof sessionCookieParam === 'string') {
    sessionCookie = { value: sessionCookieParam };
  } else if (sessionCookieParam && typeof sessionCookieParam === 'object' && 'value' in sessionCookieParam) {
    sessionCookie = sessionCookieParam;
  } else {
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

  try {
    let databases;

    if (sessionCookie) {
      // ✅ Logged-in user → use their session
      ({ databases } = await createSessionClient(sessionCookie.value));
    } else {
      // ✅ Guest → use admin client (read-only public fetch)
      ({ databases } = await createAdminClient());
    }

    const { documents: rooms } = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ROOMS
    );

    return rooms;
  } catch (error) {
    console.log('Failed to get rooms', error);
    return [];
  }
}

export default getAllSpaces;

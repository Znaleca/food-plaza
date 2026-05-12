"use server";
import { createSessionClient } from '@/config/appwrite';
import getSessionCookie from './getSessionCookie';
import { cookies } from 'next/headers';

async function destroySession() {
  // Retrieve the session cookie
  const sessionCookie = await getSessionCookie();

  if (!sessionCookie) {
    return {
      error: 'No session cookie found',
    };
  }

  try {
    const { account } = await createSessionClient(sessionCookie.value);

    // Delete current session
    await account.deleteSession('current');

    // Clear session cookie (best-effort)
    try {
      const c = await cookies();
      if (c && typeof c.delete === 'function') c.delete('appwrite-session');
    } catch (e) {}

    return {
      success: true,
    };
  } catch (error) {
    return {
      error: 'Error deleting session',
    };
  }
}

export default destroySession;
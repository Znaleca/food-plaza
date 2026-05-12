'use server';

import { redirect } from 'next/navigation';
import { createSessionClient } from '@/config/appwrite';
import getSessionCookie from './getSessionCookie';

async function getCurrentUser() {
  const sessionCookie = await getSessionCookie();

  if (!sessionCookie) {
    redirect('/login');
  }

  try {
    const { account } = await createSessionClient(sessionCookie.value);
    const user = await account.get();

    return user;
  } catch (err) {
    console.error('Failed to fetch current user:', err);
    redirect('/error');
  }
}

export default getCurrentUser;

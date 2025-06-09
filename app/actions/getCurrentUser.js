'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createSessionClient } from '@/config/appwrite';

async function getCurrentUser() {
  const sessionCookie = cookies().get('appwrite-session');

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

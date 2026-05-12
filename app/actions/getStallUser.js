"use server";

import { createAdminClient } from '@/config/appwrite';
import getSessionCookie from './getSessionCookie';
import { redirect } from 'next/navigation';
import { Query } from 'appwrite';

async function getStallUser() {
  const sessionCookie = await getSessionCookie();

  if (!sessionCookie) {
    redirect('/login');
  }

  try {
    const { users } = await createAdminClient();

    const foodstallList = await users.list([
      Query.contains('labels', ['foodstall']),
    ]);

    return foodstallList.users.map((user) => ({
      $id: user.$id,
      name: user.name || 'Unnamed',
      email: user.email,
      createdAt: user.$createdAt,
      labels: user.labels || [],
    }));
  } catch (error) {
    console.error('Failed to get foodstall users:', error);
    redirect('/error');
  }
}

export default getStallUser;

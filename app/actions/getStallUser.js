'use server';

import { createAdminClient } from '@/config/appwrite';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Query } from 'appwrite';

async function getStallUser() {
  const sessionCookie = cookies().get('appwrite-session');

  if (!sessionCookie) {
    redirect('/login');
  }

  try {
    const { users } = await createAdminClient();

    // Correct way to query array attributes
    const foodstallList = await users.list([
      Query.contains('labels', ['foodstall'])
    ]);

    const formattedFoodstalls = foodstallList.users.map((user) => ({
      $id: user.$id,
      name: user.name || 'Unnamed',
      email: user.email,
      createdAt: user.$createdAt,
      labels: user.labels || [],
    }));

    return formattedFoodstalls;
  } catch (error) {
    console.error('Failed to get foodstall users:', error);
    redirect('/error');
  }
}

export default getStallUser;

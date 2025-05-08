'use server';

import { createAdminClient } from '@/config/appwrite';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

async function getAllUsers() {
  const sessionCookie = cookies().get('appwrite-session');

  if (!sessionCookie) {
    redirect('/login');
  }

  try {
    const { users } = await createAdminClient();

    // Fetch all users
    const userList = await users.list();

    const formattedUsers = userList.users.map((user) => ({
      $id: user.$id,
      name: user.name || 'Unnamed',
      email: user.email,
      createdAt: user.$createdAt,
      labels: user.labels || [],
    }));

    return formattedUsers;
  } catch (error) {
    console.error('Failed to get all users:', error);
    redirect('/error');
  }
}

export default getAllUsers;

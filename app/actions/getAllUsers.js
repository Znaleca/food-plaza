'use server';

import { createAdminClient } from '@/config/appwrite';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Query } from 'appwrite';

async function getAllUsers(limit = 25, offset = 0) {
  const sessionCookie = cookies().get('appwrite-session');

  if (!sessionCookie) {
    redirect('/login');
  }

  try {
    const { users } = await createAdminClient();

    // Fetch users with pagination
    const userList = await users.list([
      Query.limit(limit),
      Query.offset(offset),
    ]);

    const formattedUsers = userList.users.map((user) => ({
      $id: user.$id,
      name: user.name || 'Unnamed',
      email: user.email,
      createdAt: user.$createdAt,
      labels: user.labels || [],
    }));

    // Return both the formatted users and the total count
    return {
      users: formattedUsers,
      total: userList.total,
    };
  } catch (error) {
    console.error('Failed to get all users:', error);
    redirect('/error');
  }
}

export default getAllUsers;
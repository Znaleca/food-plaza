'use server';

import { createAdminClient } from '@/config/appwrite';
import { Query } from 'node-appwrite';

export default async function getUserByEmail(email) {
  if (!email || !email.includes('@')) return { error: 'Invalid email format' };

  try {
    const { users } = await createAdminClient();
    const res = await users.list([
      Query.equal('email', email)
    ]);

    const user = res.users?.[0];
    if (!user) return { error: 'User not found' };

    return { $id: user.$id, name: user.name, email: user.email };
  } catch (err) {
    console.error(err);
    return { error: err.message || 'Fetch failed' };
  }
}

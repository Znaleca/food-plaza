'use server';

import { createAdminClient } from '@/config/appwrite';
import { Query } from 'appwrite';

async function checkUserExists(email, phone) {
  try {
    const { users } = await createAdminClient();

    // Check for existing email
    const emailQuery = await users.list([
      Query.equal('email', email),
      Query.limit(1), // We only need to know if one exists
    ]);

    const isEmailTaken = emailQuery.total > 0;

    // Check for existing phone number
    const phoneQuery = await users.list([
      Query.equal('phone', phone),
      Query.limit(1),
    ]);

    const isPhoneTaken = phoneQuery.total > 0;

    return {
      isEmailTaken,
      isPhoneTaken,
    };
  } catch (error) {
    console.error('User existence check failed:', error);
    return {
      isEmailTaken: false,
      isPhoneTaken: false,
      error: 'Failed to check for existing user. Please try again.',
    };
  }
}

export default checkUserExists;
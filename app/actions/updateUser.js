'use server';

import { createAdminClient } from '@/config/appwrite';

export default async function updateUser(_, formData) {
  const { users } = await createAdminClient();

  const userId = formData.get('userId');
  const name = formData.get('name');
  const email = formData.get('email');
  const password = formData.get('password');
  const phone = formData.get('phone');

  try {
    const currentUser = await users.get(userId);

    // Update name if it has changed
    if (name && name !== currentUser.name) {
      await users.updateName(userId, name);
    }

    // Update email if it has changed
    if (email && email !== currentUser.email) {
      try {
        await users.updateEmail(userId, email);
      } catch (err) {
        if (err.code === 409 && err.type === 'user_target_already_exists') {
          return { error: 'This email is already in use by another account.' };
        }
        throw err;
      }
    }

    // Update password if a new one is provided
    if (password) {
      await users.updatePassword(userId, password);
    }

    // Update phone number if it has changed
    if (phone && phone !== currentUser.phone) {
      await users.updatePhone(userId, phone);
    }

    return { success: true };
  } catch (error) {
    console.error('Update Error:', error);
    return { error: error.message || 'Failed to update user.' };
  }
}
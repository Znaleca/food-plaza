'use server';

import { createAdminClient } from '@/config/appwrite';
import { cookies } from 'next/headers';

export default async function updateUser(_, formData) {
  const { users, account } = await createAdminClient();

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

    // Update phone number if it has changed
    const currentPhoneWithoutPrefix = currentUser.phone?.replace('+63', '') || '';
    if (phone && phone !== currentPhoneWithoutPrefix) {
        await users.updatePhone(userId, `+63${phone}`);
    }

    // Update password if a new one is provided
    if (password) {
      await users.updatePassword(userId, password);
    }
    
    // If any change occurred, get the latest user data for a fresh session
    const updatedUser = await users.get(userId);
    
    // If the email or password was updated, we need to create a new session.
    if ((email && email !== currentUser.email) || password) {
      // Create a new session with the updated credentials.
      // We use the new email (if changed) or the old one.
      const newEmail = email || currentUser.email;
      
      const newSession = await account.createEmailPasswordSession(newEmail, password);

      // Set the new session cookie.
      cookies().set('appwrite-session', newSession.secret, {
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          expires: new Date(newSession.expire),
          path: '/'
      });
      
      return { success: true };
    }


    return { success: true };
  } catch (error) {
    console.error('Update Error:', error);
    return { error: error.message || 'Failed to update user.' };
  }
}
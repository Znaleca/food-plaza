'use server';

import { createSessionClient } from '@/config/appwrite';

export default async function changePassword(prevState, formData) {
  const currentPassword = formData.get('currentPassword');
  const newPassword = formData.get('newPassword');

  if (!currentPassword || !newPassword) {
    return { error: 'All fields are required.' };
  }

  if (newPassword.length < 8) {
    return { error: 'New password must be at least 8 characters long.' };
  }

  try {
    const sessionCookie = formData.get('session'); // Or get from cookies() if using SSR
    const { account } = await createSessionClient(sessionCookie);

    // This method assumes you are using sessions and the user is logged in
    await account.updatePassword(newPassword, currentPassword);

    return { success: 'Password updated successfully.' };
  } catch (error) {
    console.error('Password change error:', error);
    return { error: 'Failed to update password.' };
  }
}

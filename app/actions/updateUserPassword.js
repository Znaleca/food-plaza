'use server';

import { createAdminClient } from "@/config/appwrite";
import { Query } from 'node-appwrite';

const updateUserPassword = async (_prevState, formData) => {
  const email = formData.get('email');
  const newPassword = formData.get('password');

  if (!email || !newPassword) {
    return { error: 'Missing email or password.' };
  }

  try {
    const { users } = await createAdminClient();

    const listResponse = await users.list([
      Query.equal('email', email)
    ]);

    const user = listResponse.users[0];

    if (!user) {
      return { error: 'User not found with that email.' };
    }

    // ✅ Correct method to update password
    await users.updatePassword(user.$id, newPassword);

    return { success: true, userId: user.$id };
  } catch (error) {
    console.error('Update password error:', error);
    return { error: error?.message || 'Failed to update password.' };
  }
};

export default updateUserPassword;

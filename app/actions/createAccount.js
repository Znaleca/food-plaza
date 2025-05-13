'use server';
import { createAdminClient } from '@/config/appwrite';
import { ID } from 'node-appwrite';

async function createAccount(previousState, formData) {
  const name = formData.get('name');
  const email = formData.get('email');
  const password = formData.get('password');
  const confirmPassword = formData.get('confirmPassword');
  const label = formData.get('label');

  if (!email || !name || !password || !confirmPassword || !label) {
    return { error: 'Please fill in all fields including role' };
  }

  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters long' };
  }

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match' };
  }

  const allowedLabels = ['foodstall'];
  if (!allowedLabels.includes(label)) {
    return { error: 'Invalid role selected' };
  }

  const { account, users } = await createAdminClient();

  try {
    const user = await account.create(ID.unique(), email, password, name);
    await users.updateLabels(user.$id, [label]);
    return { success: true };
  } catch (error) {
    console.error('Registration Error:', error);
    return { error: 'Could not register user' };
  }
}

export default createAccount;

'use server';
import { createAdminClient } from '@/config/appwrite';
import { ID } from 'node-appwrite';

async function createUser(previousState, formData) {
  const name = formData.get('name');
  const email = formData.get('email');
  const password = formData.get('password');
  const confirmPassword = formData.get('confirmPassword');

  if (!email || !name || !password || !confirmPassword) {
    return { error: 'Please fill in all fields' };
  }

  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters long' };
  }

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match' };
  }

  const { account, users } = await createAdminClient();

  try {
    // Step 1: Create user
    const newUser = await account.create(ID.unique(), email, password, name);

    // Step 2: Add "customer" label
    await users.updateLabels(newUser.$id, ['customer']);

    return { success: true };
  } catch (error) {
    console.error('Registration Error:', error);
    return { error: 'Could not register user' };
  }
}

export default createUser;

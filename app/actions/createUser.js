'use server';

import { createAdminClient } from '@/config/appwrite';
import { ID } from 'node-appwrite';

async function createUser(previousState, formData) {
  const name = formData.get('name');
  const email = formData.get('email');
  const password = formData.get('password');
  const confirmPassword = formData.get('confirmPassword');
  const phone = formData.get('phone'); // now includes +63

  if (!email || !name || !password || !confirmPassword || !phone) {
    return { error: 'Please fill in all fields' };
  }

  // Validate phone format: +63XXXXXXXXXX
  if (!/^\+63\d{10}$/.test(phone)) {
    return { error: 'Phone number must be in format +639123456789' };
  }

  const { account, users } = await createAdminClient();

  try {
    // Step 1: Create user with phone
    const newUser = await account.create(
      ID.unique(),
      email,
      password,
      name
    );

    // Step 2: Add phone number & customer label
    await users.updateLabels(newUser.$id, ['customer']);
    await users.updatePhone(newUser.$id, phone); // Save phone in Appwrite

    return { success: true };
  } catch (error) {
    console.error('Registration Error:', error);
    return { error: 'Could not register user' };
  }
}

export default createUser;

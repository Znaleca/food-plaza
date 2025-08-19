'use server';

import { createAdminClient } from '@/config/appwrite';
import { ID, Query } from 'node-appwrite';

async function createUser(previousState, formData) {
  const name = formData.get('name');
  const email = formData.get('email');
  const password = formData.get('password');
  const confirmPassword = formData.get('confirmPassword');
  const phone = formData.get('phone');

  if (!email || !name || !password || !confirmPassword || !phone) {
    return { error: 'Please fill in all fields' };
  }

  // Validate phone format: +63XXXXXXXXXX
  if (!/^\+63\d{10}$/.test(phone)) {
    return { error: 'Phone number must be in format +639123456789' };
  }

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match' };
  }

  const { account, users } = await createAdminClient();

  try {
    // Check if a user with the same email already exists
    const emailCheck = await users.list([
      Query.equal('email', email),
      Query.limit(1), // We only need to know if one exists
    ]);
    if (emailCheck.total > 0) {
      return { error: 'This email is already taken' };
    }

    // Check if a user with the same phone number already exists
    const phoneCheck = await users.list([
      Query.equal('phone', phone),
      Query.limit(1),
    ]);
    if (phoneCheck.total > 0) {
      return { error: 'This phone number is already taken' };
    }
    
    // If both checks pass, proceed with user creation
    const newUser = await account.create(
      ID.unique(),
      email,
      password,
      name
    );

    // Add phone number & customer label
    await users.updateLabels(newUser.$id, ['customer']);
    await users.updatePhone(newUser.$id, phone);

    return { success: true };
  } catch (error) {
    console.error('Registration Error:', error);
    return { error: 'Could not register user' };
  }
}

export default createUser;

'use server';
import { createAdminClient } from '@/config/appwrite';
import { ID, Query } from 'node-appwrite';

async function createAccount(previousState, formData) {
  const name = formData.get('name');
  const email = formData.get('email');
  const password = formData.get('password');
  const confirmPassword = formData.get('confirmPassword');
  const phone = formData.get('phone'); // This will be the 10 digits

  if (!email || !name || !password || !confirmPassword || !phone) {
    return { error: 'Please fill in all fields' };
  }

  // Validate phone format: 10 digits
  if (!/^\d{10}$/.test(phone)) {
    return { error: 'Phone number must be a 10-digit number' };
  }

  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters long' };
  }

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match' };
  }

  const label = formData.get('label');
  const allowedLabels = ['admin', 'customer', 'foodstall'];
  if (!allowedLabels.includes(label)) {
    return { error: 'Invalid role selected' };
  }
  
  // Construct the full phone number with the +63 prefix
  const fullPhoneNumber = `+63${phone}`;

  const { account, users } = await createAdminClient();

  try {
    // Check if a user with the same email already exists
    const emailCheck = await users.list([
      Query.equal('email', email),
      Query.limit(1),
    ]);
    if (emailCheck.total > 0) {
      return { error: 'This email is already taken' };
    }

    // Check if a user with the same phone number already exists
    const phoneCheck = await users.list([
      Query.equal('phone', fullPhoneNumber),
      Query.limit(1),
    ]);
    if (phoneCheck.total > 0) {
      return { error: 'This phone number is already taken' };
    }

    // If both checks pass, create the new account
    const user = await account.create(ID.unique(), email, password, name);
    await users.updateLabels(user.$id, [label]);
    await users.updatePhone(user.$id, fullPhoneNumber);
    return { success: true };
  } catch (error) {
    console.error('Registration Error:', error);
    return { error: 'Could not register user' };
  }
}

export default createAccount;
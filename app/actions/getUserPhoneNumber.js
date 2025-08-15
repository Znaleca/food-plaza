'use server';

import { createAdminClient } from '@/config/appwrite';

async function getUserPhoneNumber(userId = null) {
  try {
    const { users } = await createAdminClient();

    // If no userId, fetch all users and return a list of phone numbers
    if (!userId) {
      const allUsers = await users.list(); // Default limit 25
      const phoneNumbers = allUsers.users
        .map((user) => {
          if (!user.phone) return null;

          let phone = user.phone.trim();

          if (phone.startsWith('09')) {
            phone = '+63' + phone.slice(1);
          }
          if (!phone.startsWith('+63')) {
            phone = '+63' + phone.replace(/^\+?/, '');
          }
          return { id: user.$id, phone };
        })
        .filter(Boolean);

      return phoneNumbers; // Array of { id, phone }
    }

    // Otherwise, fetch single user phone
    const user = await users.get(userId);
    if (!user.phone) return '';

    let phone = user.phone.trim();
    if (phone.startsWith('09')) {
      phone = '+63' + phone.slice(1);
    }
    if (!phone.startsWith('+63')) {
      phone = '+63' + phone.replace(/^\+?/, '');
    }

    return phone;
  } catch (error) {
    console.error('Error getting phone number(s):', error);
    return userId ? '' : [];
  }
}

export default getUserPhoneNumber;

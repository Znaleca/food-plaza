'use server';
import { createAdminClient } from '@/config/appwrite';
import { ID } from 'node-appwrite';

async function createSuperUser(previousState, formData) {
  const name = formData.get('name');
  const email = formData.get('email');
  const password = formData.get('password');
  const confirmPassword = formData.get('confirm-password');
  const role = formData.get('role'); // Get role from formData

  if (!email || !name || !password || !role) {
    return { error: 'Please fill in all fields' };
  }

  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters long' };
  }

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match' };
  }

  const { account, teams } = await createAdminClient();

  try {
    // Create the user
    const user = await account.create(ID.unique(), email, password, name);

    // Role-to-team mapping
    const teamIdMap = {
      isAdmin: process.env.NEXT_PUBLIC_APPWRITE_TEAM_ADMIN,
      isAffiliate: process.env.NEXT_PUBLIC_APPWRITE_TEAM_AFFILIATES,
      isOffice: process.env.NEXT_PUBLIC_APPWRITE_TEAM_OFFICE,
      isSuperAdmin: process.env.NEXT_PUBLIC_APPWRITE_TEAM_SUPERADMIN,
    };

    const selectedTeamId = teamIdMap[role];

    if (selectedTeamId) {
      // Assign user to the corresponding team
      await teams.createMembership(
        selectedTeamId, 
        user.$id, 
        ['owner'], 
        email, 
        `${process.env.NEXT_PUBLIC_URL}/welcome`
      );
    }

    return { success: true };
  } catch (error) {
    console.log('Registration Error: ', error);
    return { error: 'Could not register user' };
  }
}

export default createSuperUser;

'use server';
import { createSessionClient } from '@/config/appwrite';
import { cookies } from 'next/headers';

async function checkAuth() {
  const sessionCookie = cookies().get('appwrite-session');

  if (!sessionCookie) {
    return {
      isAuthenticated: false,
    };
  }

  try {
    const { account, teams } = await createSessionClient(sessionCookie.value);
    const user = await account.get();

    const teamsList = await teams.list();
    const isAdmin = teamsList.teams.some(team => team.$id === process.env.NEXT_PUBLIC_APPWRITE_TEAM_ADMIN);
    const isOffice = teamsList.teams.some(team => team.$id === process.env.NEXT_PUBLIC_APPWRITE_TEAM_OFFICE);
    const isAffiliate = teamsList.teams.some(team => team.$id === process.env.NEXT_PUBLIC_APPWRITE_TEAM_AFFILIATE);
    const isSuperAdmin = teamsList.teams.some(team => team.$id === process.env.NEXT_PUBLIC_APPWRITE_TEAM_SUPERADMIN);

    return {
      isAuthenticated: true,
      user: {
        id: user.$id,
        name: user.name,
        email: user.email,
      },
      roles: {
        isAdmin,
        isOffice,
        isAffiliate,
        isSuperAdmin, // Add super admin role
      },
    };
  } catch (error) {
    console.error("Authentication error:", error); 
    return {
      isAuthenticated: false,
    };
  }
}

export default checkAuth;

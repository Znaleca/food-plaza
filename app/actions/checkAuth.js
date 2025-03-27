'use server';
import { createSessionClient } from '@/config/appwrite';
import { cookies } from 'next/headers';

async function checkAuth() {
  const sessionCookie = cookies().get('appwrite-session');

  if (!sessionCookie) {
    return {
      isAuthenticated: false,
      user: null,
      roles: {
        isAdmin: false,
        isFoodstall: false,
        isCustomer: false,
        isSuperAdmin: false,
      },
    };
  }

  try {
    const { account, teams } = await createSessionClient(sessionCookie.value);
    const user = await account.get();

    const teamsList = await teams.list();
    const isAdmin = teamsList.teams.some(team => team.$id === process.env.NEXT_PUBLIC_APPWRITE_TEAM_ADMIN);
    const isFoodstall = teamsList.teams.some(team => team.$id === process.env.NEXT_PUBLIC_APPWRITE_TEAM_FOODSTALL);
    const isCustomer = teamsList.teams.some(team => team.$id === process.env.NEXT_PUBLIC_APPWRITE_TEAM_CUSTOMER);
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
        isFoodstall,
        isCustomer,
        isSuperAdmin,
      },
    };
  } catch (error) {
    console.error("Authentication error:", error);
    return {
      isAuthenticated: false,
      user: null,
      roles: {
        isAdmin: false,
        isFoodstall: false,
        isCustomer: false,
        isSuperAdmin: false,
      },
    };
  }
}

export default checkAuth;
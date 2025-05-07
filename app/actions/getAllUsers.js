'use server';

import { createAdminClient } from '@/config/appwrite';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

async function getAllUsers() {
  const sessionCookie = cookies().get('appwrite-session');

  if (!sessionCookie) {
    redirect('/login');
  }

  try {
    const { users, teams } = await createAdminClient();

    // Fetch all users
    const userList = await users.list();

    // Fetch all teams and their memberships
    const allTeams = await teams.list();
    const userTeamMap = new Map();

    // Loop through each team and map users to teams
    for (const team of allTeams.teams) {
      const memberships = await teams.listMemberships(team.$id);

      memberships.memberships.forEach((member) => {
        if (!userTeamMap.has(member.userId)) {
          userTeamMap.set(member.userId, []);
        }
        userTeamMap.get(member.userId).push(team.name);
      });
    }

    // Map users with team names
    const formattedUsers = userList.users.map((user) => ({
      $id: user.$id,
      name: user.name || 'Unnamed',
      email: user.email,
      createdAt: user.$createdAt,
      teams: userTeamMap.get(user.$id) || [],
    }));

    return formattedUsers;
  } catch (error) {
    console.error('Failed to get all users:', error);
    redirect('/error');
  }
}

export default getAllUsers;

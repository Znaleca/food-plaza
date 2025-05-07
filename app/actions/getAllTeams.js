'use server';

import { createAdminClient } from '@/config/appwrite';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

async function getAllTeams() {
  const sessionCookie = cookies().get('appwrite-session');

  if (!sessionCookie) {
    redirect('/login');
  }

  try {
    const { teams } = await createAdminClient();

    // Get the list of teams
    const teamList = await teams.list();

    // For each team, get memberships to count members
    const teamDetails = await Promise.all(
      teamList.teams.map(async (team) => {
        const memberships = await teams.listMemberships(team.$id);

        return {
          $id: team.$id,
          name: team.name,
          createdAt: team.$createdAt,
          membersCount: memberships.total,
        };
      })
    );

    return teamDetails;
  } catch (error) {
    console.error('Failed to get all teams:', error);
    redirect('/error');
  }
}

export default getAllTeams;

// /app/api/updateTeam/route.js

import { createAdminClient } from '@/config/appwrite';

export async function POST(req) {
  try {
    const { userId, newTeam } = await req.json();

    if (!userId || !newTeam) {
      return new Response(JSON.stringify({ error: 'Missing userId or newTeam' }), { status: 400 });
    }

    const { users, teams } = await createAdminClient();

    // Fetch the user by ID
    const user = await users.get(userId);

    // Fetch the team by name (ensure the team exists)
    const allTeams = await teams.list();
    const team = allTeams.teams.find((t) => t.name === newTeam);

    if (!team) {
      return new Response(JSON.stringify({ error: 'Team not found' }), { status: 404 });
    }

    // Update the user's team membership (or add the user to the new team)
    await teams.addMembership(team.$id, userId);

    return new Response(JSON.stringify({ message: 'Team updated successfully' }), { status: 200 });
  } catch (error) {
    console.error('Error updating user team:', error);
    return new Response(JSON.stringify({ error: 'Failed to update team' }), { status: 500 });
  }
}

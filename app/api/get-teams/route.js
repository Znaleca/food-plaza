import { createAdminClient } from '@/config/appwrite';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { teams } = await createAdminClient();
    const res = await teams.list();
    return NextResponse.json(res.teams);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 });
  }
}

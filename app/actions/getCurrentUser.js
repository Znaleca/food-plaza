
import { NextResponse } from 'next/server';
import { createAdminClient, createSessionClient } from '@/config/appwrite';
import { cookies } from 'next/headers';

export async function GET() {
  const sessionCookie = cookies().get('appwrite-session');

  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const { account } = await createSessionClient(sessionCookie.value);
    const sessionUser = await account.get();

    const { users } = await createAdminClient();
    const userDetails = await users.get(sessionUser.$id);

    return NextResponse.json({
      $id: userDetails.$id,
      name: userDetails.name,
      email: userDetails.email,
      labels: userDetails.labels || [],
      createdAt: userDetails.$createdAt,
      status: userDetails.status,
    });
  } catch (error) {
    console.error('Failed to get current user details:', error);
    return NextResponse.redirect(new URL('/error', request.url));
  }
}

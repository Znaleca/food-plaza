"use server";

import { createAdminClient } from '@/config/appwrite';
import getSessionCookie from './getSessionCookie';
import { redirect } from 'next/navigation';
import { Query } from 'appwrite';

async function getAllStalls() {
  const sessionCookie = await getSessionCookie();
  if (!sessionCookie) {
    redirect('/login');
  }

  try {
    const { databases } = await createAdminClient();

    // Fetch all stalls
    const { documents: rooms } = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ROOMS,
      [Query.limit(10000)] // Using a high limit to get all documents
    );

    return rooms;
  } catch (error) {
    console.error('Failed to get all stalls:', error);
    // You might want to handle this error more gracefully, but for now, we'll redirect.
    redirect('/error');
  }
}

export default getAllStalls;
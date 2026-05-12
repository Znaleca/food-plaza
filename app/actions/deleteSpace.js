"use server";

import { createSessionClient } from '@/config/appwrite';
import getSessionCookie from './getSessionCookie';
import { Query } from 'node-appwrite';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

async function deleteSpace(roomId) {
  const sessionCookie = await getSessionCookie();
  if (!sessionCookie) {
    redirect('/login');
  }

  try {
    const { account, databases } = await createSessionClient(sessionCookie.value);

    const user = await account.get();
    const userId = user.$id;

    const { documents: rooms } = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ROOMS,
      [Query.equal('user_id', userId)]
    );

    const roomToDelete = rooms.find((room) => room.$id === roomId);

    if (roomToDelete) {
      await databases.deleteDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ROOMS,
        roomToDelete.$id
      );

      revalidatePath('/rooms/my', 'layout');
      revalidatePath('/', 'layout');

      return {
        success: true,
      };
    }

    return {
      error: 'Room not found',
    };
  } catch (error) {
    console.log('Failed to delete room', error);
    return {
      error: 'Failed to delete room',
    };
  }
}

export default deleteSpace;

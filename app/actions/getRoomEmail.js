import { createAdminClient } from '@/config/appwrite';
import { Query } from 'node-appwrite';

async function getRoomEmail(roomId) {
  const { databases } = await createAdminClient();

  try {
    const collectionId = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ROOMS;
    const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE;

    // 1. Fetch room data based on roomId
    const result = await databases.listDocuments(databaseId, collectionId, [
      Query.equal('room_id', roomId),
    ]);

    if (result.documents.length === 0) {
      throw new Error('Room not found');
    }

    const room = result.documents[0];
    const userId = room.user_id;

    // 2. Fetch user email based on user_id
    const usersCollectionId = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USERS;  // Assumes you have a collection for users
    const userResult = await databases.listDocuments(databaseId, usersCollectionId, [
      Query.equal('user_id', userId),
    ]);

    if (userResult.documents.length === 0) {
      throw new Error('User not found');
    }

    const user = userResult.documents[0];
    return user.email;  // Assumes the user document contains an 'email' field

  } catch (err) {
    console.error('Error fetching room email:', err);
    throw err;
  }
}

export default getRoomEmail;

'use server';

import { ID, Query } from 'node-appwrite';
import { createAdminClient } from '@/config/appwrite';
import checkAuth from './checkAuth';

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE;
const COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_SPECIAL_DISCOUNT;
const BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ROOMS;

export default async function createSpecialDiscount(formData) {
  try {
    // ✅ Check authentication
    const { isAuthenticated, user } = await checkAuth();
    if (!isAuthenticated || !user) {
      throw new Error('Unauthorized');
    }

    // ✅ Get Admin client
    const { databases, storage } = await createAdminClient();

    // ✅ Check if this user already has a discount
    const existing = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_ID,
      [Query.equal('user_id', user.id)]
    );

    if (existing.total > 0) {
      throw new Error('You already have a registered special discount.');
    }

    // ✅ Upload card image to Appwrite Storage (rooms bucket)
    const imageFile = formData.get('image_card');
    let imageId = null;

    if (imageFile && imageFile.size > 0) {
      const uploaded = await storage.createFile(BUCKET_ID, ID.unique(), imageFile);
      imageId = uploaded.$id; // save file id as string
    }

    // ✅ Always 20% discount
    const discount = 20;

    // ✅ Create document in Appwrite with user_id
    const doc = await databases.createDocument(
      DATABASE_ID,
      COLLECTION_ID,
      ID.unique(),
      {
        fname: formData.get('fname'),
        id_number: parseInt(formData.get('id_number'), 10),
        type: formData.get('type'), // "pwd" or "senior-citizen"
        discount,
        image_card: imageId, // file id
        user_id: user.id, // ✅ store creator's ID
      }
    );

    return { success: true, doc };
  } catch (err) {
    console.error('Error creating special discount:', err);
    return { success: false, error: err.message };
  }
}

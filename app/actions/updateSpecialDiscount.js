'use server';

import { ID } from 'appwrite';
import { createAdminClient } from '@/config/appwrite';

const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE;
const collectionId = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_SPECIAL_DISCOUNT;
const bucketId = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ROOMS;

export default async function updateSpecialDiscount(formData) {
  try {
    const { databases, storage } = await createAdminClient();

    const id = formData.get('id');
    const type = formData.get('type');
    const fname = formData.get('fname');
    const id_number = formData.get('id_number'); // Now retrieves as a string
    const image_card = formData.get('image_card');

    let newImageId = null;

    // Check if a new image was uploaded
    if (image_card instanceof Blob && image_card.size > 0) {
      // Get the old file ID from the existing document to delete it
      const existingDoc = await databases.getDocument(databaseId, collectionId, id);
      const oldImageId = existingDoc.image_card;

      if (oldImageId) {
        try {
          await storage.deleteFile(bucketId, oldImageId);
        } catch (deleteError) {
          console.error("Error deleting old file:", deleteError);
        }
      }

      // Upload the new image and get its ID
      const newFile = await storage.createFile(bucketId, ID.unique(), image_card);
      newImageId = newFile.$id;
    }

    const updatedDocument = await databases.updateDocument(
      databaseId,
      collectionId,
      id,
      {
        type,
        fname,
        id_number,
        // Only update the image ID if a new image was uploaded
        ...(newImageId && { image_card: newImageId }),
      }
    );

    return { success: true, document: updatedDocument };
  } catch (error) {
    console.error('Error updating special discount:', error);
    return { success: false, error: error.message };
  }
}
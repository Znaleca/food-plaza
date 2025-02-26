'use server';
import { createAdminClient } from '@/config/appwrite';
import checkAuth from './checkAuth';
import { ID } from 'node-appwrite';
import { revalidatePath } from 'next/cache';

async function createSpaces(previousState, formData) {
  const { databases, storage } = await createAdminClient();

  try {
    const { user } = await checkAuth();

    if (!user) {
      return { error: 'You must be logged in to create a room' };
    }

    // Upload multiple images
    const images = formData.getAll('images');
    const imageIDs = [];

    if (images.length > 0) {
      for (const image of images) {
        if (image && image.size > 0 && image.name !== 'undefined') {
          try {
            const response = await storage.createFile(
              process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ROOMS,
              ID.unique(),
              image
            );
            imageIDs.push(response.$id);
          } catch (error) {
            console.log('Error uploading image:', error);
            return { error: 'Error uploading one or more images' };
          }
        }
      }
    }

    // Create room document
    const newRoom = await databases.createDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ROOMS,
      ID.unique(),
      {
        user_id: user.id,
        name: formData.get('name'),
        description: formData.get('description'),
        capacity: formData.get('capacity'),
        type: formData.get('type'),
        amenities: formData.get('amenities'),
        location: formData.get('location'),
        room: formData.get('room'),
        floor: formData.get('floor'),
        images: imageIDs, // Save multiple image IDs
      }
    );

    revalidatePath('/', 'layout');

    return { success: true };
  } catch (error) {
    console.log(error);
    const errorMessage = error.response?.message || 'An unexpected error has occurred';
    return { error: errorMessage };
  }
}

export default createSpaces;

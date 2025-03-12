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

    // Convert type from JSON string
    const type = JSON.parse(formData.get('selectedTypes')) || [];

    // Convert menuNames and menuPrices to arrays
    const menuName = formData.getAll('menuNames').filter((item) => item.trim() !== '');
    const menuPrice = formData.getAll('menuPrices')
      .map((value) => parseFloat(value))
      .filter((value) => !isNaN(value));

    // Create food stall document
    const newStall = await databases.createDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ROOMS,
      ID.unique(),
      {
        user_id: user.id,
        name: formData.get('name'),
        description: formData.get('description'),
        type: type, // Now an array
        menuName: menuName, // Now an array
        menuPrice: menuPrice, // Now an array of doubles
        stallNumber: parseInt(formData.get('stallNumber'), 10) || null,
        images: imageIDs,
      }
    );
    
    revalidatePath('/', 'layout');

    return { success: true };
  } catch (error) {
    console.log(error);
    return { error: error.response?.message || 'An unexpected error has occurred' };
  }
}

export default createSpaces;

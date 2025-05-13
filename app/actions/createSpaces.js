'use server';
import { createAdminClient } from '@/config/appwrite';
import checkAuth from './checkAuth';
import { ID, Query } from 'node-appwrite';
import { revalidatePath } from 'next/cache';

async function createSpaces(previousState, formData) {
  const { databases, storage } = await createAdminClient();

  try {
    const { user } = await checkAuth();
    if (!user) {
      return { error: 'You must be logged in to create a food stall.' };
    }

    // ✅ Check if the user already has a food stall
    const existingStalls = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ROOMS,
      [Query.equal('user_id', user.id)]
    );

    if (existingStalls.total > 0) {
      return { error: 'You already have a food stall listed.' };
    }

    // Upload stall images
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

    // Convert types from JSON string
    const type = JSON.parse(formData.get('selectedTypes')) || [];

    // Get menu names, descriptions, and prices
    const menuNames = formData.getAll('menuNames').filter((item) => item.trim() !== '');
    const menuDescriptions = formData.getAll('menuDescriptions').filter((item) => item.trim() !== '');
    const menuPrices = formData.getAll('menuPrices')
      .map((value) => parseFloat(value))
      .filter((value) => !isNaN(value));

    // Upload menu images
    const menuImageFiles = formData.getAll('menuImages[]');
    const menuImages = [];

    for (const menuImageFile of menuImageFiles) {
      if (menuImageFile instanceof File && menuImageFile.size > 0) {
        try {
          const response = await storage.createFile(
            process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ROOMS,
            ID.unique(),
            menuImageFile
          );
          menuImages.push(response.$id);
        } catch (error) {
          console.log('Error uploading menu image:', error);
          return { error: 'Error uploading one or more menu images' };
        }
      } else {
        menuImages.push(null);
      }
    }

    // Create document
    await databases.createDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ROOMS,
      ID.unique(),
      {
        user_id: user.id,
        name: formData.get('name'),
        description: formData.get('description'),
        type: type,
        menuName: menuNames,
        menuDescription: menuDescriptions,  // Add the menu descriptions here
        menuPrice: menuPrices,
        stallNumber: parseInt(formData.get('stallNumber'), 10) || null,
        images: imageIDs,
        menuImages: menuImages,
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

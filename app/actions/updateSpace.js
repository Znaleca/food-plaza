'use server';

import { createAdminClient } from '@/config/appwrite';
import { ID } from 'node-appwrite'; // ✅ Add this import

const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE;
const COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ROOMS;
const BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ROOMS;

async function updateSpace(_, formData) {
  try {
    const { databases, storage } = await createAdminClient();

    const id = formData.get('id');
    const name = formData.get('name');
    const description = formData.get('description');
    const type = JSON.parse(formData.get('selectedTypes')) || [];
    const stallNumber = parseInt(formData.get('stallNumber'), 10);
    if (isNaN(stallNumber)) {
      throw new Error('Invalid stall number. It must be an integer.');
    }

    const menuNames = formData.getAll('menuNames').filter(item => item.trim() !== '');
    const menuPrices = formData.getAll('menuPrices')
      .map(value => parseFloat(value))
      .filter(value => !isNaN(value));
    const menuDescriptions = formData.getAll('menuDescriptions').filter(item => item.trim() !== '');
    const menuTypes = formData.getAll('menuType[]');

    const menuSmall = formData.getAll('menuSmall[]').map(v => parseFloat(v) || 0);
    const menuMedium = formData.getAll('menuMedium[]').map(v => parseFloat(v) || 0);
    const menuLarge = formData.getAll('menuLarge[]').map(v => parseFloat(v) || 0);

    const menuImageFiles = formData.getAll('menuImages[]');
    const existingMenuImages = formData.getAll('existingMenuImages[]');
    const newStallImages = formData.getAll('images');

    const menuImages = [];
    for (let i = 0; i < menuNames.length; i++) {
      const newImageFile = menuImageFiles[i];
      if (newImageFile instanceof File && newImageFile.size > 0) {
        const uploaded = await storage.createFile(BUCKET_ID, ID.unique(), newImageFile); // ✅ now works
        menuImages.push(uploaded.$id);
      } else {
        menuImages.push(existingMenuImages[i] || null);
      }
    }

    const stallImageIDs = [];
    for (const image of newStallImages) {
      if (image && image.size > 0) {
        const uploaded = await storage.createFile(BUCKET_ID, ID.unique(), image); // ✅ now works
        stallImageIDs.push(uploaded.$id);
      }
    }

    const finalMenuDescriptions = menuDescriptions.length > 0
      ? menuDescriptions
      : new Array(menuNames.length).fill(null);

    const updated = await databases.updateDocument(DB_ID, COLLECTION_ID, id, {
      name,
      description,
      type,
      stallNumber,
      menuName: menuNames,
      menuPrice: menuPrices,
      menuDescription: finalMenuDescriptions,
      menuType: menuTypes,
      menuSmall,
      menuMedium,
      menuLarge,
      menuImages,
      ...(stallImageIDs.length > 0 && { images: stallImageIDs })
    });

    return { success: true, data: updated };
  } catch (error) {
    console.error('Update Error:', error);
    return { success: false, error: error.message || 'Failed to update food stall.' };
  }
}

export default updateSpace;

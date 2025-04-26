'use server';

import { createAdminClient } from '@/config/appwrite';
import { ID } from 'appwrite';

const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE;
const COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ROOMS;
const BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ROOMS;

async function updateSpace(_, formData) {
  try {
    const { databases, storage } = await createAdminClient();

    const id = formData.get('id');
    const name = formData.get('name');
    const description = formData.get('description');
    const type = JSON.parse(formData.get('selectedTypes')) || []; // Ensure it's an array
    
    // Ensure 'stallNumber' is an integer
    const stallNumber = parseInt(formData.get('stallNumber'), 10);
    if (isNaN(stallNumber)) {
      throw new Error('Invalid stall number. It must be an integer.');
    }

    const menuNames = formData.getAll('menuNames').filter((item) => item.trim() !== '');
    const menuPrices = formData.getAll('menuPrices')
      .map((value) => parseFloat(value))
      .filter((value) => !isNaN(value));

    const menuImageFiles = formData.getAll('menuImages[]'); // Retrieve all menu images
    const existingMenuImages = formData.getAll('existingMenuImages[]');
    const newStallImages = formData.getAll('images'); // Optional new stall images

    // Ensure each menu price is a valid float
    const finalMenuPrices = menuPrices.map((price) => {
      const parsedPrice = parseFloat(price);
      if (isNaN(parsedPrice)) {
        throw new Error('Invalid menu price. Price must be a valid float.');
      }
      return parsedPrice;
    });

    // Handle menu images
    const menuImages = [];
    for (let i = 0; i < menuNames.length; i++) {
      const newImageFile = menuImageFiles[i];
      if (newImageFile instanceof File && newImageFile.size > 0) {
        const uploaded = await storage.createFile(BUCKET_ID, ID.unique(), newImageFile);
        menuImages.push(uploaded.$id); // Store image ID, not URL
      } else {
        menuImages.push(existingMenuImages[i] || null); // If no new image, keep the existing one or null
      }
    }

    // Upload new stall images
    const stallImageIDs = [];
    for (const image of newStallImages) {
      if (image && image.size > 0) {
        const uploaded = await storage.createFile(BUCKET_ID, ID.unique(), image);
        stallImageIDs.push(uploaded.$id); // Store image ID
      }
    }

    // Update the document
    const updated = await databases.updateDocument(DB_ID, COLLECTION_ID, id, {
      name,
      description,
      type, // Array type field
      stallNumber,  // Ensure it's an integer
      menuName: menuNames, // Array of menu names
      menuPrice: finalMenuPrices,  // Array of prices
      menuImages: menuImages, // Array of image IDs
      ...(stallImageIDs.length > 0 && { images: stallImageIDs }), // Optionally include new images
    });

    return { success: true, data: updated };
  } catch (error) {
    console.error('Update Error:', error);
    return { success: false, error: error.message || 'Failed to update food stall.' };
  }
}

export default updateSpace;

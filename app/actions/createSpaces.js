'use server';

import { createAdminClient } from '@/config/appwrite';
import checkAuth from './checkAuth';
import { ID, Query } from 'node-appwrite';
import { revalidatePath } from 'next/cache';

async function createSpaces(previousState, formData) {
  const { databases, storage } = await createAdminClient();

  try {
    /* ---------- auth ---------- */
    const { user } = await checkAuth();
    if (!user) return { error: 'You must be logged in to create a food stall.' };

    /* ---------- one-stall-per-user ---------- */
    const existing = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ROOMS,
      [Query.equal('user_id', user.id)],
    );
    if (existing.total > 0) return { error: 'You already have a food stall listed.' };

    /* ---------- stall images ---------- */
    const imageIDs = [];
    for (const img of formData.getAll('images')) {
      if (img && img.size && img.name !== 'undefined') {
        const res = await storage.createFile(
          process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ROOMS,
          ID.unique(),
          img,
        );
        imageIDs.push(res.$id);
      }
    }

    /* ---------- basic fields ---------- */
    const type      = JSON.parse(formData.get('selectedTypes') || '[]');
    const menuNames = formData.getAll('menuNames').filter((s) => s.trim());
    const menuDescriptions = formData.getAll('menuDescriptions[]');
    const menuPrices = formData
      .getAll('menuPrices')
      .map((v) => parseFloat(v))
      .filter((n) => !Number.isNaN(n));
    const menuType  = formData.getAll('menuType[]');

    /* ---------- size fees ---------- */
    const toNumbers = (arr) =>
      arr.map((v) => {
        const n = parseFloat(v);
        return Number.isFinite(n) ? n : 0;      // always Double
      });

    const menuSmall  = toNumbers(formData.getAll('menuSmall[]'));   // Double[]
    const menuMedium = toNumbers(formData.getAll('menuMedium[]'));  // Double[]
    const menuLarge  = toNumbers(formData.getAll('menuLarge[]'));   // Double[]

    /* ---------- menu images ---------- */
    const menuImages = [];
    for (const file of formData.getAll('menuImages[]')) {
      if (file instanceof File && file.size > 0) {
        const res = await storage.createFile(
          process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ROOMS,
          ID.unique(),
          file,
        );
        menuImages.push(res.$id);
      } else {
        menuImages.push(null);
      }
    }

    /* ---------- create document ---------- */
    await databases.createDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ROOMS,
      ID.unique(),
      {
        user_id: user.id,
        name:          formData.get('name'),
        description:   formData.get('description'),
        type,
        menuName:        menuNames,
        menuDescription: menuDescriptions,
        menuPrice:       menuPrices,
        menuType,
        menuSmall,     // ⬅️ Double[]
        menuMedium,    // ⬅️ Double[]
        menuLarge,     // ⬅️ Double[]
        stallNumber: parseInt(formData.get('stallNumber'), 10) || null,
        images: imageIDs,
        menuImages,
      },
    );

    revalidatePath('/', 'layout');
    return { success: true };
  } catch (err) {
    console.error(err);
    return { error: err.response?.message || 'An unexpected error has occurred' };
  }
}

export default createSpaces;

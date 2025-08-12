'use server';

import { createAdminClient } from '@/config/appwrite';
import { ID, Query } from 'node-appwrite';
import { revalidatePath } from 'next/cache';

async function createStall(previousState, formData) {
  const { databases, storage } = await createAdminClient();

  try {
    /* ---------- get user_id from form ---------- */
    const userId = formData.get('user_id');
    if (!userId) return { error: 'User ID is required to create a food stall.' };

    /* ---------- one-stall-per-user ---------- */
    const existing = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ROOMS,
      [Query.equal('user_id', userId)]
    );
    if (existing.total > 0) return { error: 'This user already has a food stall listed.' };

    /* ---------- stall images (optional) ---------- */
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

    /* ---------- create document ---------- */
    await databases.createDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ROOMS,
      ID.unique(),
      {
        user_id: userId,
        name:        formData.get('name'),
        description: formData.get('description'),
        stallNumber: parseInt(formData.get('stallNumber'), 10) || null,
        images: imageIDs,
      },
    );

    revalidatePath('/', 'layout');
    return { success: true };
  } catch (err) {
    console.error(err);
    return { error: err.response?.message || 'An unexpected error has occurred' };
  }
}

export default createStall;

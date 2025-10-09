'use server';

import { createAdminClient } from '@/config/appwrite';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

/**
 * Fetches all documents from the Menu collection (which is the Rooms collection).
 * This is a server-side function that revalidates the Next.js cache
 * upon successful retrieval.
 *
 * @returns {Promise<object>} A promise that resolves to the list of menu/room documents.
 */
async function getAllMenu() {
  try {
    const { databases } = await createAdminClient();

    // Fetch all menu documents using the ROOMS collection ID
    const menuList = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ROOMS // FIXED: Using the specified collection
      // Optionally, you could add queries here (e.g., Query.equal('is_menu_item', true))
    );

    // Revalidate the cache for the home layout
    revalidatePath('/', 'layout');

    return menuList;
  } catch (error) {
    console.log('Failed to fetch menu items', error);
    // Redirect on failure to a global error page
    redirect('/error');
  }
}

export default getAllMenu;
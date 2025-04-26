'use server';

import { createSessionClient } from '@/config/appwrite';
import { cookies } from 'next/headers';
import { Query } from 'node-appwrite';
import { revalidatePath } from 'next/cache';

async function deletePromo(promoId) {
  const sessionCookie = cookies().get('appwrite-session');
  if (!sessionCookie) {
    redirect('/login');
  }

  try {
    const { account, databases } = await createSessionClient(sessionCookie.value);

    // Get user's ID
    const user = await account.get();
    const userId = user.$id;

    // Fetch user's promos
    const { documents: promos } = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PROMOS,
      [Query.equal('user_id', userId)]  // Ensure the promo belongs to the user
    );

    // Find promo to delete
    const promoToDelete = promos.find((promo) => promo.$id === promoId);

    // Delete the promo
    if (promoToDelete) {
      await databases.deleteDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PROMOS,
        promoToDelete.$id
      );

      // Revalidate promos page
      revalidatePath('/foodstall/promos', 'layout');

      return {
        success: true,
      };
    } else {
      return {
        error: 'Promo not found',
      };
    }
  } catch (error) {
    console.log('Failed to delete promo', error);
    return {
      error: 'Failed to delete promo',
    };
  }
}

export default deletePromo;

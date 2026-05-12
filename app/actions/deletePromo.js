"use server";

import { createSessionClient } from '@/config/appwrite';
import getSessionCookie from './getSessionCookie';
import { Query } from 'appwrite';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

async function deletePromo(promoId) {
  const sessionCookie = await getSessionCookie();
  if (!sessionCookie) {
    redirect('/login');
  }

  try {
    const { account, databases } = await createSessionClient(sessionCookie.value);

    const user = await account.get();
    const userId = user.$id;

    const { documents: promos } = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PROMOS,
      [Query.equal('user_id', userId)]
    );

    const promoToDelete = promos.find((promo) => promo.$id === promoId);

    if (promoToDelete) {
      await databases.deleteDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PROMOS,
        promoToDelete.$id
      );

      revalidatePath('/foodstall/promos', 'layout');

      return {
        success: true,
      };
    }

    return {
      error: 'Promo not found',
    };
  } catch (error) {
    console.log('Failed to delete promo', error);
    return {
      error: 'Failed to delete promo',
    };
  }
}

export default deletePromo;

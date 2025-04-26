// app/actions/getSpace.js

'use server';

import { createAdminClient } from '@/config/appwrite';
import { redirect } from 'next/navigation';

async function getDocumentById(id) {
  try {
    const { databases } = await createAdminClient();

    const document = await databases.getDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ROOMS,
      id
    );

    return document;
  } catch (error) {
    console.error('Failed to get space by ID:', error);
    redirect('/error');
  }
}

export { getDocumentById };

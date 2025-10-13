// app/actions/getDocumentStatus.js
'use server';

import { createSessionClient } from '@/config/appwrite';
import { cookies } from 'next/headers';
import checkAuth from './checkAuth';

/**
 * Fetches the status of a specific document within a booking.
 * * @param {string} bookingId The ID of the lease/booking document.
 * @param {string} fileId The fileId of the specific document to check.
 * @returns {{status: string, document: object} | {error: string}}
 */
async function getDocumentStatus(bookingId, fileId) {
  const sessionCookie = cookies().get('appwrite-session');
  if (!sessionCookie) {
    return { error: 'Authentication required. Please log in.' };
  }

  try {
    const { databases } = await createSessionClient(sessionCookie.value);
    
    // Optional: Check if the user has permission to view this booking.
    const { user } = await checkAuth();
    if (!user) {
        return { error: 'You must be logged in to view document status.' };
    }
    // (A more robust check would verify the user ID against the booking's user_id or check admin role)


    // 1. Fetch the booking document
    const booking = await databases.getDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_BOOKINGS,
      bookingId
    );

    // 2. Parse the documents array
    const documents = booking.documents.map(docString => JSON.parse(docString));

    // 3. Find the specific document
    const document = documents.find(doc => doc.fileId === fileId);

    if (!document) {
        return { error: 'Document not found within the specified lease.' };
    }

    // Default to 'submitted' if status field doesn't exist (assuming upload implies submission)
    const status = document.status || 'submitted'; 

    return { status, document };

  } catch (error) {
    console.error('Failed to get document status:', error);
    // Appwrite error might reveal sensitive details, return a generic message
    return { error: 'Failed to retrieve document status. Please try again later.' };
  }
}

export default getDocumentStatus;
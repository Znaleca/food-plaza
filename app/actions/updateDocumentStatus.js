'use server';

import { createSessionClient } from '@/config/appwrite';
import { cookies } from 'next/headers';
import checkAuth from './checkAuth'; // Assuming this is a server action/utility

/**
 * Updates the status of a specific document within a booking/lease record.
 * * @param {string} bookingId The ID of the lease/booking document.
 * @param {string} fileId The fileId of the specific document to update.
 * @param {'verified' | 'submitted' | 'denied'} newStatus The new status to set.
 * @returns {{success: boolean, message: string} | {error: string}}
 */
async function updateDocumentStatus(bookingId, fileId, newStatus) {
  const sessionCookie = cookies().get('appwrite-session');
  if (!sessionCookie) {
    return { error: 'Authentication required. Please log in.' };
  }
  
  const validStatuses = ['verified', 'submitted', 'denied'];
  if (!validStatuses.includes(newStatus)) {
      return { error: 'Invalid status provided.' };
  }

  try {
    const { databases } = await createSessionClient(sessionCookie.value);
    const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE;
    const collectionId = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_BOOKINGS;
    
    // IMPORTANT: Implement a robust authorization check here. 
    // Only administrators or specific roles should be able to update document status to 'verified'/'denied'.
    const { user } = await checkAuth();
    if (!user /* || !user.roles.includes('admin') */) { 
        // Redirect/block if not authorized
        return { error: 'Unauthorized: Only admins can change document status.' };
    }


    // 1. Fetch the booking document
    const booking = await databases.getDocument(
      databaseId,
      collectionId,
      bookingId
    );

    let documentFound = false;
    let updateRequired = false;

    // 2. Parse, update, and re-stringify the documents array
    const updatedDocuments = booking.documents.map(docString => {
        let doc;
        try {
            doc = JSON.parse(docString);
        } catch (e) {
            console.error("Error parsing document JSON:", docString, e);
            return docString; // Return unparsed string if invalid
        }
        
        // Check if this is the document to update
        if (doc.fileId === fileId) {
            if (doc.status !== newStatus) {
                doc.status = newStatus; // Update the status
                documentFound = true;
                updateRequired = true; // Mark that an update has occurred
            } else {
                documentFound = true;
            }
        }

        return JSON.stringify(doc); // Re-stringify the object
    });

    if (!documentFound) {
        return { error: 'Document not found within the specified lease.' };
    }
    
    // If the status was already the same, we can exit early (though not strictly necessary)
    if (!updateRequired) {
        return { success: true, message: `Document status is already '${newStatus}'. No update performed.` };
    }


    // --- Core Updates to the Booking Record ---
    const updateData = {
        documents: updatedDocuments // 3. Update the booking document with the new documents array
    };
    
    // 4. *** NEW LOGIC: Check if the newStatus is 'denied' and update the main 'status' field ***
    if (newStatus === 'denied') {
        // Only update the main status if it's not already 'pending' (optional optimization)
        if (booking.status !== 'pending') {
            updateData.status = 'pending'; // Set the main status to pending
            console.log(`Setting main booking status for ${bookingId} to 'pending' due to document denial.`);
        } else {
            // Already pending, no change needed for main status
        }
    }


    // 5. Perform the final database update
    await databases.updateDocument(
        databaseId,
        collectionId,
        bookingId,
        updateData // Includes documents and optionally the main status
    );

    let successMessage = `Document status updated to '${newStatus}' successfully.`;
    if (updateData.status === 'pending') {
        successMessage += " The main booking status has been reset to 'pending'.";
    }

    return { success: true, message: successMessage };

  } catch (error) {
    console.error('Failed to update document status:', error);
    return { error: 'Failed to update document status. Please try again later.' };
  }
}

export default updateDocumentStatus;
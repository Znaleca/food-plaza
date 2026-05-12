'use server';

import { createSessionClient } from '@/config/appwrite';
import getSessionCookie from './getSessionCookie';
import checkAuth from './checkAuth'; // Assuming this is a server action/utility

/**
 * Updates the status and optional comment of a specific document within a booking/lease record.
 * * @param {string} bookingId The ID of the lease/booking document.
 * @param {string} fileId The fileId of the specific document to update.
 * @param {'verified' | 'submitted' | 'denied'} newStatus The new status to set.
 * @param {string} [comment] The denial reason (only used if newStatus is 'denied').
 * @returns {{success: boolean, message: string} | {error: string}}
 */
async function updateDocumentStatus(bookingId, fileId, newStatus, comment = '') {
    const sessionCookie = await getSessionCookie();
  if (!sessionCookie) {
    return { error: 'Authentication required. Please log in.' };
  }
  
  const validStatuses = ['verified', 'submitted', 'denied'];
  if (!validStatuses.includes(newStatus)) {
      return { error: 'Invalid status provided.' };
  }

  // Enforce comment requirement for denial
  if (newStatus === 'denied' && comment.trim() === '') {
      return { error: 'A denial comment is required to explain the reason to the user.' };
  }

  try {
    const { databases } = await createSessionClient(sessionCookie.value);
    const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE;
    const collectionId = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_BOOKINGS;
    
    // Authorization Check (Ensure this is enabled in a real application)
    const { user } = await checkAuth();
    if (!user /* || !user.roles.includes('admin') */) { 
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
            return docString;
        }
        
        // Check if this is the document to update
        if (doc.fileId === fileId) {
            
            // --- Preserve existing tenantComment ---
            const existingTenantComment = doc.tenantComment; 
            // -------------------------------------

            const statusChanged = doc.status !== newStatus;
            const commentChanged = newStatus === 'denied' && doc.comment !== comment.trim();
            const commentRemoved = newStatus !== 'denied' && doc.comment;

            if (statusChanged || commentChanged || commentRemoved) {
                doc.status = newStatus; // Update the status
                documentFound = true;
                updateRequired = true;

                // Handle Admin's Denial Comment
                if (newStatus === 'denied') {
                    doc.comment = comment.trim(); // Store the denial reason
                } else {
                    delete doc.comment; // Remove admin comment if status is verified/submitted
                }
            } else {
                documentFound = true;
            }
            
            // Restore the tenantComment attribute (it is NOT affected by admin action)
            if (existingTenantComment) {
                doc.tenantComment = existingTenantComment;
            }
        }

        // Allow updating the admin's denial comment even if status hasn't changed
        if (doc.fileId === fileId && newStatus === 'denied' && doc.comment !== comment.trim()) {
            doc.comment = comment.trim();
            documentFound = true;
            updateRequired = true;
        }

        return JSON.stringify(doc);
    });

    if (!documentFound) {
        return { error: 'Document not found within the specified lease.' };
    }
    
    // Exit early if no changes were actually made to status or comment
    if (!updateRequired) {
        return { success: true, message: `Document status is already '${newStatus}'. No update performed.` };
    }


    // --- Core Updates to the Booking Record ---
    const updateData = {
        documents: updatedDocuments
    };
    
    // Check if the main status needs to be reset due to denial
    if (newStatus === 'denied') {
        if (booking.status !== 'pending') {
            updateData.status = 'pending'; // Set the main status to pending
            console.log(`Setting main booking status for ${bookingId} to 'pending' due to document denial.`);
        }
    }


    // 5. Perform the final database update
    await databases.updateDocument(
        databaseId,
        collectionId,
        bookingId,
        updateData
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
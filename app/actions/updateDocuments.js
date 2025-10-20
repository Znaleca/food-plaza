'use server';

import { createAdminClient } from '@/config/appwrite';
import { ID } from 'node-appwrite';

/**
 * Updates multiple documents for a booking, storing file IDs in a single 'documents' array attribute.
 * When a file is uploaded, its status is automatically set to 'submitted'.
 * @param {string} bookingId The ID of the booking to update.
 * @param {FormData} formData The form data containing the files and comments.
 * @param {string[]} documentPapers The list of documents to process.
 * @returns {Promise<{success: boolean, fileIds: Object<string, string>} | {error: string}>}
 */
async function updateDocuments(bookingId, formData, documentPapers) {
  const { databases, storage } = await createAdminClient();

  try {
    // 1. Fetch existing booking
    const booking = await databases.getDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_BOOKINGS,
      bookingId
    );
    
    const existingDocuments = booking.documents || [];
    
    let documentList = existingDocuments.map(docString => JSON.parse(docString));
    
    const uploadedFileIds = {};
    let filesUploadedCount = 0;

    for (const docName of documentPapers) {
      const inputName = docName.toLowerCase().replace(/[^a-z0-9]/g, '_');
      const attachment = formData.get(inputName);
      // NEW: Get the tenant's optional comment for this document
      const tenantComment = formData.get(`comment_${inputName}`) || null;

      if (attachment && attachment.size > 0) {
        filesUploadedCount++;
        
        const existingDocIndex = documentList.findIndex(doc => doc.name === docName);
        const existingDoc = existingDocIndex !== -1 ? documentList[existingDocIndex] : null;
        const oldFileId = existingDoc?.fileId || null;
        
        // 2. If an old attachment exists → delete it
        if (oldFileId) {
          try {
            await storage.deleteFile(
              process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ROOMS,
              oldFileId
            );
          } catch (err) {
            console.warn(`Old file delete failed for ${docName} (ID: ${oldFileId}):`, err.message);
          }
        }

        // 3. Upload new file
        const uploaded = await storage.createFile(
          process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ROOMS,
          ID.unique(),
          attachment
        );
        
        // --- Document Entry Creation ---
        const newDocEntry = {
            name: docName,
            fileId: uploaded.$id,
            uploadedAt: new Date().toISOString(),
            status: 'submitted', 
        };
        
        // NEW: Add the tenant's comment if it exists and is not empty
        if (tenantComment && tenantComment.trim().length > 0) {
            newDocEntry.tenantComment = tenantComment.trim();
        }
        
        // NOTE: Admin denial comments (doc.comment) are NOT carried over when a new file is uploaded.
        // The admin comment is still readable in the previous object if we didn't replace it, 
        // but since we are replacing the entry, the tenant's submission clears the admin's denial state.
        // We ensure any previous admin denial comment is not present on the new entry.
        // -------------------------------

        // 4. Update the documentList array
        if (existingDocIndex !== -1) {
            documentList[existingDocIndex] = newDocEntry; // Replace old entry
        } else {
            documentList.push(newDocEntry); // Add new entry
        }

        uploadedFileIds[docName] = uploaded.$id;
      }
    }

    if (filesUploadedCount === 0) {
      return { error: 'No new files were uploaded.' };
    }
    
    // 5. Convert the updated list of objects back to an array of JSON strings
    const documentsToSave = documentList.map(doc => JSON.stringify(doc));

    // 6. Update booking with the new documents array and return the new list to the client
    const updatedBooking = await databases.updateDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_BOOKINGS,
      bookingId,
      {
        documents: documentsToSave,
      }
    );

    return { 
      success: true, 
      fileIds: uploadedFileIds, 
      newDocuments: updatedBooking.documents 
    };
  } catch (err) {
    console.error('Update Documents Error:', err);
    return { error: err.response?.message || 'Failed to upload documents.' };
  }
}

export default updateDocuments;
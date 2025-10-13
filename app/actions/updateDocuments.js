// app/actions/updateDocuments.js
'use server';

import { createAdminClient } from '@/config/appwrite';
import { ID } from 'node-appwrite';

/**
 * Updates multiple documents for a booking, storing file IDs in a single 'documents' array attribute.
 * When a file is uploaded, its status is automatically set to 'submitted'.
 * @param {string} bookingId The ID of the booking to update.
 * @param {FormData} formData The form data containing the files.
 * @param {string[]} documentPapers The list of documents to process.
 * @returns {Promise<{success: boolean, fileIds: Object<string, string>} | {error: string}>}
 */
async function updateDocuments(bookingId, formData, documentPapers) {
  const { databases, storage } = await createAdminClient();

  try {
    // 1. Fetch existing booking (to clean up old files and get existing document list)
    const booking = await databases.getDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_BOOKINGS,
      bookingId
    );
    
    // Get existing documents array, or initialize an empty array if null/undefined.
    // Each string in the array will be a JSON string: '{"name": "DTI", "fileId": "...", "status": "..."}'
    const existingDocuments = booking.documents || [];
    
    // Parse the existing JSON strings into an array of objects
    let documentList = existingDocuments.map(docString => JSON.parse(docString));
    
    const uploadedFileIds = {};
    let filesUploadedCount = 0;

    for (const docName of documentPapers) {
      const inputName = docName.toLowerCase().replace(/[^a-z0-9]/g, '_');
      const attachment = formData.get(inputName);

      // Check if a file was provided for this document type
      if (attachment && attachment.size > 0) {
        filesUploadedCount++;
        
        // Find if this document type already exists in the list
        const existingDocIndex = documentList.findIndex(doc => doc.name === docName);
        const oldFileId = existingDocIndex !== -1 ? documentList[existingDocIndex].fileId : null;
        
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
        
        // --- MODIFICATION HERE: Set status to 'submitted' on new upload ---
        const newDocEntry = {
            name: docName,
            fileId: uploaded.$id,
            uploadedAt: new Date().toISOString(),
            status: 'submitted', // <-- NEW: Set status to 'submitted'
        };
        // ------------------------------------------------------------------

        // 4. Update the documentList array
        if (existingDocIndex !== -1) {
            documentList[existingDocIndex] = newDocEntry; // Replace old entry
        } else {
            documentList.push(newDocEntry); // Add new entry
        }

        uploadedFileIds[docName] = uploaded.$id;
      }
      // Note: If a file is NOT provided, the existing one (if any) is kept.
    }

    // 5. Check if any files were successfully processed/uploaded
    if (filesUploadedCount === 0) {
      return { error: 'No new files were uploaded.' };
    }
    
    // 6. Convert the updated list of objects back to an array of JSON strings
    const documentsToSave = documentList.map(doc => JSON.stringify(doc));

    // 7. Update booking with the new documents array
    await databases.updateDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_BOOKINGS,
      bookingId,
      {
        documents: documentsToSave,
      }
    );

    return { success: true, fileIds: uploadedFileIds };
  } catch (err) {
    console.error('Update Documents Error:', err);
    return { error: err.response?.message || 'Failed to upload documents.' };
  }
}

export default updateDocuments;
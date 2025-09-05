'use server';

import { createAdminClient } from '@/config/appwrite';

async function getContractDisplay(bookingId) {
  const { databases, storage } = await createAdminClient();

  try {
    const booking = await databases.getDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_BOOKINGS,
      bookingId
    );

    const fileId = booking.contract_file_id || booking.pdf_attachment;
    if (!fileId) return { url: null };

    // Get file metadata (to know mimeType)
    const file = await storage.getFile(
      process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ROOMS,
      fileId
    );

    const fileUrl = `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ROOMS}/files/${fileId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT}`;

    return {
      url: fileUrl,
      fileId,
      mimeType: file.mimeType, // ✅ key for deciding preview
      name: file.name,
    };
  } catch (err) {
    console.error('getContractDisplay Error:', err);
    return { url: null, error: err.message || 'Failed to fetch contract display.' };
  }
}

export default getContractDisplay;

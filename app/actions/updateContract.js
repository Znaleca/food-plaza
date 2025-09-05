'use server';

import { createAdminClient } from '@/config/appwrite';
import { ID } from 'node-appwrite';

async function updateContract(bookingId, formData) {
  const { databases, storage } = await createAdminClient();

  try {
    const attachment = formData.get('attachment'); // 👈 match leaseStall field name

    if (!attachment || attachment.size === 0) {
      return { error: 'Please upload a valid file.' };
    }

    // Fetch existing booking (to clean up old file if exists)
    const booking = await databases.getDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_BOOKINGS,
      bookingId
    );

    // If an old attachment exists → delete it
    if (booking.pdf_attachment) {
      try {
        await storage.deleteFile(
          process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ROOMS,
          booking.pdf_attachment
        );
      } catch (err) {
        console.warn('Old attachment delete failed:', err.message);
      }
    }

    // Upload new file
    const uploaded = await storage.createFile(
      process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ROOMS,
      ID.unique(),
      attachment
    );

    // Update booking with new attachment
    await databases.updateDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_BOOKINGS,
      bookingId,
      {
        pdf_attachment: uploaded.$id,
      }
    );

    return { success: true, fileId: uploaded.$id };
  } catch (err) {
    console.error('Update Contract Error:', err);
    return { error: err.response?.message || 'Failed to upload contract file.' };
  }
}

export default updateContract;

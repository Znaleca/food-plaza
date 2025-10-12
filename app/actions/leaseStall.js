'use server';

import { createAdminClient } from '@/config/appwrite';
import { cookies } from 'next/headers';
import { ID } from 'node-appwrite';
import { redirect } from 'next/navigation';
import checkAuth from './checkAuth';
import { revalidatePath } from 'next/cache';
import checkSpaceAvailability from './checkSpaceAvailability';

async function leaseStall(previousState, formData) {
  const { databases, storage } = await createAdminClient();
  const sessionCookie = cookies().get('appwrite-session');
  if (!sessionCookie) redirect('/login');

  try {
    const { user } = await checkAuth();
    if (!user) return { error: 'You must be logged in to lease a stall.' };

    const fname = formData.get('fname');
    const gender = formData.get('gender');
    const residentialAddress = formData.get('residentialAddress');
    const phoneNumber = formData.get('phoneNumber'); // keep as string
    const socialMediaAccount = formData.get('socialMediaAccount');
    const checkInDate = formData.get('check_in_date');
    const checkInTime = formData.get('check_in_time');
    const checkOutDate = formData.get('check_out_date');
    const checkOutTime = formData.get('check_out_time');
    const roomId = formData.get('room_id');
    const pdf = formData.get('attachment');

    // Validate phone number (exactly 11 digits)
    if (!/^[0-9]{11}$/.test(phoneNumber)) {
      return { error: 'Invalid phone number format. It must be 11 digits (e.g., 09123456789).' };
    }

    const checkInDateTime = `${checkInDate}T${checkInTime}`;
    const checkOutDateTime = `${checkOutDate}T${checkOutTime}`;

    const isAvailable = await checkSpaceAvailability(roomId, checkInDateTime, checkOutDateTime);
    if (!isAvailable)
      return { error: 'This stall is already leased for the selected time.' };

    const roomData = await databases.getDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ROOMS,
      roomId
    );
    const stallNumber = roomData?.stallNumber || null;

    let pdfFileId = null;
    if (pdf && pdf.size > 0 && pdf.type === 'application/pdf') {
      const uploaded = await storage.createFile(
        process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ROOMS,
        ID.unique(),
        pdf
      );
      pdfFileId = uploaded.$id;
    }

    await databases.createDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_BOOKINGS,
      ID.unique(),
      {
        fname,
        gender,
        residentialAddress,
        phoneNumber, // ✅ string type (must match Appwrite schema)
        socialMediaAccount,
        check_in: checkInDateTime,
        check_out: checkOutDateTime,
        user_id: user.id,
        room_id: roomId,
        stallNumber,
        status: 'pending',
        pdf_attachment: pdfFileId,
      }
    );

    revalidatePath('/bookings', 'layout');
    return { success: true };
  } catch (err) {
    console.error('Leasing Error:', err);
    return {
      error: err.response?.message || 'An unexpected error occurred during leasing.',
    };
  }
}

export default leaseStall;

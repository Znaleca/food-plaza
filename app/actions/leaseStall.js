'use server';

import { createAdminClient } from '@/config/appwrite';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import checkAuth from './checkAuth';

async function leaseStall(bookingId, formData) {
  const { databases } = await createAdminClient();
  const sessionCookie = cookies().get('appwrite-session');
  if (!sessionCookie) redirect('/login');

  try {
    const { user } = await checkAuth();
    if (!user) return { error: 'You must be logged in to renew a lease.' };

    const checkInDate = formData.get('check_in_date');
    const checkInTime = formData.get('check_in_time');
    const checkOutDate = formData.get('check_out_date');
    const checkOutTime = formData.get('check_out_time');

    const checkInDateTime = `${checkInDate}T${checkInTime}`;
    const checkOutDateTime = `${checkOutDate}T${checkOutTime}`;

    // 📝 Update booking dates + reset status back to "pending"
    await databases.updateDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_BOOKINGS,
      bookingId,
      {
        check_in: checkInDateTime,
        check_out: checkOutDateTime,
        status: 'pending',
      }
    );

    revalidatePath('/bookings', 'layout');
    return { success: true };
  } catch (err) {
    console.error('Lease Renew Error:', err);
    return { error: err.response?.message || 'An error occurred while renewing the lease.' };
  }
}

export default leaseStall;

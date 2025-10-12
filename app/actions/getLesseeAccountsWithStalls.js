'use server';

import { createAdminClient } from '@/config/appwrite';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Query } from 'appwrite'; // Use 'appwrite' for server-side imports

async function getLesseeAccountsWithStalls() {
  const sessionCookie = cookies().get('appwrite-session');

  if (!sessionCookie) {
    redirect('/login');
  }

  try {
    const { users, databases } = await createAdminClient();

    // Get the current date and format it as an ISO string for comparison
    const now = new Date().toISOString(); 

    // 1. Get all foodstall user accounts
    const foodstallList = await users.list([
      Query.contains('labels', ['foodstall'])
    ]);

    // 2. Map users and find their active lease/stall
    const lesseesWithStalls = await Promise.all(
      foodstallList.users.map(async (user) => {
        let stallInfo = { stallName: 'No Active Stall', stallNumber: 'N/A' };

        try {
          // Find the active booking (lease) for this user
          const { documents: bookings } = await databases.listDocuments(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
            process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_BOOKINGS,
            [
              Query.equal('user_id', user.$id),
              Query.equal('status', 'approved'), 
              // Only leases that end AFTER the current time are considered active
              Query.greaterThan('check_out', now), 
              // Sort by creation date descending to prioritize the latest lease if multiple are found (though there should ideally be only one active)
              Query.orderDesc('$createdAt') 
            ]
          );

          if (bookings.length > 0) {
            // Take the first result (which is the newest active booking due to sorting)
            const booking = bookings[0];
            
            // Fetch the room/stall details
            const room = await databases.getDocument(
              process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
              process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ROOMS,
              booking.room_id
            );

            stallInfo = {
              stallName: room.name || 'Unnamed Stall',
              stallNumber: room.stallNumber || 'N/A',
            };
          }
        } catch (error) {
          // Log specific errors for debugging if room fetching fails
          console.error(`Error fetching stall for user ${user.$id}:`, error);
        }

        return {
          $id: user.$id,
          name: user.name || 'Unnamed',
          email: user.email,
          createdAt: user.$createdAt,
          labels: user.labels || [],
          ...stallInfo, // Attach stall details
        };
      })
    );

    return lesseesWithStalls;
  } catch (error) {
    console.error('Failed to get foodstall users with stalls:', error);
    // You should ensure the error handling here doesn't break the UI
    return []; 
  }
}

export default getLesseeAccountsWithStalls;
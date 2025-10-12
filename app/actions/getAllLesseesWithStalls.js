'use server';

import { createAdminClient } from '@/config/appwrite';

export default async function getAllLesseesWithStalls() {
  try {
    const { users, databases } = await createAdminClient();

    // 1️⃣ Fetch all users
    const { users: allUsers } = await users.list();

    // 2️⃣ Fetch all bookings
    const { documents: allBookings } = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_BOOKINGS
    );

    // 3️⃣ Fetch all rooms
    const { documents: allRooms } = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ROOMS
    );

    // 4️⃣ Combine all data
    const combinedData = allBookings.map((booking) => {
      const room = allRooms.find((r) => r.$id === booking.room_id);
      const userAccount = allUsers.find((u) => u.$id === booking.user_id);

      // 📨 Get the user who owns this room (the lessee)
      const roomOwner = allUsers.find((u) => u.$id === room?.user_id);

      return {
        // Booking details
        ...booking,

        // Lessee personal info
        fname: booking.fname || userAccount?.name || 'Unknown Tenant',
        gender: booking.gender || 'N/A',
        phoneNumber: booking.phoneNumber || 'N/A',
        residentialAddress: booking.residentialAddress || 'N/A',
        socialMediaAccount: booking.socialMediaAccount || 'N/A',

        // Stall info
        stallNumber: room?.stallNumber || 'Unassigned',
        // 🚨 MODIFIED THIS LINE TO USE 'room?.name'
        stallName: room?.name || 'Unassigned Stall', 
        check_in: booking.check_in,
        check_out: booking.check_out,

        // 📨 Email now from the user who owns the room
        email: roomOwner?.email || 'No Email Provided',

        // 🗓️ Creation date for the STALL (ROOM) - **UPDATED**
        createdAt: room?.$createdAt || null, 
      };
    });

    return combinedData;
  } catch (error) {
    console.error('❌ Failed to get lessee data:', error);
    return [];
  }
}
'use server';
import { createAdminClient } from '@/config/appwrite';

async function getFeaturedMenu() {
  const { databases } = await createAdminClient();

  try {
    const response = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ROOMS
    );

    // Extract all menu items from all rooms
    const menuItems = response.documents.flatMap((room) => 
      (room.menuName || []).map((menuName, index) => ({
        id: `${room.$id}-${index}`, // Unique ID for each menu item
        menuName,
        menuPrice: room.menuPrice?.[index] || 0,
        menuImage: room.menuImages?.[index] || null, // Fetch menu image
        roomName: room.name,
        roomId: room.$id, // Store room ID for linking
      }))
    );

    return menuItems;
  } catch (error) {
    console.error('Error fetching featured menu:', error);
    return [];
  }
}

export default getFeaturedMenu;

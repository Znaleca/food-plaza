'use server';

import { createAdminClient } from '@/config/appwrite';
import { Query } from 'appwrite';

// Max documents to fetch in one request (Appwrite limit)
const MAX_DOCS_LIMIT = 5000; 

const getOrdersQuantity = async () => {
  try {
    const { databases } = await createAdminClient();

    const response = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ORDER_STATUS,
      [
        // FIX: Set a high query limit to fetch all documents
        Query.limit(MAX_DOCS_LIMIT), 
      ]
    );

    const itemCount = {};

    response.documents.forEach((order) => {
      const { items } = order;
      if (!Array.isArray(items)) return; 

      items.forEach((itemStr) => {
        try {
          const item = JSON.parse(itemStr); 

          const key = item.menuId || item.menuName;
          const qty = Number(item.quantity) || 1;

          if (key) {
            if (!itemCount[key]) {
              itemCount[key] = {
                menuId: item.menuId,
                menuName: item.menuName,
                roomId: item.room_id,
                roomName: item.room_name,
                count: 0,
              };
            }
            itemCount[key].count += qty;
          }
        } catch (e) {
          console.error('Error parsing item string:', e);
        }
      });
    });

    return Object.values(itemCount); 
  } catch (error) {
    console.error('Failed to fetch order quantities:', error);
    return [];
  }
};

export default getOrdersQuantity;
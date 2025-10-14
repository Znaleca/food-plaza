'use server';

import { createAdminClient } from '@/config/appwrite';
import { Query } from 'appwrite';

/**
 * Fetches all order documents (up to a maximum limit) and aggregates
 * the total discount applied to each unique menu item across only 
 * *successfully paid* orders.
 *
 * @returns {Promise<Array<{menuName: string, totalDiscount: number, roomName: string}>>}
 */
const getOrdersDiscountData = async () => {
  try {
    const { databases } = await createAdminClient();
    
    // Set a high limit to fetch comprehensive data for aggregation (Appwrite max limit)
    const MAX_DOCS_LIMIT = 5000; 

    // 🛑 MODIFICATION: Filter to only include documents where payment_status is 'paid'
    const response = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ORDER_STATUS,
      [
        // 🟢 Filter by successful payment status
        Query.equal('payment_status', 'paid'), 
        
        // Fetch a large chunk of documents
        Query.limit(MAX_DOCS_LIMIT),
        // We only need the items array, which contains the discount data
        Query.select(['items']), 
        Query.orderDesc('$createdAt'),
      ]
    );

    // Map to store aggregated discounts: Key is "menuName|roomName"
    const itemDiscountMap = new Map();

    for (const order of response.documents) {
      if (!order.items || !Array.isArray(order.items)) continue;

      for (const itemStr of order.items) {
        try {
          const item = JSON.parse(itemStr);
          
          const menuName = item.menuName;
          const roomName = item.room_name;
          const discountAmount = Number(item.discountAmount) || 0;
          
          if (menuName && roomName) {
            const key = `${menuName}|${roomName}`;
            
            // Initialize or update the running total for this item
            if (itemDiscountMap.has(key)) {
              const existing = itemDiscountMap.get(key);
              existing.totalDiscount += discountAmount;
            } else {
              itemDiscountMap.set(key, {
                menuName,
                roomName,
                totalDiscount: discountAmount,
              });
            }
          }
        } catch (e) {
          // Log parsing error but continue with the next item
          console.warn('Error parsing order item JSON:', e);
        }
      }
    }

    // Convert the map values into the final array structure
    return Array.from(itemDiscountMap.values());

  } catch (error) {
    console.error('Failed to fetch and aggregate discount data:', error);
    // Return empty array on failure to prevent app crash
    return [];
  }
};

export default getOrdersDiscountData;
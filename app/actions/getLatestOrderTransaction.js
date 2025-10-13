'use server';

import { createAdminClient } from '@/config/appwrite';
import { Query } from 'appwrite';

/**
 * Fetches the single, most recent successfully paid order document 
 * that contains at least one item from the specified stall (roomName).
 *
 * @param {string} roomName - The name of the stall to filter by.
 * @returns {Promise<{finalAmount: number, discountAmount: number, timestamp: string}|null>} 
 * The details of the latest paid order, or null if none is found.
 */
const getLatestOrderTransaction = async (roomName) => {
  if (!roomName) {
    return null;
  }
  
  try {
    const { databases } = await createAdminClient();

    // 1. Fetch the most recent successful order document
    const response = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ORDER_STATUS,
      [
        // Filter by successful payment status
        Query.equal('payment_status', 'paid'), 
        // Order by creation time descending (most recent first)
        Query.orderDesc('$createdAt'),
        // Limit to only the latest 20 documents for efficiency
        Query.limit(20), 
      ]
    );

    // 2. Iterate through the top documents to find one that belongs to the stall
    let latestOrder = null;
    
    for (const order of response.documents) {
        let hasItemForStall = false;
        
        // Check if the order contains at least one item from the requested stall
        order.items.forEach(itemStr => {
            try {
                const item = JSON.parse(itemStr);
                if (item.room_name === roomName) {
                    hasItemForStall = true;
                }
            } catch {
                // Ignore malformed items
            }
        });

        if (hasItemForStall) {
            latestOrder = order;
            break; // Found the latest relevant order, stop searching
        }
    }
    
    if (!latestOrder) {
        return null; // No recent paid order found for this stall
    }

    // 3. Extract and aggregate data from the latest order, filtered by stall
    let stallDiscountAmount = 0;
    let stallFinalAmount = 0;
    
    latestOrder.items.forEach(itemStr => {
      try {
        const item = JSON.parse(itemStr);
        
        if (item.room_name === roomName) {
          const quantity = item.quantity || 1;
          const price = item.menuPrice || 0;
          const discount = item.discountAmount || 0;

          // Calculate the net revenue for this item
          const netRevenue = (price * quantity) - discount;

          stallDiscountAmount += discount;
          stallFinalAmount += netRevenue;
        }
      } catch {
        // Ignore malformed items
      }
    });


    // 4. Return the aggregated, stall-specific results
    return {
      finalAmount: stallFinalAmount,
      discountAmount: stallDiscountAmount,
      timestamp: latestOrder.$createdAt,
    };

  } catch (error) {
    console.error('Failed to fetch latest order transaction:', error);
    return null;
  }
};

export default getLatestOrderTransaction;
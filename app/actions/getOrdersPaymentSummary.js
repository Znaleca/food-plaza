'use server';

import { createAdminClient } from '@/config/appwrite';
import { Query } from 'appwrite';

/**
 * Fetches a summary of total gross revenue grouped by payment status (PAID vs FAILED) 
 * for a specific stall (roomName).
 * * It iterates through all orders, then only calculates revenue for items 
 * that belong to the specified roomName/stall.
 *
 * @param {string} roomName - The name of the stall to filter items by.
 * @returns {Promise<{paidRevenue: number, failedRevenue: number, ordersCount: number}>} Summary of revenue.
 */
const getOrdersPaymentSummary = async (roomName) => {
  if (!roomName) {
    console.warn('roomName is required for payment summary.');
    return { paidRevenue: 0, failedRevenue: 0, ordersCount: 0 };
  }
  
  try {
    const { databases } = await createAdminClient();

    // Fetch all orders. We cannot filter by roomName at the Appwrite level 
    // because roomName is nested inside the JSON 'items' array.
    const response = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ORDER_STATUS,
      [
        // OPTIMIZATION: Use Appwrite's max limit (5000) for full data processing
        Query.limit(5000), 
        Query.orderDesc('$createdAt'),
      ]
    );

    let paidRevenue = 0;
    let failedRevenue = 0;
    let ordersCount = 0; // Count orders that CONTAIN an item for this stall

    // Process each order document
    response.documents.forEach(order => {
      const paymentStatus = order.payment_status || 'failed';
      const isPaid = paymentStatus === 'paid'; 
      
      let stallGrossRevenue = 0;
      let hasItemForStall = false;

      // Calculate the gross revenue for ONLY items belonging to this roomName/stall
      order.items.forEach(itemStr => {
        try {
          const item = JSON.parse(itemStr);
          
          // 🛑 CRITICAL FILTER: Only process items for the current stall
          if (item.room_name === roomName) {
            hasItemForStall = true;
            // Gross Revenue calculation: Price * Quantity (as requested)
            stallGrossRevenue += (item.menuPrice || 0) * (item.quantity || 1);
          }
        } catch {
          // Ignore malformed items
        }
      });
      
      // Only count the order and its revenue if it contains an item for this stall
      if (hasItemForStall) {
          ordersCount++;
          
          if (isPaid) {
            // Revenue successfully captured (Gross Revenue of this stall's items)
            paidRevenue += stallGrossRevenue;
          } else {
            // Revenue lost due to payment failure (Gross Revenue opportunity lost)
            failedRevenue += stallGrossRevenue;
          }
      }
    });

    return {
      paidRevenue,
      failedRevenue,
      ordersCount,
    };
  } catch (error) {
    console.error('Failed to fetch payment summary:', error);
    return {
      paidRevenue: 0,
      failedRevenue: 0,
      ordersCount: 0,
    };
  }
};

export default getOrdersPaymentSummary;
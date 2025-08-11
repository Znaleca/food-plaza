'use server';

import { createAdminClient } from '@/config/appwrite';
import checkAuth from './checkAuth';
import { ID, Query } from 'node-appwrite';
import calculateTotals from './calculateTotal';

const processCheckout = async (cart, spaceId = null, voucherMap = {}) => {
  if (!cart || cart.length === 0) {
    throw new Error("Cart is empty");
  }

  try {
    const { databases } = await createAdminClient();
    const { user } = await checkAuth();

    if (!user) {
      throw new Error("You must be logged in to place an order.");
    }

    const {
      cleanedCart,
      baseTotal,
      serviceCharge,
      discountAmount,
      finalTotal,
    } = await calculateTotals(cart, null, databases);

    const stringifiedItems = cleanedCart.map((item) => JSON.stringify(item));

    // Convert voucherMap to readable promo strings
    const promoStrings = Object.entries(voucherMap).map(([roomId, voucher]) => {
      const roomName = voucher?.roomName || `Room ${roomId}`;
      return `${roomName} - ${voucher?.title} (${voucher?.discount}% off)`;
    });

    // --- Update redeemed[] in promotions collection ---
    for (const [, voucher] of Object.entries(voucherMap)) {
      if (!voucher?.title) continue; // skip if voucher data is incomplete

      // Look for promo by title (ideally use promo ID if available)
      const promoDocs = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PROMOS, // your promotions collection
        [Query.equal('title', voucher.title)]
      );

      if (promoDocs.total > 0) {
        const promo = promoDocs.documents[0];
        const redeemedList = Array.isArray(promo.redeemed) ? [...promo.redeemed] : [];

        // Add user.id if not already redeemed
        if (!redeemedList.includes(user.id)) {
          redeemedList.push(user.id);
          await databases.updateDocument(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
            process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PROMOS,
            promo.$id,
            { redeemed: redeemedList }
          );
        }
      }
    }
    // ---------------------------------------------------

    const orderPayload = {
      user_id: user.id,
      name: user.name || 'Unknown User',
      email: user.email || 'Unknown Email',
      status: ['pending'],
      items: stringifiedItems,
      total: [baseTotal, serviceCharge, -discountAmount, finalTotal],
      spaces: spaceId || null,
      promos: promoStrings,
      created_at: new Date().toISOString(),
    };

    const response = await databases.createDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ORDER_STATUS,
      ID.unique(),
      orderPayload
    );

    return {
      success: true,
      message: "Order placed successfully!",
      orderId: response.$id,
      order: response,
    };
  } catch (error) {
    console.error("Checkout error:", error);
    return {
      success: false,
      message: error.message || "Checkout failed",
    };
  }
};

export default processCheckout;

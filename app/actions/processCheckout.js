'use server';

import { createAdminClient } from '@/config/appwrite';
import checkAuth from './checkAuth';
import { ID, Query } from 'node-appwrite';

const processCheckout = async (cart, spaceId = null, voucherMap = {}) => {
  if (!cart || cart.length === 0) {
    throw new Error("Cart is empty");
  }

  try {
    const { databases } = await createAdminClient();
    const { user } = await checkAuth();

    if (!user || !user.id) {
      throw new Error("You must be logged in to place an order.");
    }

    const userId = user.id;

    // ✅ Per-item discount-aware calculation
    let baseTotal = 0;
    let discountAmount = 0;
    let finalTotal = 0;

    const cleanedCart = cart.map((item) => {
      const quantity = Number(item.quantity || 1);
      const itemBase = Number(item.menuPrice) * quantity;
      const itemDiscount = Number(item.discountAmount || 0);

      baseTotal += itemBase;
      discountAmount += itemDiscount;
      finalTotal += itemBase - itemDiscount;

      return {
        ...item,
        quantity,
        discountAmount: itemDiscount,
      };
    });

    const serviceCharge = 0; // can add service charge later if needed

    const stringifiedItems = cleanedCart.map((item) => JSON.stringify(item));

    // Build promo strings for display
    const promoStrings = Object.entries(voucherMap).map(([roomId, voucher]) => {
      const itemWithRoomName = cleanedCart.find(item => item.room_id === roomId);
      const roomName = itemWithRoomName?.room_name || `Room ${roomId}`;
      return `${roomName} - ${voucher?.title || 'Special Discount'} (${voucher?.discount || ''}% off)`;
    });

    // Update redeemed users for each voucher (skip special discounts)
    for (const [, voucher] of Object.entries(voucherMap)) {
      if (!voucher || voucher.isSpecial || !voucher.title) continue;

      const promoDocs = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
        process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PROMOS,
        [Query.equal('title', voucher.title)]
      );

      if (promoDocs.total > 0) {
        const promo = promoDocs.documents[0];
        const redeemedList = Array.isArray(promo.redeemed) ? [...promo.redeemed] : [];

        if (!redeemedList.includes(userId)) {
          redeemedList.push(userId);

          await databases.updateDocument(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
            process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PROMOS,
            promo.$id,
            {
              redeemed: redeemedList,
              updated_at: new Date().toISOString(),
            }
          );
        }
      }
    }

    // Build order payload
    const orderPayload = {
      user_id: userId,
      name: user.name || 'Unknown User',
      email: user.email || 'Unknown Email',
      phone: user.phone || 'No phone',
      status: ['order-placed'],
      items: stringifiedItems,
      total: [baseTotal, serviceCharge, -discountAmount, finalTotal],
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

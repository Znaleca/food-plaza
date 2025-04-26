'use server';

import { createAdminClient } from '@/config/appwrite';
import checkAuth from './checkAuth';
import { ID } from 'node-appwrite';
import calculateTotals from './calculateTotal';

const processCheckout = async (cart, spaceId = null, voucherId = null) => {
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
    } = await calculateTotals(cart, voucherId, databases);

    const stringifiedItems = cleanedCart.map((item) => JSON.stringify(item));

    const orderPayload = {
      user_id: user.id,
      name: user.name || 'Unknown User', 
      email: user.email || 'Unknown Email', 
      status: "pending",
      items: stringifiedItems,
      total: [baseTotal, serviceCharge, -discountAmount, finalTotal],
      spaces: spaceId || null,
      promos: voucherId || null, 
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
      usedVoucherId: voucherId,
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

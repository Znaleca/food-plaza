'use server';

import { createAdminClient } from '@/config/appwrite';
import checkAuth from './checkAuth';
import { ID, Query } from 'node-appwrite';
import getMenuCapacityAndUpdateAvailability from '@/app/actions/getMenuCapacityAndUpdateAvailability';

const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE;
const COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ROOMS; // Assuming this is the stalls collection
const ROOMS_COLLECTION_ID = COLLECTION_ID; // Reuse for stalls

// Define the separator used in the frontend (from adjustIngredientStock)
const DATA_SEPARATOR = '::';

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
    
    // ⭐ UPDATED MAP: To track service type per stall
    const serviceTypeMap = {}; 

    const cleanedCart = cart.map((item) => {
      const quantity = Number(item.quantity || 1);
      const itemBase = Number(item.menuPrice) * quantity;
      const itemDiscount = Number(item.discountAmount || 0);

      baseTotal += itemBase;
      discountAmount += itemDiscount;
      finalTotal += itemBase - itemDiscount;
      
      // ⭐ Capture the service type per room (stall)
      if (item.room_id) {
          // This ensures we only record one service type per stall, even if it has multiple items
          serviceTypeMap[item.room_id] = {
              type: item.dineTakeOut,
              roomName: item.room_name || `Room ${item.room_id}`
          };
      }

      return {
        ...item,
        quantity,
        discountAmount: itemDiscount,
      };
    });

    const stringifiedItems = cleanedCart.map((item) => JSON.stringify(item));

    // Build promo strings for display
    const promoStrings = Object.entries(voucherMap).map(([roomId, voucher]) => {
      const itemWithRoomName = cleanedCart.find(item => item.room_id === roomId);
      const roomName = itemWithRoomName?.room_name || `Room ${roomId}`;
      return `${roomName} - ${voucher?.title || 'Special Discount'} (${voucher?.discount || ''}% off)`;
    });
    
    // ⭐ NEW: Build service type strings for the Appwrite attribute "serviceType"
    const serviceTypeStrings = Object.entries(serviceTypeMap).map(([roomId, data]) => {
        // Format: "Stall Name: Dine In" or "Stall Name: Take Out"
        return `${data.roomName}: ${data.type}`;
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
              // REMOVED: updated_at: new Date().toISOString(), (Assuming Appwrite handles $updatedAt)
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
      total: [baseTotal, -discountAmount, finalTotal],
      promos: promoStrings,
      serviceType: serviceTypeStrings,
      // REMOVED: created_at: new Date().toISOString(), (Use $createdAt if possible, otherwise keep it if manually tracked)
    };

    // NOTE: Keeping 'created_at' in orderPayload because you might be using it
    // as a custom attribute, or it's needed for initial creation. Appwrite
    // will set $createdAt automatically, but we'll leave your original
    // created_at field unless you confirm it's not a custom attribute.
    
    // *** The fix focuses on the update document call that is throwing the error. ***

    const response = await databases.createDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE,
      process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ORDER_STATUS,
      ID.unique(),
      {
          ...orderPayload,
          // If created_at is NOT a custom attribute in your schema, you can remove it here
          created_at: new Date().toISOString(),
      }
    );

    // ✅ Deduct from menuQuantity and ingredient stocks after order creation
    await deductStockForOrder(cleanedCart, databases);

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

// ✅ HELPER: Deduct stock for all items in the order (batched by stall)
const deductStockForOrder = async (cleanedCart, databases) => {
  // Group deductions by stall (room_id)
  const deductionsByStall = {};
  cleanedCart.forEach((item) => {
    const stallId = item.room_id;
    const menuName = item.menuName;
    const quantity = item.quantity;

    if (!stallId || !menuName || quantity <= 0) return;

    if (!deductionsByStall[stallId]) {
      deductionsByStall[stallId] = {};
    }
    if (!deductionsByStall[stallId][menuName]) {
      deductionsByStall[stallId][menuName] = 0;
    }
    deductionsByStall[stallId][menuName] += quantity;
  });

  // Process each stall
  for (const [stallId, menuDeductions] of Object.entries(deductionsByStall)) {
    // Fetch current stall document
    const stall = await databases.getDocument(
      DB_ID,
      ROOMS_COLLECTION_ID,
      stallId
    );

    let currentMenuQuantity = stall.menuQuantity || new Array(stall.menuName?.length || 0).fill(0);
    let currentStocks = stall.stocks || [];

    // Step 1: Apply menu quantity deductions
    const updatedMenuQuantity = [...currentMenuQuantity];
    for (const [menuName, totalQty] of Object.entries(menuDeductions)) {
      const index = stall.menuName?.indexOf(menuName);
      if (index === -1) {
        throw new Error(`Menu item "${menuName}" not found in stall ${stallId}`);
      }
      if (updatedMenuQuantity[index] < totalQty) {
        throw new Error(`Insufficient stock for "${menuName}" in stall ${stallId}. Available: ${updatedMenuQuantity[index]}, Ordered: ${totalQty}`);
      }
      updatedMenuQuantity[index] -= totalQty;
    }

    // Step 2: Adjust ingredient stocks for all menu deductions (batched)
    let updatedStocks = [...currentStocks];
    for (const [menuName, totalQty] of Object.entries(menuDeductions)) {
      const qtyChange = -totalQty; // Negative for deduction

      updatedStocks = updatedStocks.map((stockString) => {
        const parts = stockString.split('|');
        if (parts.length !== 5) {
          return stockString; // Skip malformed
        }

        let [group, ingredientData, quantityStr, batchDate, expiryDate] = parts;
        const [ingredientName, linkedMenus = ''] = ingredientData.split(DATA_SEPARATOR);
        const linkedMenuNames = linkedMenus.split(',');

        // Adjust if linked to this menuName
        if (linkedMenuNames.includes(menuName)) {
          const [currentAmountStr, unit] = quantityStr.split(' ');
          let currentAmount = parseFloat(currentAmountStr) || 0;
          let newAmount = Math.max(0, currentAmount + qtyChange); // Prevent negative

          const newQuantityStr = `${newAmount.toFixed(2)} ${unit}`;
          return `${group}|${ingredientData}|${newQuantityStr}|${batchDate}|${expiryDate}`;
        }

        return stockString;
      });
    }

    // Step 3: Update stall document atomically
    await databases.updateDocument(DB_ID, ROOMS_COLLECTION_ID, stallId, {
      menuQuantity: updatedMenuQuantity,
      stocks: updatedStocks,
      // FIX: Removed manual 'updated_at' attribute. Appwrite handles the $updatedAt timestamp automatically.
      // updated_at: new Date().toISOString(), 
    });

    // Step 4: Re-sync menu availability based on new ingredient stocks (using your existing function)
    const capacityResult = await getMenuCapacityAndUpdateAvailability({ stallId });
    if (!capacityResult.success) {
      console.warn(`Failed to sync availability for stall ${stallId}:`, capacityResult.error);
    }
  }
};

export default processCheckout;
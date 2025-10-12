'use server';

import { createAdminClient } from '@/config/appwrite';

const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE;
const COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ROOMS;

// Define the separator used in the frontend
const DATA_SEPARATOR = '::';

const adjustIngredientStock = async ({ stallId, updatedMenuQuantities, menuName, quantityChange }) => {
  try {
    const { databases } = await createAdminClient();

    if (!stallId) {
      throw new Error('Invalid or missing stall ID.');
    }

    // 1. Fetch the current stall document
    const stall = await databases.getDocument(DB_ID, COLLECTION_ID, stallId);
    let currentStocks = stall.stocks || [];

    const menuIndex = stall.menuName.indexOf(menuName);
    if (menuIndex === -1) {
        throw new Error(`Menu item "${menuName}" not found.`);
    }

    // --- NEW: Pre-check for stock availability BEFORE deduction ---
    if (quantityChange < 0) { // Only run this check when we are DECREASING stock
      for (const stockString of currentStocks) {
        const parts = stockString.split('|');
        if (parts.length !== 5) continue; // Skip malformed entries

        const [group, ingredientData, quantityStr] = parts;
        
        // Extract ingredient name and linked menus
        const [ingredientName, linkedMenus = ''] = ingredientData.split(DATA_SEPARATOR);
        const linkedMenuNames = linkedMenus.split(',');

        // Check if this ingredient is linked to the menu item being changed
        if (linkedMenuNames.includes(menuName)) {
          const [currentAmountStr] = quantityStr.split(' ');
          const currentAmount = parseFloat(currentAmountStr) || 0;

          // If ANY linked ingredient is out of stock, block the entire operation
          if (currentAmount <= 0) {
            return {
              success: false,
              error: `Cannot decrease stock. Ingredient "${ingredientName}" is out of stock.`,
            };
          }
        }
      }
    }
    // --- END of Pre-check ---


    // --- Core Stock Adjustment Logic ---
    // This part will only run if the pre-check passes (or if we are increasing stock)
    const ingredientConsumptionDelta = quantityChange;

    const newStocks = currentStocks.map(stockString => {
        const parts = stockString.split('|');
        if (parts.length !== 5) {
            return stockString; // Skip malformed entries
        }

        let [group, ingredientData, quantityStr, batchDate, expiryDate] = parts;
        
        const [ingredientName, linkedMenus = ''] = ingredientData.split(DATA_SEPARATOR);
        const linkedMenuNames = linkedMenus.split(',');

        // Check if this raw ingredient stock is linked to the menu item being updated
        if (linkedMenuNames.includes(menuName)) {
            const [currentAmountStr, unit] = quantityStr.split(' ');
            let currentAmount = parseFloat(currentAmountStr) || 0;
            
            // Calculate the new amount
            let newAmount = currentAmount + ingredientConsumptionDelta;
            newAmount = Math.max(0, newAmount); // Ensure stock doesn't go negative

            // Reconstruct the stock string
            const newQuantityStr = `${newAmount.toFixed(2)} ${unit}`;
            return `${group}|${ingredientData}|${newQuantityStr}|${batchDate}|${expiryDate}`;
        }

        return stockString; // Return unchanged if not linked
    });


    // 2. Update the document with both the new menu quantities and the new ingredient stocks
    const updated = await databases.updateDocument(DB_ID, COLLECTION_ID, stallId, {
      menuQuantity: updatedMenuQuantities, // Update menu quantities
      stocks: newStocks,                   // Update ingredient stocks
    });

    return {
      success: true,
      data: updated,
    };
  } catch (error) {
    console.error('[Appwrite] Failed to adjust ingredient stock:', error);
    return {
      success: false,
      error: error?.message || 'Unexpected error occurred while adjusting inventory and menu stock.',
    };
  }
};

export default adjustIngredientStock;
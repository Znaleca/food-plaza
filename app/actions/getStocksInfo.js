'use server';

import { createAdminClient } from '@/config/appwrite';

const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE;
const COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ROOMS;

// Define the separator used in the frontend for consistency
const DATA_SEPARATOR = '::';

const getStocksInfo = async ({ stallId }) => {
  try {
    const { databases } = await createAdminClient();

    if (!stallId) {
      throw new Error('Invalid or missing stall ID.');
    }

    // 1. Fetch the current stall document
    const stall = await databases.getDocument(DB_ID, COLLECTION_ID, stallId);
    const menuNames = stall.menuName || [];
    const currentStocks = stall.stocks || [];

    if (menuNames.length === 0) {
      return {
        success: true,
        data: {
          stockAvailability: new Array(0).fill(true), // No menus, empty array
          warning: 'No menu items found.',
        },
      };
    }

    // 2. Build a map: menuName -> list of required ingredient names (from linkedMenus)
    const menuToIngredients = new Map();
    menuNames.forEach((menuName) => {
      menuToIngredients.set(menuName, new Set()); // Use Set to avoid duplicates
    });

    // Parse stocks to populate the map
    for (const stockString of currentStocks) {
      const parts = stockString.split('|');
      if (parts.length !== 5) continue; // Skip malformed entries

      const [, ingredientData, quantityStr] = parts;
      
      // Extract ingredient name and linked menus
      const [ingredientName, linkedMenus = ''] = ingredientData.split(DATA_SEPARATOR);
      if (!ingredientName || !linkedMenus) continue;

      const linkedMenuNames = linkedMenus.split(',').map(name => name.trim()).filter(name => name);
      
      // For each linked menu, add this ingredient as required
      linkedMenuNames.forEach((menuName) => {
        if (menuToIngredients.has(menuName)) {
          menuToIngredients.get(menuName).add(ingredientName);
        }
      });
    }

    // 3. Build stock levels map: ingredientName -> currentAmount
    const ingredientStockLevels = new Map();
    for (const stockString of currentStocks) {
      const parts = stockString.split('|');
      if (parts.length !== 5) continue;

      const [, ingredientData, quantityStr] = parts;
      const [ingredientName] = ingredientData.split(DATA_SEPARATOR);
      const [currentAmountStr] = quantityStr.split(' ');
      const currentAmount = parseFloat(currentAmountStr) || 0;

      ingredientStockLevels.set(ingredientName, currentAmount);
    }

    // 4. Compute availability for each menu index
    const stockAvailability = menuNames.map((menuName) => {
      const requiredIngredients = menuToIngredients.get(menuName) || new Set();
      
      if (requiredIngredients.size === 0) {
        return true; // No ingredients required -> available
      }

      // Check if ALL required ingredients have >0 stock
      for (const ingredientName of requiredIngredients) {
        const stockLevel = ingredientStockLevels.get(ingredientName) || 0;
        if (stockLevel <= 0) {
          return false; // Lacking at least one ingredient -> unavailable
        }
      }
      
      return true; // All ingredients have stock -> available
    });

    return {
      success: true,
      data: {
        stockAvailability, // Array of booleans [true, false, true, ...] matching menu indices
        menuNames, // For debugging/logging if needed
        ingredientStockLevels: Object.fromEntries(ingredientStockLevels), // Optional: full stock levels map
      },
    };
  } catch (error) {
    console.error('[Appwrite] Failed to get stocks info:', error);
    return {
      success: false,
      error: error?.message || 'Unexpected error occurred while checking stock availability.',
    };
  }
};

export default getStocksInfo;
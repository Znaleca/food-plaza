'use server';

import { createAdminClient } from '@/config/appwrite';

const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE;
const COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ROOMS;

// Define the separator used in the frontend
const DATA_SEPARATOR = '::';
const DEFAULT_CONSUMPTION_RATE = 1; 

/**
 * Calculates the maximum number of each menu item that can be produced
 * based on the current raw ingredient stock.
 * * @param {object} params
 * @param {string} params.stallId The ID of the stall document.
 * @returns {Promise<{success: boolean, data?: number[], error?: string}>}
 */
const getMenuCapacity = async ({ stallId }) => {
  try {
    const { databases } = await createAdminClient();

    if (!stallId) {
      throw new Error('Invalid or missing stall ID.');
    }

    const stall = await databases.getDocument(DB_ID, COLLECTION_ID, stallId);
    const menuNames = stall.menuName || [];
    const currentStocks = stall.stocks || [];

    if (menuNames.length === 0) {
      return { success: true, data: [] };
    }

    const menuCapacityPerIngredient = new Map(); // menuName -> [{ingredient: name, maxServings: num}]

    for (const stockString of currentStocks) {
      const parts = stockString.split('|');
      if (parts.length !== 5) continue;

      const [, ingredientData, quantityUnitStr] = parts; // <-- Use parts[2] for quantity
      const [ingredientName, linkedMenus = ''] = ingredientData.split(DATA_SEPARATOR);
      const linkedMenuNames = linkedMenus.split(',').map(name => name.trim()).filter(name => name);
      
      // --- FIX: Robustly extract the numeric stock amount ---
      const [currentAmountStr] = quantityUnitStr.split(' ');
      const currentAmount = parseFloat(currentAmountStr);
      
      if (isNaN(currentAmount)) continue; // Skip if amount is not a valid number
      // --- END FIX ---
      
      // Assuming a consumption rate of 1 unit of stock per menu item
      const maxServingsFromThisIngredient = Math.floor(currentAmount / DEFAULT_CONSUMPTION_RATE);

      // Populate menuCapacityPerIngredient
      linkedMenuNames.forEach((menuName) => {
        if (!menuCapacityPerIngredient.has(menuName)) {
          menuCapacityPerIngredient.set(menuName, []);
        }
        menuCapacityPerIngredient.get(menuName).push({
          ingredient: ingredientName,
          maxServings: maxServingsFromThisIngredient,
        });
      });
    }

    // 3. Compute the final capacity (limiting factor) for each menu item
    const menuCapacity = menuNames.map((menuName) => {
      const ingredientCapacities = menuCapacityPerIngredient.get(menuName);

      if (!ingredientCapacities || ingredientCapacities.length === 0) {
        return 9999; 
      }

      // Capacity is the minimum of all linked ingredient capacities
      const capacity = ingredientCapacities.reduce((min, current) => {
        return Math.min(min, current.maxServings);
      }, Infinity); 

      return capacity === Infinity ? 0 : capacity; 
    });

    return {
      success: true,
      data: menuCapacity, 
    };
  } catch (error) {
    console.error('[Appwrite] Failed to get menu capacity:', error);
    return {
      success: false,
      error: error?.message || 'Unexpected error occurred while calculating menu capacity.',
    };
  }
};

export default getMenuCapacity;
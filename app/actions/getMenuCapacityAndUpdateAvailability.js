'use server';

import { createAdminClient } from '@/config/appwrite';

const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE;
const COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_ROOMS;

// Define the separator used in the frontend
const DATA_SEPARATOR = '::';
const DEFAULT_CONSUMPTION_RATE = 1;

/**
 * Helper function: Updates the menuAvailability field in the Appwrite document.
 * @param {object} params
 * @param {string} params.id The ID of the stall document.
 * @param {boolean[]} params.menuAvailability The new array of boolean availability.
 * @returns {Promise<any>}
 */
const updateAvailability = async ({ id, menuAvailability }) => {
  try {
    const { databases } = await createAdminClient();

    if (!id || typeof id !== 'string') {
      throw new Error('Invalid or missing stall ID.');
    }

    if (!Array.isArray(menuAvailability)) {
      throw new Error('Availability list is not a valid array.');
    }

    // Ensure the array only contains explicit booleans
    const parsedAvailability = menuAvailability.map((val) => !!val);

    const updated = await databases.updateDocument(DB_ID, COLLECTION_ID, id, {
      menuAvailability: parsedAvailability,
    });

    return {
      success: true,
      data: updated,
    };
  } catch (error) {
    console.error('[Appwrite] Failed to update menu availability:', error);
    // Suppress error propagation for capacity calculation, but log it
    return {
      success: false,
      error: error?.message || 'Unexpected error occurred while updating availability.',
    };
  }
};


/**
 * Calculates the maximum number of each menu item that can be produced
 * based on the current raw ingredient stock and automatically updates the
 * menuAvailability field in the Appwrite document.
 *
 * @param {object} params
 * @param {string} params.stallId The ID of the stall document.
 * @returns {Promise<{success: boolean, data?: number[], availabilityUpdated: boolean, error?: string}>}
 */
const getMenuCapacityAndUpdateAvailability = async ({ stallId }) => {
  let menuCapacity = [];
  try {
    const { databases } = await createAdminClient();

    if (!stallId) {
      throw new Error('Invalid or missing stall ID.');
    }

    const stall = await databases.getDocument(DB_ID, COLLECTION_ID, stallId);
    const menuNames = stall.menuName || [];
    const currentStocks = stall.stocks || [];

    if (menuNames.length === 0) {
      // Nothing to do if there are no menu items
      return { success: true, data: [], availabilityUpdated: true };
    }

    const menuCapacityPerIngredient = new Map(); // menuName -> [{ingredient: name, maxServings: num}]

    // 1. Calculate max servings based on each ingredient's stock
    for (const stockString of currentStocks) {
      const parts = stockString.split('|');
      // Expecting a specific format (e.g., ID | IngredientData | QuantityUnitStr | Source | Date)
      if (parts.length !== 5) continue;

      // parts[1] is ingredientData, parts[2] is quantityUnitStr
      const [, ingredientData, quantityUnitStr] = parts; 
      const [ingredientName, linkedMenus = ''] = ingredientData.split(DATA_SEPARATOR);
      const linkedMenuNames = linkedMenus.split(',').map(name => name.trim()).filter(name => name);

      // Robustly extract the numeric stock amount
      const [currentAmountStr] = quantityUnitStr.split(' ');
      const currentAmount = parseFloat(currentAmountStr);

      if (isNaN(currentAmount)) continue;

      // Calculate capacity from this single ingredient
      const maxServingsFromThisIngredient = Math.floor(currentAmount / DEFAULT_CONSUMPTION_RATE);

      // Populate map for later min calculation
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

    // 2. Compute the final capacity (limiting factor) for each menu item
    menuCapacity = menuNames.map((menuName) => {
      const ingredientCapacities = menuCapacityPerIngredient.get(menuName);

      if (!ingredientCapacities || ingredientCapacities.length === 0) {
        // Assume infinite capacity if no ingredients are linked to this menu item
        return 9999;
      }

      // Capacity is the minimum of all linked ingredient capacities
      const capacity = ingredientCapacities.reduce((min, current) => {
        return Math.min(min, current.maxServings);
      }, Infinity);

      // Map Infinity (not limited by stock) to 9999, and handle menus limited to 0
      return capacity === Infinity ? 9999 : capacity;
    });

    // 3. Automatically determine and update availability
    // A menu is available (true) if its capacity is > 0, otherwise unavailable (false).
    const menuAvailability = menuCapacity.map(capacity => capacity > 0);

    const updateResult = await updateAvailability({
      id: stallId,
      menuAvailability: menuAvailability,
    });

    return {
      success: true,
      data: menuCapacity,
      availabilityUpdated: updateResult.success,
    };

  } catch (error) {
    console.error('[Appwrite] Failed to get menu capacity and update availability:', error);
    return {
      success: false,
      data: menuCapacity, // Return the partial capacity if calculated
      availabilityUpdated: false,
      error: error?.message || 'Unexpected error occurred.',
    };
  }
};

export default getMenuCapacityAndUpdateAvailability;
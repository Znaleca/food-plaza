'use client';

import { useMemo } from 'react';
import { FaBoxes, FaExclamationTriangle, FaCheckCircle, FaBalanceScale } from 'react-icons/fa';

// A simple utility for converting units to a base unit (g, mL, pcs)
const convertToBaseUnit = (amount, unit) => {
  switch (unit?.toLowerCase()) {
    case 'kg':
      return { amount: amount * 1000, unit: 'g' };
    case 'l':
      return { amount: amount * 1000, unit: 'mL' };
    default:
      return { amount, unit: unit?.toLowerCase() };
  }
};

// Helper to parse the stored ingredient string to get just the name
const parseIngredientName = (storedString) => {
  const DATA_SEPARATOR = '::';
  if (!storedString || typeof storedString !== 'string') return '';
  return storedString.split(DATA_SEPARATOR)[0];
};

const MenuStockAvailability = ({ stall }) => {
  const { stocks = [], menuName = [], menuRecipes = [] } = stall || {};

  // useMemo will re-calculate only when stall data changes, improving performance
  const menuAvailability = useMemo(() => {
    if (!stocks.length || !menuName.length || !menuRecipes.length) {
      return [];
    }

    // 1. Aggregate total stock for each ingredient in base units
    const aggregatedStock = {};
    stocks.forEach((str) => {
      const parts = str.split('|');
      if (parts.length < 3) return;
      const rawIngredient = parts[1];
      const quantityStr = parts[2];

      const ingredientName = parseIngredientName(rawIngredient).trim();
      const [amountStr, unit] = quantityStr?.split(' ') ?? ['0', ''];
      const amount = parseFloat(amountStr);

      if (ingredientName && !isNaN(amount)) {
        const { amount: baseAmount, unit: baseUnit } = convertToBaseUnit(amount, unit);
        if (aggregatedStock[ingredientName]) {
          // Note: This assumes units are consistent after conversion
          aggregatedStock[ingredientName].amount += baseAmount;
        } else {
          aggregatedStock[ingredientName] = { amount: baseAmount, unit: baseUnit };
        }
      }
    });

    // 2. Calculate how many of each menu item can be made
    return menuName.map((name, index) => {
      const recipeString = menuRecipes[index];
      if (!recipeString) {
        return { name, canMake: 0, bottleneck: 'No recipe defined' };
      }

      const requiredIngredients = recipeString.split(',').map((part) => {
        const [ingName, ingQuantity] = part.split('|');
        const [ingAmount, ingUnit] = ingQuantity?.trim().split(' ') ?? ['0', ''];
        return {
          name: ingName.trim(),
          ...convertToBaseUnit(parseFloat(ingAmount), ingUnit),
        };
      });

      let canMake = Infinity;
      let bottleneck = 'Not enough ingredients';

      if (requiredIngredients.length === 0 || !requiredIngredients[0].name) {
          return { name, canMake: 0, bottleneck: 'Invalid recipe' };
      }

      requiredIngredients.forEach((req) => {
        const stock = aggregatedStock[req.name];
        if (!stock || stock.amount === 0 || stock.unit !== req.unit) {
          canMake = 0;
          bottleneck = req.name;
          return; // Exit early if an ingredient is missing or units mismatch
        }

        const potential = Math.floor(stock.amount / req.amount);
        if (potential < canMake) {
          canMake = potential;
          bottleneck = req.name;
        }
      });
      
      if (canMake === Infinity) canMake = 0; // Handle cases with empty recipes

      return { name, canMake, bottleneck };
    });
  }, [stocks, menuName, menuRecipes]);

  if (menuAvailability.length === 0) {
    return (
      <div className="bg-neutral-900 rounded-xl p-6 mt-8">
        <h3 className="text-pink-500 font-semibold mb-2">Menu Production Capacity</h3>
        <p className="text-neutral-400">
          No menu items or recipes defined. Add them in your stall settings to see production estimates.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-neutral-900 rounded-xl p-6 mt-8">
      <h3 className="text-pink-500 font-semibold mb-4 flex items-center">
        <FaBalanceScale className="mr-3" />
        Menu Production Capacity
      </h3>
      <p className="text-sm text-neutral-400 mb-6">
        Estimated quantity of each menu item you can produce with your current inventory.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {menuAvailability.map(({ name, canMake, bottleneck }) => {
          let statusColor = 'text-green-400';
          let bgColor = 'bg-green-500/10';
          let icon = <FaCheckCircle />;

          if (canMake === 0) {
            statusColor = 'text-red-400';
            bgColor = 'bg-red-500/10';
            icon = <FaExclamationTriangle />;
          } else if (canMake <= 10) { // Example threshold for "low stock"
            statusColor = 'text-yellow-400';
            bgColor = 'bg-yellow-500/10';
            icon = <FaExclamationTriangle />;
          }

          return (
            <div
              key={name}
              className={`p-4 rounded-lg border border-neutral-700 ${bgColor} flex flex-col justify-between`}
            >
              <div>
                <p className="font-bold text-neutral-200 text-lg">{name}</p>
                <div className={`flex items-center text-sm font-semibold mt-2 ${statusColor}`}>
                  {icon}
                  <span className="ml-2">
                    {canMake > 0 ? `Can make ~${canMake}` : 'Out of Stock'}
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-neutral-700 text-xs text-neutral-400">
                <p>
                  <span className="font-semibold">Limiting Ingredient:</span> {bottleneck}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MenuStockAvailability;
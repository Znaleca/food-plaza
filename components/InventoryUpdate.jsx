'use client';

import { useState } from 'react';
import { parseISO, isBefore, differenceInDays } from 'date-fns';

const InventoryUpdate = ({ stocks = [], onUpdate }) => {
  const initialData = (stocks || []).reduce((acc, str) => {
    const [group, ingredient, quantityStr, batchDate, expiryDate] = str.split('|');
    const [amountStr, unit = 'pcs'] = quantityStr?.split(' ') ?? ['0', 'pcs'];
    const hasExpiry = expiryDate !== 'no expiration';
    const today = new Date();

    let isExpired = false;
    let isNearExpiry = false;
    let daysLeft = null;

    if (hasExpiry && expiryDate) {
      const parsedExpiry = parseISO(expiryDate);
      isExpired = isBefore(parsedExpiry, today);
      if (!isExpired) {
        daysLeft = differenceInDays(parsedExpiry, today);
        isNearExpiry = daysLeft <= 7;
      }
    }

    const item = {
      ingredient,
      unit,
      amount: parseFloat(amountStr || 0),
      batchDate: hasExpiry ? batchDate : null,
      expiryDate: hasExpiry ? expiryDate : 'no expiration',
      hasExpiry,
      isExpired,
      isNearExpiry,
      daysLeft,
      inputAmount: 1,
    };

    const existing = acc.find((pkg) => pkg.packageName === group);
    if (existing) {
      existing.items.push(item);
    } else {
      acc.push({ packageName: group, items: [item] });
    }
    return acc;
  }, []);

  const [inventory, setInventory] = useState(initialData);

  const updateStock = (packageName, ingredientName, delta) => {
    setInventory((prev) =>
      prev.map((pkg) =>
        pkg.packageName === packageName
          ? {
              ...pkg,
              items: pkg.items.map((item) =>
                item.ingredient === ingredientName
                  ? { ...item, amount: Math.max(0, item.amount + delta), inputAmount: 1 }
                  : item
              ),
            }
          : pkg
      )
    );

    if (onUpdate) {
      const flat = inventory.flatMap((pkg) =>
        pkg.items.map((item) =>
          pkg.packageName === packageName && item.ingredient === ingredientName
            ? { ...item, amount: Math.max(0, item.amount + delta) }
            : item
        )
      );
      onUpdate(flat);
    }
  };

  const handleInputChange = (packageName, ingredientName, value) => {
    setInventory((prev) =>
      prev.map((pkg) =>
        pkg.packageName === packageName
          ? {
              ...pkg,
              items: pkg.items.map((item) =>
                item.ingredient === ingredientName
                  ? { ...item, inputAmount: parseFloat(value) || 1 }
                  : item
              ),
            }
          : pkg
      )
    );
  };

  const getExpiryColor = (item) => {
    if (item.isExpired) return 'text-red-400';
    if (item.isNearExpiry) return 'text-yellow-400';
    return 'text-green-400';
  };

  const isLowStock = (item) => item.amount <= 5;

  return (
    <div className="space-y-6 mt-6">
      {inventory.map((pkg) => (
        <div
          key={pkg.packageName}
          className="bg-neutral-900 rounded-xl shadow-lg border border-neutral-800 overflow-hidden"
        >
          <div className="bg-neutral-800 py-4 px-6">
            <h3 className="text-pink-500 font-semibold">{pkg.packageName}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-neutral-800/60 text-neutral-300">
                  <th className="px-5 py-3 text-left font-normal">Ingredient</th>
                  <th className="px-5 py-3 text-left font-normal">Quantity</th>
                  <th className="px-5 py-3 text-left font-normal">Batch</th>
                  <th className="px-5 py-3 text-left font-normal">Expiry</th>
                  <th className="px-5 py-3 text-center font-normal">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pkg.items.map((item) => {
                  let rowClass = '';
                  const isItemExpired = item.isExpired;
                  if (isItemExpired) rowClass = 'bg-red-900/50';
                  else if (item.isNearExpiry) rowClass = 'bg-yellow-900/20';
                  else if (isLowStock(item)) rowClass = 'bg-pink-900/20';

                  return (
                    <tr
                      key={item.ingredient}
                      className={`border-t border-neutral-700 hover:bg-neutral-800/50 transition-colors ${rowClass}`}
                    >
                      <td
                        className={`px-5 py-3 font-medium ${getExpiryColor(item)} ${
                          isItemExpired ? '' : 'line-through'
                        }`}
                      >
                        {item.ingredient}
                      </td>
                      <td className={`px-5 py-3 ${getExpiryColor(item)}`}>
                        {item.amount} {item.unit}
                      </td>
                      <td className={`px-5 py-3 ${getExpiryColor(item)}`}>
                        {item.batchDate || 'N/A'}
                      </td>
                      <td className={`px-5 py-3 ${getExpiryColor(item)}`}>
                        {item.expiryDate}
                        {item.isNearExpiry && item.daysLeft !== null && (
                          <span className="ml-2 text-sm">({item.daysLeft} days left)</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <div className="flex items-center justify-center gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={item.inputAmount}
                              onChange={(e) =>
                                !isItemExpired && handleInputChange(pkg.packageName, item.ingredient, e.target.value)
                              }
                              disabled={isItemExpired}
                              className={`w-16 text-sm px-2 py-1 rounded-md border border-neutral-700 bg-neutral-800 text-neutral-200 ${isItemExpired && 'bg-neutral-600'}`}
                            />
                            <button
                              onClick={() =>
                                !isItemExpired && updateStock(pkg.packageName, item.ingredient, item.inputAmount)
                              }
                              disabled={isItemExpired}
                              className={`px-3 py-1 bg-green-500 hover:bg-green-600 rounded-md text-white text-sm transition-colors ${isItemExpired && 'bg-neutral-600'}`}
                            >
                              Add
                            </button>
                            <button
                              onClick={() =>
                                !isItemExpired && updateStock(pkg.packageName, item.ingredient, -item.inputAmount)
                              }
                              disabled={isItemExpired}
                              className={`px-3 py-1 bg-red-500 hover:bg-red-600 rounded-md text-white text-sm transition-colors ${isItemExpired && 'bg-neutral-600'}`}
                            >
                              Subtract
                            </button>
                          </div>
                          <div className="flex items-center gap-1 flex-wrap">
                            {[1, 5, 10].map((val) => (
                              <button
                                key={`add-${val}`}
                                onClick={() =>
                                  !isItemExpired && updateStock(pkg.packageName, item.ingredient, val)
                                }
                                disabled={isItemExpired}
                                className={`px-2 py-1 bg-green-500 hover:bg-green-600 rounded-md text-white text-xs transition-colors ${isItemExpired && 'bg-neutral-600'}`}
                              >
                                +{val}
                              </button>
                            ))}
                            {[1, 5, 10].map((val) => (
                              <button
                                key={`sub-${val}`}
                                onClick={() =>
                                  !isItemExpired && updateStock(pkg.packageName, item.ingredient, -val)
                                }
                                disabled={isItemExpired}
                                className={`px-2 py-1 bg-red-500 hover:bg-red-600 rounded-md text-white text-xs transition-colors ${isItemExpired && 'bg-neutral-600'}`}
                              >
                                -{val}
                              </button>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

export default InventoryUpdate;

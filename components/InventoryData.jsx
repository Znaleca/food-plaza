'use client';

import { parseISO, isBefore, differenceInDays } from 'date-fns';

const InventoryData = ({ stocks = [] }) => {
  // Transform incoming stock strings
  const inventoryData = (stocks || []).map((str) => {
    const [group, ingredient, quantityStr, batchDate, expiryDate] = str.split('|');
    const [amountStr, unit = 'pcs'] = quantityStr?.split(' ') ?? ['0', 'pcs'];
    const hasExpiry = expiryDate !== 'no expiration';
    const today = new Date();

    let isExpired = false;
    let isNearExpiry = false;

    if (hasExpiry && expiryDate) {
      const parsedDate = parseISO(expiryDate);
      isExpired = isBefore(parsedDate, today);
      if (!isExpired) {
        const daysLeft = differenceInDays(parsedDate, today);
        isNearExpiry = daysLeft <= 7;
      }
    }

    return {
      group,
      ingredient,
      unit,
      amount: parseFloat(amountStr || 0),
      batchDate: hasExpiry ? batchDate : null,
      expiryDate: hasExpiry ? expiryDate : 'no expiration',
      hasExpiry,
      isExpired,
      isNearExpiry,
    };
  });

  // Grouping by group and ingredient
  const groupedInventoryMap = {};
  inventoryData.forEach((item) => {
    if (!groupedInventoryMap[item.group]) {
      groupedInventoryMap[item.group] = {};
    }
    if (!groupedInventoryMap[item.group][item.ingredient]) {
      groupedInventoryMap[item.group][item.ingredient] = {
        amount: 0,
        unit: item.unit,
        batchDate: item.batchDate,
        expiryDate: item.expiryDate,
        hasExpiry: item.hasExpiry,
        isExpired: item.isExpired,
        isNearExpiry: item.isNearExpiry,
      };
    }
    groupedInventoryMap[item.group][item.ingredient].amount += item.amount;
  });

  if (Object.keys(groupedInventoryMap).length === 0) return null;

  return (
    <div className="mt-6 space-y-10">
      {Object.entries(groupedInventoryMap).map(([group, ingredients]) => (
        <div
          key={group}
          className="bg-neutral-900/80 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-neutral-800"
        >
          <h4 className="text-xl font-semibold text-pink-400 mb-4">{group}</h4>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-neutral-800/60 text-neutral-300">
                  <th className="px-4 py-2 text-left rounded-tl-lg">Ingredient</th>
                  <th className="px-4 py-2 text-left">Quantity</th>
                  <th className="px-4 py-2 text-left">Batch</th>
                  <th className="px-4 py-2 text-left">Expiry</th>
                  <th className="px-4 py-2 text-left rounded-tr-lg">Status</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(ingredients).map(([ingredient, data], idx) => {
                  let status = 'Fresh';
                  let statusClass = 'text-green-400';
                  if (data.isExpired) {
                    status = 'Expired';
                    statusClass = 'text-red-400 line-through';
                  } else if (data.isNearExpiry) {
                    status = 'Near Expiry';
                    statusClass = 'text-yellow-400';
                  }

                  return (
                    <tr
                      key={ingredient}
                      className={`border-t border-neutral-700 hover:bg-neutral-800/50 transition-colors`}
                    >
                      <td className="px-4 py-2 font-medium text-neutral-200">{ingredient}</td>
                      <td className="px-4 py-2 text-neutral-300">
                        {data.amount} {data.unit}
                      </td>
                      <td className="px-4 py-2 text-neutral-400">{data.batchDate || 'N/A'}</td>
                      <td className="px-4 py-2 text-neutral-400">{data.expiryDate}</td>
                      <td className={`px-4 py-2 font-semibold ${statusClass}`}>{status}</td>
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

export default InventoryData;

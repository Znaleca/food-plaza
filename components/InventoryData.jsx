// InventoryData.jsx

'use client';

import { parseISO, isBefore, differenceInDays } from 'date-fns';

// Helper component for styled status badges (Keep existing logic)
const StatusBadge = ({ status, className = '' }) => {
  let colorClass = '';
  switch (status) {
    case 'Expired':
      colorClass = 'bg-red-700/40 text-red-300 border-red-500/60';
      break;
    case 'Near Expiry':
      colorClass = 'bg-orange-700/40 text-orange-300 border-orange-500/60';
      break;
    case 'Fresh':
    default:
      colorClass = 'bg-teal-700/40 text-teal-300 border-teal-500/60';
      break;
  }

  return (
    <span
      className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border tracking-wide ${colorClass} ${className}`}
    >
      {status}
    </span>
  );
};


const InventoryData = ({ stocks = [] }) => {
  // --- Data Processing & Grouping (Keep existing logic) ---
  const inventoryData = (stocks || []).map((str) => {
    const [group, ingredientCell, quantityStr, batchDate, expiryDate] = str.split('|');
    const [amountStr, unit = 'pcs'] = quantityStr?.split(' ') ?? ['0', 'pcs'];
    
    const parts = ingredientCell.split('::');
    const ingredient = parts[0].trim();
    const recipes = parts.length > 1 ? parts[1].split(',').map(r => r.trim()) : [];
    
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
      recipes,
      unit,
      amount: parseFloat(amountStr || 0),
      batchDate: hasExpiry ? batchDate : null,
      expiryDate: hasExpiry ? expiryDate : 'no expiration',
      hasExpiry,
      isExpired,
      isNearExpiry,
    };
  });

  const groupedInventoryMap = {};
  inventoryData.forEach((item) => {
    if (!groupedInventoryMap[item.group]) {
      groupedInventoryMap[item.group] = {};
    }

    const key = item.ingredient;

    if (!groupedInventoryMap[item.group][key]) {
      groupedInventoryMap[item.group][key] = {
        amount: 0,
        unit: item.unit,
        ingredient: item.ingredient,
        recipes: item.recipes,
        isExpired: item.isExpired,
        isNearExpiry: item.isNearExpiry,
        batchDate: item.batchDate,
        expiryDate: item.expiryDate,
        hasExpiry: item.hasExpiry,
      };
    }
    groupedInventoryMap[item.group][key].amount += item.amount;
  });

  if (Object.keys(groupedInventoryMap).length === 0) return null;

  return (
    <div className="mt-8 sm:mt-10 space-y-8 sm:space-y-10">
      {Object.entries(groupedInventoryMap).map(([group, ingredients]) => (
        <div
          key={group}
          className="bg-neutral-800/40 p-4 sm:p-7 rounded-2xl sm:rounded-3xl shadow-lg border border-neutral-700/70"
        >
          <h4 className="text-xl sm:text-2xl font-light text-pink-300 mb-4 sm:mb-6 border-b border-pink-300/30 pb-2 sm:pb-3">{group}</h4>

          {/* --- 1. Traditional Table View (Visible on MD screens and up) ---
          */}
          <div className="overflow-x-auto **hidden md:block**">
            <table className="min-w-full divide-y divide-neutral-700/50 text-sm">
              <thead className="text-neutral-300 bg-neutral-800/70 rounded-lg">
                <tr>
                  <th className="px-5 py-3 text-left font-bold uppercase tracking-wider">Ingredient & Recipes</th>
                  <th className="px-5 py-3 text-left font-bold uppercase tracking-wider w-32">Quantity</th>
                  <th className="px-5 py-3 text-left font-bold uppercase tracking-wider w-32">Batch</th>
                  <th className="px-5 py-3 text-left font-bold uppercase tracking-wider w-32">Expiry</th>
                  <th className="px-5 py-3 text-left font-bold uppercase tracking-wider w-32">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/50">
                {Object.entries(ingredients).map(([ingredientKey, data]) => {
                  let status = 'Fresh';
                  let rowClass = 'hover:bg-neutral-800/60';

                  if (data.isExpired) {
                    status = 'Expired';
                    rowClass = 'bg-red-900/10 hover:bg-red-900/20';
                  } else if (data.isNearExpiry) {
                    status = 'Near Expiry';
                    rowClass = 'bg-orange-900/10 hover:bg-orange-900/20';
                  }

                  return (
                    <tr
                      key={ingredientKey}
                      className={`transition-colors duration-200 ${rowClass}`}
                    >
                      {/* Ingredient & Recipes Cell */}
                      <td className="px-5 py-4 align-top">
                        <div className="font-semibold text-neutral-100 mb-1">{data.ingredient}</div>
                        {data.recipes && data.recipes.length > 0 && (
                          <ul className="text-neutral-400 text-xs list-disc pl-5 mt-1 space-y-0.5">
                            {data.recipes.map((recipe, index) => (
                              <li key={index} className="truncate">{recipe}</li>
                            ))}
                          </ul>
                        )}
                      </td>
                      
                      {/* Quantity Cell */}
                      <td className="px-5 py-4 align-top font-mono text-neutral-200 text-base font-medium">
                        {data.amount} <span className="text-neutral-400 font-normal">{data.unit}</span>
                      </td>
                      
                      {/* Batch & Expiry Date Cells */}
                      <td className="px-5 py-4 align-top text-neutral-400 font-mono text-xs">{data.batchDate || 'N/A'}</td>
                      <td className="px-5 py-4 align-top text-neutral-400 font-mono text-xs">{data.expiryDate}</td>
                      
                      {/* Status Badge Cell */}
                      <td className="px-5 py-4 align-top">
                        <StatusBadge status={status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* --- 2. Mobile Card View (Visible on screens smaller than MD) ---
          */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {Object.entries(ingredients).map(([ingredientKey, data]) => {
              let status = 'Fresh';
              let cardClass = 'border-neutral-700 hover:border-pink-500/50';

              if (data.isExpired) {
                status = 'Expired';
                cardClass = 'border-red-600/50 bg-red-900/10 hover:border-red-500/80';
              } else if (data.isNearExpiry) {
                status = 'Near Expiry';
                cardClass = 'border-orange-600/50 bg-orange-900/10 hover:border-orange-500/80';
              }

              return (
                <div 
                  key={ingredientKey}
                  className={`p-4 rounded-lg border-l-4 shadow-md transition-all ${cardClass}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-bold text-lg text-neutral-50">{data.ingredient}</div>
                    <StatusBadge status={status} />
                  </div>

                  <div className="flex justify-between items-baseline text-sm mb-3 border-b border-neutral-700/50 pb-2">
                    <span className="text-pink-400 font-medium">Stock:</span>
                    <span className="font-mono text-neutral-200">{data.amount} {data.unit}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-neutral-400 mb-3">
                    <div className="flex justify-between">
                      <span className="font-medium">Batch:</span>
                      <span className="font-mono">{data.batchDate || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Expiry:</span>
                      <span className="font-mono">{data.expiryDate}</span>
                    </div>
                  </div>

                  {data.recipes && data.recipes.length > 0 && (
                    <>
                      <p className="text-pink-500 font-medium text-xs uppercase mt-2 mb-1">Used In:</p>
                      <ul className="text-neutral-400 text-xs list-disc pl-5 space-y-0.5 max-h-16 overflow-hidden">
                        {data.recipes.map((recipe, index) => (
                          <li key={index}>{recipe}</li>
                        ))}
                        {data.recipes.length > 3 && (
                            <li className="text-neutral-500/80">...and {data.recipes.length - 3} more</li>
                        )}
                      </ul>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default InventoryData;
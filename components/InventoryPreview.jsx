'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

const InventoryPreview = ({ stocks = [] }) => {
  const inventoryData = (stocks || []).map((str) => {
    const [group, ingredient, quantityStr] = str.split('|');
    const [amountStr, unit = 'pcs'] = quantityStr?.split(' ') ?? ['0', 'pcs'];
    return {
      group,
      ingredient,
      unit,
      amount: parseFloat(amountStr || 0),
    };
  });

  const groupedInventoryMap = {};

  inventoryData.forEach((item) => {
    if (!groupedInventoryMap[item.group]) {
      groupedInventoryMap[item.group] = {};
    }
    if (!groupedInventoryMap[item.group][item.ingredient]) {
      groupedInventoryMap[item.group][item.ingredient] = {
        amount: 0,
        unit: item.unit,
      };
    }
    groupedInventoryMap[item.group][item.ingredient].amount += item.amount;
  });

  const groupedInventory = Object.entries(groupedInventoryMap).map(([groupName, ingredients]) => {
    const entry = { name: groupName };
    for (const [ingredient, data] of Object.entries(ingredients)) {
      entry[ingredient] = data.amount;
    }
    return entry;
  });

  const allIngredients = Array.from(new Set(inventoryData.map((item) => item.ingredient)));

  const ingredientColors = ['#FACC15', '#3B82F6', '#EC4899', '#EF4444'];

  if (groupedInventory.length === 0) return null;

  return (
    <div className="bg-neutral-900 rounded-xl p-6 mt-6">
      <h3 className="text-pink-500 font-semibold mb-4">Inventory Stock Levels</h3>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={groupedInventory}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            tick={{ fill: '#ffffff' }}
            interval={0}
            angle={-30}
            textAnchor="end"
            height={100}
          />
          <YAxis tick={{ fill: '#ffffff' }} />
          <Tooltip contentStyle={{ backgroundColor: '#333', borderRadius: '8px' }} />
          <Legend />
          {allIngredients.map((ingredient, idx) => (
            <Bar
              key={ingredient}
              dataKey={ingredient}
              stackId="a"
              fill={ingredientColors[idx % ingredientColors.length]}
              name={ingredient}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-6 space-y-4">
        {Object.entries(groupedInventoryMap).map(([group, ingredients]) => (
          <div key={group} className="bg-neutral-800 p-4 rounded-lg shadow-md">
            <h4 className="text-pink-400 font-semibold">{group}</h4>
            <ul className="text-sm text-neutral-300 mt-2 list-disc list-inside">
              {Object.entries(ingredients).map(([ingredient, data]) => (
                <li key={ingredient}>
                  {ingredient}: {data.amount} {data.unit}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InventoryPreview;

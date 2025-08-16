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
import { parseISO, isBefore } from 'date-fns';

import InventoryData from './InventoryData';

const InventoryPreview = ({ stocks = [] }) => {
  const inventoryData = (stocks || []).map((str) => {
    const [group, ingredient, quantityStr, batchDate, expiryDate] = str.split('|');
    const [amountStr, unit = 'pcs'] = quantityStr?.split(' ') ?? ['0', 'pcs'];
    const hasExpiry = expiryDate !== 'no expiration';
    const isExpired =
      hasExpiry && expiryDate && isBefore(parseISO(expiryDate), new Date());

    return {
      group,
      ingredient,
      unit,
      amount: parseFloat(amountStr || 0),
      batchDate: hasExpiry ? batchDate : null,
      expiryDate: hasExpiry ? expiryDate : 'no expiration',
      hasExpiry,
      isExpired,
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
        batchDate: item.batchDate,
        expiryDate: item.expiryDate,
        hasExpiry: item.hasExpiry,
        isExpired: item.isExpired,
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

  const ingredientColors = ['#FACC15', '#3B82F6', '#EC4899', '#EF4444', '#10B981', '#8B5CF6'];

  if (groupedInventory.length === 0) return null;

  return (
    <div className="bg-neutral-900 rounded-xl p-6 mt-6">
      <h3 className="text-pink-500 font-semibold mb-4">Inventory Stock Levels</h3>

      {/* Chart Section */}
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
          <Tooltip contentStyle={{ backgroundColor: '#222', borderRadius: '8px', color: '#fff' }} />
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

      {/* Detailed Inventory List from InventoryData */}
      <InventoryData stocks={stocks} />
    </div>
  );
};

export default InventoryPreview;

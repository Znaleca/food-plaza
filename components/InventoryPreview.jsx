// InventoryPreview.jsx

'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { parseISO, isBefore } from 'date-fns';

import InventoryData from './InventoryData';

// Custom Tooltip component (No changes needed, it's already well-styled)
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const { totalAmount, unit, recipes } = data;
    
    // Improved Tooltip Styling
    return (
      <div className="bg-neutral-950/95 p-4 rounded-xl border border-pink-500/50 shadow-2xl text-sm max-w-xs transition-shadow">
        <p className="text-pink-300 font-bold text-lg mb-2 border-b border-neutral-700 pb-1">{`${label}`}</p>
        <p className="text-neutral-200 text-base mb-3">{`Total Stock: ${totalAmount} ${unit}`}</p>
        
        {/* Bulleted list of connected recipes */}
        {recipes && recipes.length > 0 && (
          <>
            <p className="text-pink-500 font-semibold text-xs uppercase tracking-wider mb-2">Used In Recipes:</p>
            <ul className="text-neutral-400 text-xs list-disc pl-4 space-y-1">
              {recipes.map((recipe, index) => (
                <li key={index} className="truncate hover:text-neutral-200 transition-colors">{recipe}</li>
              ))}
            </ul>
          </>
        )}
      </div>
    );
  }

  return null;
};


const InventoryPreview = ({ stocks = [] }) => {
  // --- Data Processing (Keep existing logic) ---
  const processedInventory = (stocks || []).map((str) => {
    const [group, ingredientCell, quantityStr, batchDate, expiryDate] = str.split('|');
    const [amountStr, unit = 'pcs'] = quantityStr?.split(' ') ?? ['0', 'pcs'];
    
    const parts = ingredientCell.split('::');
    const ingredient = parts[0].trim();
    const recipes = parts.length > 1 ? parts[1].split(',').map(r => r.trim()) : [];
    
    const hasExpiry = expiryDate !== 'no expiration';

    return {
      group,
      ingredient,
      recipes,
      unit,
      amount: parseFloat(amountStr || 0),
      batchDate: hasExpiry ? batchDate : null,
      expiryDate: hasExpiry ? expiryDate : 'no expiration',
      hasExpiry,
      isExpired: hasExpiry && expiryDate ? isBefore(parseISO(expiryDate), new Date()) : false,
    };
  });

  // --- Chart Data: Total Quantity per Ingredient (Keep existing logic) ---
  const totalIngredientMap = {};
  processedInventory.forEach((item) => {
    if (!totalIngredientMap[item.ingredient]) {
      totalIngredientMap[item.ingredient] = {
        name: item.ingredient,
        totalAmount: 0,
        unit: item.unit,
        recipes: new Set(),
      };
    }
    totalIngredientMap[item.ingredient].totalAmount += item.amount;
    
    item.recipes.forEach(recipe => totalIngredientMap[item.ingredient].recipes.add(recipe));
  });

  const chartData = Object.values(totalIngredientMap)
    .map(item => ({
      ...item,
      recipes: Array.from(item.recipes),
    }))
    .sort((a, b) => b.totalAmount - a.totalAmount);


  if (chartData.length === 0) return (
    <div className="bg-neutral-900 rounded-xl p-6 mt-6 text-neutral-400 text-center">
      <p>No inventory data available to display.</p>
    </div>
  );

  return (
    // Adjusted padding for better mobile fit: p-8 -> p-4 sm:p-8
    <div className="bg-neutral-900 rounded-2xl p-4 sm:p-8 mt-4 sm:mt-8 shadow-inner shadow-neutral-800/50">
      <h3 className="text-xl sm:text-2xl font-semibold text-pink-400 mb-4 sm:mb-6 border-b border-neutral-700/50 pb-2 sm:pb-3">
        Total Ingredient Stock Levels
      </h3>

      {/* Chart Section */}
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="colorStock" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ec4899" stopOpacity={0.9}/>
              <stop offset="95%" stopColor="#ec4899" stopOpacity={0.4}/>
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
          
          <XAxis
            dataKey="name"
            tick={{ fill: '#999', fontSize: 10 }} // Smaller font for mobile
            // Use a higher angle for better label spacing on smaller screens
            angle={-45} 
            textAnchor="end"
            height={100}
            stroke="#444"
            tickLine={false}
          />
          
          <YAxis 
            tick={{ fill: '#999', fontSize: 11 }} 
            stroke="#444" 
            axisLine={false}
            tickLine={false}
          />
          
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1f1f1f', opacity: 0.8 }}/>
          
          <Bar
            dataKey="totalAmount"
            fill="url(#colorStock)"
            name="Total Stock"
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>

      {/* Detailed Inventory List from InventoryData */}
      <InventoryData stocks={stocks} />
    </div>
  );
};

export default InventoryPreview;
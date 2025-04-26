import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts';

const COLORS = [
  '#f59e0b', // amber-500 (cheese/sauce)
  '#ef4444', // red-500 (meat/spice)
  '#10b981', // emerald-500 (veggies)
  '#3b82f6', // blue-500 (drink/soda)
  '#e879f9', // pink-400 (desserts)
  '#8b5cf6', // violet-500 (snacks)
  '#f97316', // orange-500 (fries/chips)
];

const StocksChart = ({ data }) => {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
      <h2 className="text-2xl font-bold text-center text-green-800 mb-6">
        Food Inventory
      </h2>

      <ResponsiveContainer width="100%" height={70 * data.length}>
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 20, right: 80, left: 100, bottom: 20 }}
          barCategoryGap={16}
        >
          <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" />
          <XAxis type="number" allowDecimals={false} tick={{ fontSize: 14 }} />
          <YAxis
            dataKey="name"
            type="category"
            width={140}
            tick={{ fontWeight: '600', fontSize: 15, fill: '#374151' }}
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#fff', borderRadius: '10px', borderColor: '#d1d5db' }}
            labelStyle={{ fontWeight: 'bold', color: '#111827' }}
          />
          <Bar dataKey="quantity" radius={[10, 10, 10, 10]}>
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
            <LabelList dataKey="quantity" position="right" fill="#374151" fontSize={14} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StocksChart;

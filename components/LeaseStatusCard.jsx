'use client';

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#22c55e', '#ef4444', '#facc15']; // green, red, yellow

const LeaseStatusCard = ({ bookings }) => {
  if (!bookings || bookings.length === 0) return null;

  const bookingStatusData = [
    { name: 'Approved', value: bookings.filter(b => b.status === 'approved').length },
    { name: 'Declined', value: bookings.filter(b => b.status === 'declined').length },
    { name: 'Pending', value: bookings.filter(b => b.status === 'pending').length },
  ];

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mt-4 max-w-md mx-auto">
      <h2 className="text-xl font-semibold text-center text-gray-700 mb-4">Reservation Status Overview</h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={bookingStatusData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) =>
              `${name} (${(percent * 100).toFixed(0)}%)`
            }
          >
            {bookingStatusData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LeaseStatusCard;

'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line,
} from 'recharts';
import getSales from '@/app/actions/getSales';

// Utility to get day name from Date object
const getDayName = (date) => ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][date.getDay()];

// Aggregate sales by day of week (Mon-Sun)
const aggregateByDay = (orders, roomName) => {
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const dayMap = days.reduce((acc, day) => ({ ...acc, [day]: 0 }), {});

  orders.forEach(order => {
    (order.items || []).forEach(itemString => {
      try {
        const item = JSON.parse(itemString);
        if (item.room_name !== roomName) return;

        const dayName = getDayName(new Date(order.created_at));
        const dayKey = dayName === 'Sun' ? 'Sun' : dayName;
        dayMap[dayKey] += Number(item.quantity || 1);
      } catch { /* ignore malformed items */ }
    });
  });

  return days.map(day => ({ day, sales: dayMap[day] || 0 }));
};

// Aggregate sales by ISO week number
const aggregateByWeek = (orders, roomName) => {
  const weekMap = {};

  const getWeekNumber = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  };

  orders.forEach(order => {
    (order.items || []).forEach(itemString => {
      try {
        const item = JSON.parse(itemString);
        if (item.room_name !== roomName) return;

        const weekNum = getWeekNumber(new Date(order.created_at));
        weekMap[weekNum] = (weekMap[weekNum] || 0) + Number(item.quantity || 1);
      } catch { }
    });
  });

  return Object.entries(weekMap)
    .sort((a, b) => a[0] - b[0])
    .map(([week, sales]) => ({ week: `Week ${week}`, sales }));
};

// Aggregate sales by month (Jan-Dec)
const aggregateByMonth = (orders, roomName) => {
  const monthMap = {};

  orders.forEach(order => {
    (order.items || []).forEach(itemString => {
      try {
        const item = JSON.parse(itemString);
        if (item.room_name !== roomName) return;

        const date = new Date(order.created_at);
        const month = date.toLocaleString('default', { month: 'short' });
        monthMap[month] = (monthMap[month] || 0) + Number(item.quantity || 1);
      } catch { }
    });
  });

  const monthsOrder = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  return monthsOrder
    .filter(m => monthMap[m])
    .map(m => ({ month: m, sales: monthMap[m] }));
};

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center text-white">
    <svg className="animate-spin h-10 w-10 text-pink-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
    </svg>
  </div>
);

const SalesCard = ({ roomName }) => {
  const [orders, setOrders] = useState([]);
  const [timeRange, setTimeRange] = useState('day');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!roomName) return;

    const loadSales = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getSales();
        setOrders(res.orders || []);
      } catch (err) {
        console.error('Failed to fetch sales data:', err);
        setError('Failed to load sales data.');
      } finally {
        setLoading(false);
      }
    };

    loadSales();
  }, [roomName]);

  const salesData = useMemo(() => {
    if (!orders.length) return [];

    if (timeRange === 'day') return aggregateByDay(orders, roomName);
    if (timeRange === 'week') return aggregateByWeek(orders, roomName);
    if (timeRange === 'month') return aggregateByMonth(orders, roomName);
    return [];
  }, [orders, timeRange, roomName]);

  if (loading) return <LoadingSpinner />;
  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-red-500 space-y-4">
      <p>{error}</p>
      <button
        onClick={() => {
          setError(null);
          setLoading(true);
          getSales().then(res => {
            setOrders(res.orders || []);
            setLoading(false);
          }).catch(() => {
            setError('Failed to load sales data.');
            setLoading(false);
          });
        }}
        className="px-4 py-2 bg-pink-600 rounded hover:bg-pink-700 text-white"
      >
        Retry
      </button>
    </div>
  );

  return (
    <div className="min-h-screen -mb-96 bg-neutral-900 text-white p-6">
      <div role="tablist" aria-label="Select time range" className="flex justify-center gap-4 mb-8">
        {['day','week','month'].map(range => (
          <button
            key={range}
            role="tab"
            aria-selected={timeRange === range}
            tabIndex={timeRange === range ? 0 : -1}
            onClick={() => setTimeRange(range)}
            className={`px-5 py-2 rounded-full font-semibold transition
              focus:outline-none focus:ring-2 focus:ring-pink-400
              ${timeRange === range
                ? 'bg-pink-500 text-white shadow-lg'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
          >
            {range.charAt(0).toUpperCase() + range.slice(1)}
          </button>
        ))}
      </div>

      <div className="bg-neutral-900 rounded-xl p-6">
        <ResponsiveContainer width="100%" height={300}>
          {(timeRange === 'day' || timeRange === 'week') ? (
            <BarChart data={salesData}>
              <XAxis
                dataKey={timeRange === 'day' ? 'day' : 'week'}
                stroke="#ccc"
                tick={{ fontSize: 12 }}
              />
              <YAxis stroke="#ccc" />
              <Tooltip
                formatter={(value) => [value, 'Sales']}
                labelFormatter={(label) => `${label}`}
                wrapperStyle={{ backgroundColor: '#222', borderRadius: 6 }}
              />
              <Bar dataKey="sales" fill="#FF69B4" radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : (
            <LineChart data={salesData}>
              <XAxis
                dataKey="month"
                stroke="#ccc"
                tick={{ fontSize: 12 }}
              />
              <YAxis stroke="#ccc" />
              <Tooltip
                formatter={(value) => [value, 'Sales']}
                wrapperStyle={{ backgroundColor: '#222', borderRadius: 6 }}
              />
              <Line type="monotone" dataKey="sales" stroke="#36A2EB" strokeWidth={2} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SalesCard;

'use client';

import { useEffect, useState } from 'react';
import getSales from '@/app/actions/getSales';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import { motion } from 'framer-motion';
import { FaUtensils } from 'react-icons/fa6';

const SalesCard = ({ roomName }) => {
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSales = async () => {
      try {
        const res = await getSales();
        const allOrders = res.orders || [];

        const stallSalesMap = {};

        allOrders.forEach((order) => {
          (order.items || []).forEach((itemString) => {
            try {
              const item = JSON.parse(itemString);
              const stallName = item.room_name || 'Unknown Stall';
              const quantity = Number(item.quantity || 1);
              const revenue = Number(item.menuPrice || 0) * quantity;

              if (stallName !== roomName) return;  // Filter by roomName (stall)

              if (!stallSalesMap[stallName]) {
                stallSalesMap[stallName] = {
                  stall: stallName,
                  itemsSold: 0,
                  totalRevenue: 0,
                  items: [],
                };
              }

              stallSalesMap[stallName].itemsSold += quantity;
              stallSalesMap[stallName].totalRevenue += revenue;

              // Track individual items and their sales
              const existingItem = stallSalesMap[stallName].items.find(i => i.menuName === item.menuName);
              if (existingItem) {
                existingItem.quantity += quantity;
                existingItem.totalRevenue += revenue;
              } else {
                stallSalesMap[stallName].items.push({
                  menuName: item.menuName,
                  menuImage: item.menuImage,
                  quantity,
                  totalRevenue: revenue,
                });
              }
            } catch (err) {
              console.warn('Invalid item format:', itemString);
            }
          });
        });

        const salesList = Object.values(stallSalesMap);
        salesList.sort((a, b) => b.totalRevenue - a.totalRevenue);
        setSalesData(salesList);
      } catch (err) {
        console.error('Failed to fetch sales data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSales();
  }, [roomName]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-indigo-600 text-transparent bg-clip-text mb-8 text-center"
        >
          Sales Overview for {roomName}
        </motion.h1>

        {loading ? (
          <p className="text-center text-gray-500 text-lg">Loading sales data...</p>
        ) : salesData.length === 0 ? (
          <p className="text-center text-gray-500 text-lg">No sales data available for this food stall.</p>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-white shadow-lg p-6 mb-12 rounded-xl"
            >
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
                  <XAxis dataKey="stall" tick={{ fontSize: 12, fill: '#444' }} />
                  <YAxis tick={{ fill: '#444' }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="totalRevenue" fill="#4F46E5" name="Total Revenue (₱)" />
                  <Bar dataKey="itemsSold" fill="#F59E0B" name="Items Sold" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    staggerChildren: 0.1,
                  },
                },
              }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {salesData.map((stall, index) => {
                // Find the highest and lowest selling items for the stall
                const highestSellingItem = stall.items.reduce((maxItem, item) => 
                  item.totalRevenue > maxItem.totalRevenue ? item : maxItem, stall.items[0]);

                const lowestSellingItem = stall.items.reduce((minItem, item) => 
                  item.totalRevenue < minItem.totalRevenue ? item : minItem, stall.items[0]);

                return (
                  <motion.div
                    key={index}
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      visible: { opacity: 1, y: 0 },
                    }}
                    className="bg-white p-5 rounded-xl shadow-md border border-gray-200 hover:shadow-xl transition"
                  >
                    <h2 className="text-lg font-semibold text-indigo-600 mb-1 flex items-center gap-2">
                      <FaUtensils className="text-black" />
                      {stall.stall}
                    </h2>

                    <p className="text-sm text-pink-600 mb-1">
                      Items Sold: <span className="font-semibold text-pink-500">{stall.itemsSold}</span>
                    </p>
                    <p className="text-sm text-blue-600">
                      Total Revenue: <span className="font-semibold text-indigo-600">
                        ₱{stall.totalRevenue.toFixed(2)}
                      </span>
                    </p>

                    <div className="mt-4">
                      <h3 className="font-semibold text-gray-800">Highest Selling Item</h3>
                      <div className="flex items-center mt-2">
                        {highestSellingItem.menuImage && (
                          <img
                            src={highestSellingItem.menuImage}
                            alt={highestSellingItem.menuName}
                            className="w-16 h-16 object-cover mr-4 rounded"
                          />
                        )}
                        <div>
                          <p className="text-sm text-gray-700">{highestSellingItem.menuName}</p>
                          <p className="text-sm text-yellow-500">
                            Total Revenue: ₱{highestSellingItem.totalRevenue.toFixed(2)}
                          </p>
                          <p className="text-sm text-yellow-500">
                            Quantity Sold: {highestSellingItem.quantity}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h3 className="font-semibold text-gray-800">Lowest Selling Item</h3>
                      <div className="flex items-center mt-2">
                        {lowestSellingItem.menuImage && (
                          <img
                            src={lowestSellingItem.menuImage}
                            alt={lowestSellingItem.menuName}
                            className="w-16 h-16 object-cover mr-4 rounded"
                          />
                        )}
                        <div>
                          <p className="text-sm text-gray-700">{lowestSellingItem.menuName}</p>
                          <p className="text-sm text-red-400">
                            Total Revenue: ₱{lowestSellingItem.totalRevenue.toFixed(2)}
                          </p>
                          <p className="text-sm text-red-400">
                            Quantity Sold: {lowestSellingItem.quantity}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default SalesCard;

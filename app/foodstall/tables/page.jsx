'use client';

import { useEffect, useState } from 'react';
import { FaUserCheck } from 'react-icons/fa';
import { FaUser } from 'react-icons/fa6';
import getAllOrders from '@/app/actions/getAllOrders';
import updateTableNumber from '@/app/actions/updateTableNumber';

const TableViewPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [usersInfo, setUsersInfo] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getAllOrders();
        setOrders(data.orders || []);
      } catch (err) {
        console.error('Error fetching tables:', err);
        setError('Failed to load tables');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const totalTables = 30;

  const occupiedMap = new Map();
  orders.forEach((order) => {
    if (Array.isArray(order.tableNumber)) {
      order.tableNumber.forEach((number) => {
        if (!occupiedMap.has(number)) {
          occupiedMap.set(number, []);
        }
        occupiedMap.get(number).push({
          user: order.name || 'Unknown',
          email: order.email || 'N/A',
          orderId: order.$id,
        });
      });
    }
  });

  const isOccupied = (tableNumber) => occupiedMap.has(tableNumber);

  const handleClick = (tableNumber) => {
    if (isOccupied(tableNumber)) {
      setSelectedTable(tableNumber);
      setUsersInfo(occupiedMap.get(tableNumber));
      setShowModal(true);
    }
  };

  const handleConfirmRemove = async () => {
    const selectedUsers = usersInfo.map((user) => user.orderId);
    const updatedOrders = orders.map((order) => {
      if (selectedUsers.includes(order.$id)) {
        const updatedTableNumbers = order.tableNumber.filter(
          (num) => num !== selectedTable
        );
        return { ...order, tableNumber: updatedTableNumbers };
      }
      return order;
    });

    setOrders(updatedOrders);
    setShowModal(false);
    setSelectedTable(null);

    try {
      await updateTableNumber(
        selectedUsers[0],
        updatedOrders.find((o) => o.$id === selectedUsers[0]).tableNumber || null
      );
    } catch (err) {
      console.error('Failed to update table:', err);
    }
  };

  return (
    <div className="bg-neutral-900 min-h-screen text-white p-6">
      {/* New Header Section */}
      <div className="text-center mb-10">
        <h2 className="text-lg sm:text-xl text-pink-600 font-light tracking-widest uppercase">Food Plaza</h2>
        <p className="mt-4 text-2xl sm:text-5xl font-extrabold text-white leading-tight">Table View</p>
      </div>

      {/* Table Grid */}
      <div className="max-w-6xl mx-auto bg-neutral-800 border border-neutral-700 rounded-xl p-8 shadow-lg">
        {loading ? (
          <p className="text-neutral-400 text-center">Loading...</p>
        ) : error ? (
          <p className="text-red-500 text-center">{error}</p>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-4">
            {Array.from({ length: totalTables }, (_, i) => {
              const tableNumber = i + 1;

              return (
                <div
                  key={tableNumber}
                  onClick={() => handleClick(tableNumber)}
                  className={`cursor-pointer flex flex-col items-center justify-center rounded-xl shadow-md p-3 aspect-square transition-transform duration-200 border-2
                    ${
                      isOccupied(tableNumber)
                        ? 'bg-pink-100 border-pink-600 hover:bg-pink-200 text-pink-900'
                        : 'bg-neutral-900 border-neutral-700 hover:bg-neutral-700'
                    }
                    hover:scale-105
                  `}
                >
                  <div className="text-lg font-bold">{`T${tableNumber}`}</div>
                  <div className="mt-2 text-2xl">
                    {isOccupied(tableNumber) ? (
                      <FaUserCheck className="text-pink-600" />
                    ) : (
                      <FaUser className="text-neutral-300" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center">
          <div className="bg-neutral-800 rounded-xl shadow-lg p-6 max-w-sm w-full text-center space-y-4 text-white">
            <h2 className="text-lg font-bold text-pink-500">
              Remove Table Assignment?
            </h2>
            <p className="text-sm text-neutral-300">
              Are you sure you want to remove table <strong>T{selectedTable}</strong> from the order?
            </p>
            <div className="mt-2 text-neutral-300">
              {usersInfo.length > 1 ? (
                <p className="font-semibold">Multiple users assigned to this table:</p>
              ) : (
                <p className="font-semibold">{usersInfo[0]?.user}</p>
              )}
              <ul className="text-sm text-neutral-400 space-y-1">
                {usersInfo.map((user, index) => (
                  <li key={index}>
                    {user.user} - {user.email}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-neutral-700 rounded-lg hover:bg-neutral-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRemove}
                className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition"
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableViewPage;

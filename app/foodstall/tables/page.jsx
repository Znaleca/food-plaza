'use client';

import { useEffect, useState } from 'react';
import { FaUserCheck } from 'react-icons/fa';
import getAllOrders from '@/app/actions/getAllOrders';
import updateTableNumber from '@/app/actions/updateTableNumber'; // Make sure the path is correct
import Heading from '@/components/Heading';
import { FaUser } from 'react-icons/fa6';

const TableViewPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [usersInfo, setUsersInfo] = useState([]); // Holds all users occupying the selected table

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
      setUsersInfo(occupiedMap.get(tableNumber)); // Get all user info for the modal
      setShowModal(true);
    }
  };

  const handleConfirmRemove = async () => {
    const selectedUsers = usersInfo.map(user => user.orderId);
    const updatedOrders = orders.map((order) => {
      if (selectedUsers.includes(order.$id)) {
        const updatedTableNumbers = order.tableNumber.filter((num) => num !== selectedTable);
        return { ...order, tableNumber: updatedTableNumbers };
      }
      return order;
    });

    setOrders(updatedOrders);
    setShowModal(false);
    setSelectedTable(null);

    try {
      await updateTableNumber(selectedUsers[0], updatedOrders.find(o => o.$id === selectedUsers[0]).tableNumber || null);
    } catch (err) {
      console.error("Failed to update table:", err);
    }
  };

  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-3xl p-8">
        <Heading title="Table View" />
        {loading ? (
          <p className="text-gray-500 text-center">Loading...</p>
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
                  className={`cursor-pointer flex flex-col items-center justify-center rounded-xl shadow-md p-3 aspect-square transition-transform duration-200 border-2 ${
                    isOccupied(tableNumber)
                      ? 'bg-pink-100 border-pink-600 hover:bg-pink-200'
                      : 'bg-white border-gray-300 hover:bg-gray-100'
                  } hover:scale-105`}
                >
                  <div className="text-lg font-bold text-gray-800">T{tableNumber}</div>
                  <div className="mt-2 text-2xl">
                    {isOccupied(tableNumber) ? (
                      <FaUserCheck className="text-pink-600" />
                    ) : (
                      <FaUser className="text-black" />
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
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full text-center space-y-4">
            <h2 className="text-lg font-bold text-gray-800">Remove Table Assignment?</h2>
            <p className="text-sm text-gray-600">
              Are you sure you want to remove table T{selectedTable} from the order?
            </p>
            <div className="mt-2 text-gray-600">
              {usersInfo.length > 1 ? (
                <p className="font-semibold">Multiple users assigned to this table:</p>
              ) : (
                <p className="font-semibold">{usersInfo[0]?.user}</p>
              )}
              <ul className="text-sm text-gray-400 space-y-1">
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
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition"
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

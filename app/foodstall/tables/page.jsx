'use client';

import { useEffect, useState } from 'react';
import { FaUserCheck } from 'react-icons/fa';
import { GiTable } from 'react-icons/gi';
import getAllOrders from '@/app/actions/getAllOrders';
import updateTableNumber from '@/app/actions/updateTableNumber'; // Make sure the path is correct

const TableViewPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [showModal, setShowModal] = useState(false);

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
        occupiedMap.set(number, {
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
      setShowModal(true);
    }
  };

  const handleConfirmRemove = async () => {
    const info = occupiedMap.get(selectedTable);
    const orderId = info.orderId;

    const updatedOrders = orders.map((order) => {
      if (order.$id === orderId) {
        const updatedTableNumbers = order.tableNumber.filter((num) => num !== selectedTable);
        return { ...order, tableNumber: updatedTableNumbers };
      }
      return order;
    });

    setOrders(updatedOrders);
    setShowModal(false);
    setSelectedTable(null);

    try {
      await updateTableNumber(orderId, updatedOrders.find(o => o.$id === orderId).tableNumber || null);
    } catch (err) {
      console.error("Failed to update table:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-3xl p-8">
        <h1 className="text-4xl font-bold text-center text-yellow-500 mb-10">Table View</h1>

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
                      ? 'bg-yellow-100 border-yellow-400 hover:bg-yellow-200'
                      : 'bg-blue-100 border-blue-400 hover:bg-blue-200'
                  } hover:scale-105`}
                >
                  <div className="text-lg font-bold text-gray-800">T{tableNumber}</div>
                  <div className="mt-2 text-2xl">
                    {isOccupied(tableNumber) ? (
                      <FaUserCheck className="text-yellow-500" />
                    ) : (
                      <GiTable className="text-blue-500" />
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
            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRemove}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
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

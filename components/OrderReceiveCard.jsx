'use client';

import { useState } from 'react';
import updateTableNumber from '@/app/actions/updateTableNumber';
import updateOrderStatus from '@/app/actions/updateOrderStatus';

const ORDER_STATUS = {
  PENDING: 'pending',
  PREPARING: 'preparing',
  READY: 'ready',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

const OrderReceiveCard = ({ order, refreshOrders }) => {
  const [editingTable, setEditingTable] = useState(order.tableNumber?.[0] || '');
  const [updating, setUpdating] = useState(false);
  const [statusUpdates, setStatusUpdates] = useState({});
  const [saveToast, setSaveToast] = useState(false); // For displaying save confirmation
  const [isModalOpen, setIsModalOpen] = useState(false); // To control modal visibility
  const [newTableNumber, setNewTableNumber] = useState(editingTable); // Table number in the modal

  // Function to open modal and set current table number
  const openModal = () => {
    setNewTableNumber(editingTable);
    setIsModalOpen(true);
  };

  // Function to close modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Save table number when updated in the modal
  const handleSaveTable = async () => {
    try {
      setUpdating(true);
      await updateTableNumber(order.$id, newTableNumber);
      setEditingTable(newTableNumber);
      setSaveToast(true);
      refreshOrders();
      setTimeout(() => setSaveToast(false), 2000); // Hide the toast after 2 seconds
      closeModal(); // Close modal after saving
    } catch (error) {
      console.error("Failed to update table number", error);
      alert("Failed to update table number");
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateStatus = async (index, newStatus) => {
    try {
      setStatusUpdates((prev) => ({ ...prev, [index]: newStatus }));
      await updateOrderStatus(order.$id, index, newStatus);
      refreshOrders();
    } catch (error) {
      console.error("Failed to update order status:", error);
      alert("Failed to update order item status");
    }
  };

  const renderStatusBadge = (status) => {
    const normalized = String(status || '').toLowerCase();
    const colorMap = {
      [ORDER_STATUS.PREPARING]: 'text-yellow-600 bg-yellow-100',
      [ORDER_STATUS.READY]: 'text-indigo-600 bg-indigo-100',
      [ORDER_STATUS.COMPLETED]: 'text-green-600 bg-green-100',
      [ORDER_STATUS.CANCELLED]: 'text-red-600 bg-red-100',
      [ORDER_STATUS.PENDING]: 'text-blue-600 bg-blue-100',
    };

    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colorMap[normalized] || colorMap.pending}`}>
        {normalized.charAt(0).toUpperCase() + normalized.slice(1)}
      </span>
    );
  };

  const totalAmount = Array.isArray(order.total)
    ? order.total[3] || order.total.at(-1) || 0
    : +order.total || 0;

  return (
    <div className="border border-gray-200 rounded-xl p-6 bg-white space-y-8">
      {/* Header Section */}
      <div className="flex justify-between items-start gap-4">
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-gray-800">Order ID: {order.$id}</h2>
          <p className="text-sm text-gray-600">{order.name || 'Unknown'} ({order.email || 'N/A'})</p>
          <p className="text-xs text-gray-400">Created: {new Date(order.created_at).toLocaleString()}</p>
        </div>
        <div className="flex items-center gap-2 relative">
          {/* Button to open modal */}
          <button
            onClick={openModal}
            className="text-xs px-4 py-1.5 rounded border border-pink-600 text-pink-600 hover:bg-pink-600 hover:text-white transition"
          >
            Change Table #
          </button>
          {saveToast && (
            <div className="absolute top-full left-0 mt-1 text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded">
              Table saved
            </div>
          )}
        </div>
      </div>

      {/* Order Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {order.items.map((itemString, idx) => {
          let item;
          try {
            item = JSON.parse(itemString);
          } catch {
            item = { menuName: 'Invalid Item' };
          }

          const itemStatus = item.status || 'pending';

          return (
            <div
              key={idx}
              className="p-4 rounded-lg border border-pink-600 bg-white flex flex-col space-y-3"
            >
              {/* Image */}
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-white rounded-full overflow-hidden border border-gray-200 flex items-center justify-center">
                  {item.menuImage ? (
                    <img
                      src={item.menuImage}
                      alt={item.menuName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-gray-400">No Image</span>
                  )}
                </div>
              </div>

              {/* Info & Status */}
              <div className="flex justify-between items-center">
                <p className="font-medium text-gray-800">{item.menuName}</p>
                {renderStatusBadge(itemStatus)}
              </div>

              <p className="text-sm text-gray-600">₱{(item.menuPrice * (item.quantity || 1)).toFixed(2)}</p>
              <p className="text-sm text-gray-500">Qty: {item.quantity || 1}</p>

              {item.room_name && (
                <p className="text-xs italic text-gray-400">From: {item.room_name}</p>
              )}

              {/* Status Buttons */}
              <div className="flex flex-wrap gap-2 pt-2">
                {Object.values(ORDER_STATUS).map((status) => {
                  const isActive = (statusUpdates[idx] || itemStatus) === status;
                  return (
                    <button
                      key={status}
                      onClick={() => handleUpdateStatus(idx, status)}
                      className={`
                        text-xs px-3 py-1 rounded-full border font-medium transition
                        ${isActive
                          ? 'bg-pink-600 text-white border-pink-600'
                          : 'bg-white text-gray-600 border-gray-300 hover:bg-yellow-400 hover:text-white'}
                      `}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Total Amount */}
      <div className="text-right pt-4 border-t border-gray-200">
        <p className="text-lg font-semibold text-pink-600 mt-2">Total: ₱{totalAmount.toFixed(2)}</p>
      </div>

      {/* Modal for table number update */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-1/3">
            <h3 className="text-lg font-semibold mb-4">Update Table Number</h3>
            <input
              type="number"
              value={newTableNumber}
              onChange={(e) => setNewTableNumber(e.target.value)}
              className="border border-gray-300 px-3 py-1 rounded-md text-sm w-full"
              placeholder="Enter new table number"
            />
            <div className="flex justify-end gap-4 mt-4">
              <button
                onClick={closeModal}
                className="text-xs px-4 py-1.5 rounded border border-gray-600 text-gray-600 hover:bg-gray-600 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTable}
                className="text-xs px-4 py-1.5 rounded border border-pink-600 text-pink-600 hover:bg-pink-600 hover:text-white transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderReceiveCard;

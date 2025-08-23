"use client";

import { useState } from "react";
import updateTableNumber from "@/app/actions/updateTableNumber";
import updateOrderStatus from "@/app/actions/updateOrderStatus";

const ORDER_STATUS = {
  PENDING: "pending",
  PREPARING: "preparing",
  READY: "ready",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

const OrderReceiveCard = ({ order, refreshOrders, roomName }) => {
  const [editingTable, setEditingTable] = useState(order.tableNumber?.[0] || "");
  const [updating, setUpdating] = useState(false);
  const [statusUpdates, setStatusUpdates] = useState({});
  const [saveToast, setSaveToast] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTableNumber, setNewTableNumber] = useState(editingTable);

  const openModal = () => {
    setNewTableNumber(editingTable);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSaveTable = async () => {
    try {
      setUpdating(true);
      await updateTableNumber(order.$id, newTableNumber);
      setEditingTable(newTableNumber);
      setSaveToast(true);
      refreshOrders();
      setTimeout(() => setSaveToast(false), 2000);
      closeModal();
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
    const normalized = String(status || "").toLowerCase();
    const styleMap = {
      pending: "bg-blue-500/20 text-blue-300 border border-blue-400/50",
      preparing: "bg-yellow-500/20 text-yellow-300 border border-yellow-400/50",
      ready: "bg-indigo-500/20 text-indigo-300 border border-indigo-400/50",
      completed: "bg-green-500/20 text-green-300 border border-green-400/50",
      cancelled: "bg-red-500/20 text-red-300 border border-red-400/50",
    };

    const statusTextMap = {
      pending: "Order Placed",
      preparing: "Preparing",
      ready: "Ready",
      completed: "Completed",
      cancelled: "Cancelled",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm whitespace-nowrap
          ${styleMap[normalized] || styleMap.pending}`}
      >
        {statusTextMap[normalized] || "Order Placed"}
      </span>
    );
  };

  const parsedItems = order.items
    .map((itemStr, idx) => {
      try {
        const parsed = JSON.parse(itemStr);
        return { ...parsed, originalIndex: idx };
      } catch {
        return null;
      }
    })
    .filter((item) => item && item.room_name === roomName);

  if (parsedItems.length === 0) return null;

  const totalAmount = parsedItems.reduce((acc, item) => acc + (item.menuPrice * (item.quantity || 1)), 0);

  return (
    <div className=" rounded-xl p-6 bg-neutral-900 text-white space-y-8">
      <div className="flex justify-between items-start gap-4">
        <div className="space-y-1">
          <h2 className="text-base font-semibold">Order ID: {order.$id}</h2>
          <p className="text-sm text-neutral-300">{order.name || "Unknown"} ({order.email || "N/A"})</p>
          <p className="text-xs text-neutral-400">Created: {new Date(order.created_at).toLocaleString()}</p>
        </div>
        <div className="flex items-center gap-2 relative">
          <button
            onClick={openModal}
            className="text-xs px-4 py-1.5 rounded border border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-white transition"
          >
            Change Table #
          </button>
          {saveToast && (
            <div className="absolute top-full left-0 mt-1 text-xs text-green-400 bg-green-800 px-2 py-0.5 rounded">
              Table saved
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {parsedItems.map((item) => {
          const itemStatus = item.status || "pending";
          const idx = item.originalIndex;

          return (
            <div
              key={idx}
              className="p-4 rounded-lg border border-neutral-700 bg-neutral-800 flex flex-col space-y-3"
            >
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-full overflow-hidden border border-neutral-700 flex items-center justify-center bg-neutral-700">
                  {item.menuImage ? (
                    <img
                      src={item.menuImage}
                      alt={item.menuName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-neutral-400">No Image</span>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <p className="font-medium text-white">{item.menuName}</p>
                {renderStatusBadge(itemStatus)}
              </div>

              <p className="text-sm text-neutral-300">₱{(item.menuPrice * (item.quantity || 1)).toFixed(2)}</p>
              <p className="text-sm text-neutral-400">Qty: {item.quantity || 1}</p>

              <div className="flex flex-wrap gap-2 pt-2">
                {Object.values(ORDER_STATUS).map((status) => {
                  const isActive = (statusUpdates[idx] || itemStatus) === status;
                  const buttonText = status === "pending" ? "Order Placed" : status.charAt(0).toUpperCase() + status.slice(1);
                  return (
                    <button
                      key={status}
                      onClick={() => handleUpdateStatus(idx, status)}
                      className={`text-xs px-3 py-1 rounded-full border font-medium transition
                        ${isActive
                          ? "bg-pink-500 text-white border-pink-500"
                          : "bg-neutral-900 text-neutral-300 border-neutral-600 hover:bg-pink-600 hover:text-white"}`}
                    >
                      {buttonText}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-right pt-4 border-t border-neutral-700">
        <p className="text-lg font-semibold text-pink-400 mt-2">Total: ₱{totalAmount.toFixed(2)}</p>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-neutral-800 p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">Update Table Number</h3>
            <input
              type="number"
              value={newTableNumber}
              onChange={(e) => setNewTableNumber(e.target.value)}
              className="border border-neutral-600 px-3 py-1 rounded-md text-sm w-full bg-neutral-900 text-white"
              placeholder="Enter new table number"
            />
            <div className="flex justify-end gap-4 mt-4">
              <button
                onClick={closeModal}
                className="text-xs px-4 py-1.5 rounded border border-neutral-400 text-neutral-400 hover:bg-neutral-600 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTable}
                className="text-xs px-4 py-1.5 rounded border border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-white transition"
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
"use client";

import { useState, useEffect } from "react";
import updateTableNumber from "@/app/actions/updateTableNumber";
import updateOrderStatus from "@/app/actions/updateOrderStatus";

const ORDER_STATUS = {
  PENDING: "pending",
  PREPARING: "preparing",
  READY: "ready",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  FAILED: "failed",
};

const PAYMENT_STATUS = {
  PENDING: "pending",
  PAID: "paid",
  FAILED: "failed",
};

const maskPhone = (phone) => {
  if (!phone) return "No phone";
  let normalized = phone.startsWith("0")
    ? "+63" + phone.slice(1)
    : phone.startsWith("63")
    ? "+" + phone
    : phone.startsWith("+63")
    ? phone
    : "+63" + phone;

  return normalized.slice(0, 6) + "XXXXX" + normalized.slice(-2);
};

const OrderReceiveCard = ({ order, refreshOrders, roomName }) => {
  const [editingTable, setEditingTable] = useState(order.tableNumber?.[0] || "");
  const [updating, setUpdating] = useState(false);
  const [saveToast, setSaveToast] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTableNumber, setNewTableNumber] = useState(editingTable);

  const paymentStatus = order.payment_status || PAYMENT_STATUS.FAILED;

  // Auto mark items as failed if payment failed
  useEffect(() => {
    if (paymentStatus === PAYMENT_STATUS.FAILED) {
      order.items.forEach((itemStr, idx) => {
        try {
          const parsed = JSON.parse(itemStr);
          if (parsed.status !== ORDER_STATUS.FAILED) {
            updateOrderStatus(order.$id, idx, ORDER_STATUS.FAILED);
          }
        } catch {
          return;
        }
      });
    }
  }, [paymentStatus, order]);

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

// --- NEW: update status for all items in this stall ---
const handleUpdateStallStatus = async (newStatus, items) => {
  if (paymentStatus === PAYMENT_STATUS.FAILED) return;
  try {
    await Promise.all(
      items.map((item) =>
        updateOrderStatus(order.$id, item.originalIndex, newStatus)
      )
    );

    // Send SMS only once per status
    if (order.phone) {
      try {
        if (newStatus === ORDER_STATUS.PREPARING) {
          await fetch("/api/semaphore", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              phone: order.phone,
              name: order.name || "Customer",
              message: `Hi ${order.name || "Customer"}, your order from ${roomName} is now being prepared. 🍳 Please wait while we get it ready!`,
            }),
          });
        } else if (newStatus === ORDER_STATUS.READY) {
          await fetch("/api/semaphore/order-ready", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              phone: order.phone,
              name: order.name || "Customer",
              message: `Hi ${order.name || "Customer"}! ✅ Your order from ${roomName} is READY for pickup. 🚀 Please proceed to the counter. Thank you!`,
            }),
          });
        }
      } catch (smsError) {
        console.error("Failed to send SMS:", smsError);
      }
    }

    refreshOrders();
  } catch (error) {
    console.error("Failed to update stall status:", error);
    alert("Failed to update stall status");
  }
};



  const renderStatusBadge = (status) => {
    const normalized = String(status || "").toLowerCase();
    const styleMap = {
      "pending": "bg-blue-500/20 text-blue-300 border border-blue-400/50",
      preparing: "bg-yellow-500/20 text-yellow-300 border border-yellow-400/50",
      ready: "bg-indigo-500/20 text-indigo-300 border border-indigo-400/50",
      completed: "bg-green-500/20 text-green-300 border border-green-400/50",
      cancelled: "bg-red-500/20 text-red-300 border border-red-400/50",
      failed: "bg-gray-500/20 text-gray-300 border border-gray-400/50",
    };

    const statusTextMap = {
      pending: "Pending",
      preparing: "Preparing",
      ready: "Ready",
      completed: "Completed",
      cancelled: "Cancelled",
      failed: "Failed",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm whitespace-nowrap
          ${styleMap[normalized] || styleMap["pending"]}`}
      >
        {statusTextMap[normalized] || "Pending"}
      </span>
    );
  };

  const renderPaymentBadge = () => {
    const styleMap = {
      [PAYMENT_STATUS.PENDING]: "bg-yellow-500/20 text-yellow-300 border border-yellow-400/50",
      [PAYMENT_STATUS.PAID]: "bg-green-500/20 text-green-300 border border-green-400/50",
      [PAYMENT_STATUS.FAILED]: "bg-red-500/20 text-red-300 border border-red-400/50",
    };

    const textMap = {
      [PAYMENT_STATUS.PENDING]: "Pending",
      [PAYMENT_STATUS.PAID]: "Paid",
      [PAYMENT_STATUS.FAILED]: "Failed",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm whitespace-nowrap
          ${styleMap[paymentStatus]}`}
      >
        Payment: {textMap[paymentStatus]}
      </span>
    );
  };

  // Parse only items for this stall
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

  // Stall-wide status = first item’s status
  const stallStatus =
    paymentStatus === PAYMENT_STATUS.FAILED
      ? ORDER_STATUS.FAILED
      : parsedItems[0].status || ORDER_STATUS.PENDING;

  const totalAmount = parsedItems.reduce(
    (acc, item) => acc + item.menuPrice * (item.quantity || 1),
    0
  );

  return (
    <div className="rounded-xl p-6 bg-neutral-900 text-white space-y-8">
      <div className="flex justify-between items-start gap-4">
        <div className="space-y-1">
          <h2 className="text-base font-semibold">Order ID: {order.$id}</h2>
          <p className="text-sm text-neutral-300">
            {order.name || "Unknown"} ({order.email || "N/A"})
          </p>
          <p className="text-sm text-neutral-300">{maskPhone(order.phone)}</p>
          <p className="text-xs text-neutral-400">
            Created: {new Date(order.created_at).toLocaleString()}
          </p>
          <div className="mt-1">{renderPaymentBadge()}</div>
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

      {/* Items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {parsedItems.map((item) => (
          <div
            key={item.originalIndex}
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

            <p className="font-medium text-white">{item.menuName}</p>
            <p className="text-sm text-neutral-300">
              ₱{(item.menuPrice * (item.quantity || 1)).toFixed(2)}
            </p>
            <p className="text-sm text-neutral-400">Qty: {item.quantity || 1}</p>
          </div>
        ))}
      </div>

      {/* Stall-wide status controls */}
      <div className="flex flex-wrap gap-2 pt-4 border-t border-neutral-700">
        {Object.values(ORDER_STATUS).map((status) => {
          const isActive = stallStatus === status;
          const buttonText =
            status === "pending"
              ? "Pending"
              : status.charAt(0).toUpperCase() + status.slice(1);

          return (
            <button
              key={status}
              onClick={() => handleUpdateStallStatus(status, parsedItems)}
              disabled={paymentStatus === PAYMENT_STATUS.FAILED}
              className={`text-xs px-3 py-1 rounded-full border font-medium transition
                ${
                  isActive
                    ? "bg-pink-500 text-white border-pink-500"
                    : "bg-neutral-900 text-neutral-300 border-neutral-600 hover:bg-pink-600 hover:text-white"
                }
                ${
                  paymentStatus === PAYMENT_STATUS.FAILED
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
            >
              {buttonText}
            </button>
          );
        })}
      </div>

      <div className="text-right pt-4 border-t border-neutral-700">
        <p className="text-lg font-semibold text-pink-400 mt-2">
          Total: ₱{totalAmount.toFixed(2)}
        </p>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-neutral-800 p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">
              Update Table Number
            </h3>
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

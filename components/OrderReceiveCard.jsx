"use client";

import { useState, useEffect } from "react";
import updateTableNumber from "@/app/actions/updateTableNumber";
import updateOrderStatus from "@/app/actions/updateOrderStatus";
import ManageTable from "./ManageTable";
import ViewReceipt from "./ViewReceipt"; // Import the new component

const ORDER_STATUS = {
  PENDING: "pending",
  PREPARING: "preparing",
  READY: "ready",
  COMPLETED: "completed",
  // REMOVED: CANCELLED: "cancelled",
  FAILED: "failed", // The status we want to make unclickable
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

  // Masking the middle part of the number
  return normalized.slice(0, 6) + "XXXXX" + normalized.slice(-2);
};

const OrderReceiveCard = ({ order, refreshOrders, roomName }) => {
  const [editingTable, setEditingTable] = useState(order.tableNumber?.[0] || "");
  const [updating, setUpdating] = useState(false);
  const [saveToast, setSaveToast] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);

  const paymentStatus = order.payment_status || PAYMENT_STATUS.FAILED;

  // Auto mark items as failed if payment failed or reset to pending if paid
  useEffect(() => {
    // If payment failed, force all items to FAILED status
    if (paymentStatus === PAYMENT_STATUS.FAILED) {
      order.items.forEach((itemStr, idx) => {
        try {
          const parsed = JSON.parse(itemStr);
          // Only update status if it's not already failed
          if (parsed.status !== ORDER_STATUS.FAILED) {
            updateOrderStatus(order.$id, idx, ORDER_STATUS.FAILED);
          }
        } catch {
          // Ignore items that can't be parsed
          return;
        }
      });
    }
    // NEW LOGIC: If payment is successful (PAID) and the items are currently FAILED,
    // set them back to PENDING so they can be processed.
    else if (paymentStatus === PAYMENT_STATUS.PAID) {
      order.items.forEach(async (itemStr, idx) => {
        try {
          const parsed = JSON.parse(itemStr);
          // Only update status if it's currently FAILED
          if (parsed.status === ORDER_STATUS.FAILED) {
            // Note: Use await here if you want to ensure all updates complete before the 
            // parent component's realtime listener catches the changes.
            await updateOrderStatus(order.$id, idx, ORDER_STATUS.PENDING);
          }
        } catch {
          // Ignore items that can't be parsed
          return;
        }
      });
    }
  }, [paymentStatus, order]);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSaveTable = async (newTableNumber) => {
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

  const handleUpdateStallStatus = async (newStatus, items) => {
    // Prevent any status update if payment has failed
    if (paymentStatus === PAYMENT_STATUS.FAILED) return;

    try {
      // Update the status for all items in this order partition
      await Promise.all(
        items.map((item) =>
          updateOrderStatus(order.$id, item.originalIndex, newStatus)
        )
      );

      // SMS Notification Logic (only for non-failed payments)
      if (order.phone) {
        try {
          let message = '';
          let endpoint = '/api/semaphore'; // Default endpoint

          if (newStatus === ORDER_STATUS.PREPARING) {
            message = `Hi ${order.name || "Customer"}, your order from ${roomName} is now being prepared. Please wait until it is ready for pickup.`;
          } else if (newStatus === ORDER_STATUS.READY) {
            message = `Hi ${order.name || "Customer"}, your order from ${roomName} is now ready for pickup. Please proceed to the counter. Thank you for choosing us.`;
            endpoint = "/api/semaphore/order-ready"; // Specific ready endpoint
          } else if (newStatus === ORDER_STATUS.COMPLETED) {
            // NEW SMS MESSAGE FOR COMPLETED STATUS
            message = `Hi ${order.name || "Customer"}, your order is now complete. Thank you for choosing ${roomName}! We'd love to hear your feedback—please consider leaving a review for a better future experience.`;
            endpoint = "/api/semaphore/order-completed"; // New specific completed endpoint (you may need to create this)
          }

          if (message) {
             await fetch(endpoint, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                phone: order.phone,
                name: order.name || "Customer",
                message: message
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
      pending: "bg-blue-500/20 text-blue-300 border border-blue-400/50",
      preparing: "bg-yellow-500/20 text-yellow-300 border border-yellow-400/50",
      ready: "bg-indigo-500/20 text-indigo-300 border border-indigo-400/50",
      completed: "bg-green-500/20 text-green-300 border border-green-400/50",
      // REMOVED: cancelled: "bg-red-500/20 text-red-300 border border-red-400/50",
      failed: "bg-gray-500/20 text-gray-300 border border-gray-400/50",
    };

    const statusTextMap = {
      pending: "Pending",
      preparing: "Preparing",
      ready: "Ready",
      completed: "Completed",
      // REMOVED: cancelled: "Cancelled",
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
      [PAYMENT_STATUS.PENDING]:
        "bg-yellow-500/20 text-yellow-300 border border-yellow-400/50",
      [PAYMENT_STATUS.PAID]:
        "bg-green-500/20 text-green-300 border border-green-400/50",
      [PAYMENT_STATUS.FAILED]:
        "bg-red-500/20 text-red-300 border border-red-400/50",
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

  // Filter and parse items relevant to the current roomName/stall
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

  // Determine the overall status for this stall's part of the order.
  // CRUCIAL LOGIC: If payment failed, force the status to FAILED.
  const stallStatus =
    paymentStatus === PAYMENT_STATUS.FAILED
      ? ORDER_STATUS.FAILED
      : parsedItems[0].status || ORDER_STATUS.PENDING; // Use first item status as representation

  const totalAmount = parsedItems.reduce(
    (acc, item) => acc + item.menuPrice * (item.quantity || 1),
    0
  );

  return (
    <div className="rounded-xl p-4 bg-neutral-900 text-white space-y-6">
      <div className="flex flex-col gap-4">
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
        <div className="flex flex-col md:flex-row md:items-center gap-4 flex-wrap">
          <p className="text-sm text-neutral-300">
            Current Table: <span className="font-semibold text-pink-400">{editingTable || "Not Set"}</span>
          </p>
          <div className="flex flex-row gap-4">
            <button
              onClick={openModal}
              className="text-xs px-4 py-1.5 rounded border border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-white transition self-start"
            >
              {editingTable ? "Change Table #" : "Set Table #"}
            </button>
            <button
              onClick={() => setShowReceipt(true)}
              className="text-xs px-4 py-1.5 rounded border border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-white transition self-start"
            >
              View Customer Receipt
            </button>
          </div>
        </div>
        {saveToast && (
          <div className="text-xs text-green-400 bg-green-800 px-2 py-0.5 rounded">
            Table saved
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <p className="text-sm text-neutral-400">Quantity: {item.quantity || 1}</p>
          </div>
        ))}
      </div>

      {/* Status Update Buttons */}
      <div className="flex flex-wrap gap-2 pt-4 border-t border-neutral-700">
        {Object.values(ORDER_STATUS).map((status) => {
          const isActive = stallStatus === status;
          const buttonText =
            status === "pending"
              ? "Pending"
              : status.charAt(0).toUpperCase() + status.slice(1);
              
          // Disable the button if the status is 'failed' OR if payment has failed
          const isDisabled = status === ORDER_STATUS.FAILED || paymentStatus === PAYMENT_STATUS.FAILED;

          return (
            <button
              key={status}
              onClick={() => {
                // Ensure we don't attempt to manually set the status to FAILED
                if (status !== ORDER_STATUS.FAILED) {
                  handleUpdateStallStatus(status, parsedItems);
                }
              }}
              disabled={isDisabled}
              className={`text-xs px-3 py-1 rounded-full border font-medium transition
                ${
                  isActive
                    ? "bg-pink-500 text-white border-pink-500"
                    : "bg-neutral-900 text-neutral-300 border-neutral-600 hover:bg-pink-600 hover:text-white"
                }
                ${
                  isDisabled
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
            >
              {buttonText}
            </button>
          );
        })}
      </div>

      {/* ManageTable Modal */}
      <ManageTable
        isOpen={isModalOpen}
        onClose={closeModal}
        initialTable={editingTable}
        onSave={handleSaveTable}
        isUpdating={updating}
      />

      {/* ViewReceipt Modal */}
      {showReceipt && (
        <ViewReceipt
          order={order}
          onClose={() => setShowReceipt(false)}
        />
      )}
    </div>
  );
};

export default OrderReceiveCard;
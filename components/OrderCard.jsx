// OrderCard.js

'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// Removed solidStar, kept status/control icons
import { faCheckCircle, faClock, faHourglassHalf, faTimesCircle, faExclamationCircle, faBan, faReceipt, faXmark } from '@fortawesome/free-solid-svg-icons'; 
// Removed updateRating import
import OrderReceipt from './OrderReceipt'; // Assume OrderReceipt.js is in the same directory

const MENU_STATUS = {
  PENDING: 'pending',
  PREPARING: 'preparing',
  READY: 'ready',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  FAILED: 'failed',
};

const PAYMENT_STATUS = {
  PENDING: "pending",
  PAID: "paid",
  EXPIRED: "expired",
  FAILED: "failed",
};

// Removed setOrders as it's no longer needed without rating updates
const OrderCard = ({ order, isReadOnly = false }) => {
  // Removed state related to rating (selectedItem, rating, comment)
  const [showReceipt, setShowReceipt] = useState(false); 

  const tableNumber = order.tableNumber?.[0] || 'N/A';

  // Removed openRatingModal, closeRatingModal, and handleSubmitRating functions.

  // --- DARK THEME STATUS RENDERING (ICON + TEXT) ---
  const renderStatus = (status) => {
    // Adjusted colors for better visibility on a dark background
    const statusMap = {
      [MENU_STATUS.PENDING]: { text: 'Pending', icon: faClock, color: 'text-gray-400' },
      [MENU_STATUS.PREPARING]: { text: 'Preparing', icon: faHourglassHalf, color: 'text-yellow-400' },
      [MENU_STATUS.READY]: { text: 'Ready', icon: faCheckCircle, color: 'text-cyan-400' }, // Using a theme color
      [MENU_STATUS.COMPLETED]: { text: 'Completed', icon: faCheckCircle, color: 'text-green-500' },
      [MENU_STATUS.CANCELLED]: { text: 'Cancelled', icon: faTimesCircle, color: 'text-fuchsia-400' }, // Using a theme color
      [MENU_STATUS.FAILED]: { text: 'Failed', icon: faExclamationCircle, color: 'text-red-500' },
    };

    const s = statusMap[status] || statusMap[MENU_STATUS.PENDING];

    return (
      <div className={`flex items-center space-x-2 text-sm font-medium ${s.color}`}>
        <FontAwesomeIcon icon={s.icon} className="w-4 h-4" />
        <span>{s.text}</span>
      </div>
    );
  };

  const renderPaymentStatus = (status) => {
    const statusKey = status.toLowerCase();
    const statusMap = {
      [PAYMENT_STATUS.PENDING]: { text: 'Pending', icon: faClock, color: 'text-yellow-400' },
      [PAYMENT_STATUS.PAID]: { text: 'Paid', icon: faCheckCircle, color: 'text-green-500' },
      [PAYMENT_STATUS.EXPIRED]: { text: 'Expired', icon: faBan, color: 'text-gray-500' },
      [PAYMENT_STATUS.FAILED]: { text: 'Failed', icon: faExclamationCircle, color: 'text-red-500' },
    };

    const s = statusMap[statusKey] || statusMap[PAYMENT_STATUS.FAILED];

    return (
      <div className={`flex items-center space-x-2 text-base font-semibold ${s.color}`}>
        <FontAwesomeIcon icon={s.icon} className="w-5 h-5" />
        <span>{s.text}</span>
      </div>
    );
  };
  // -----------------------------------------------------------------


  const parseItemsGroupedByRoom = () => {
    const grouped = {};
    let nonCompletedCount = 0; // Track items that are NOT completed

    (order.items || []).forEach((itemStr, index) => {
      try {
        const item = JSON.parse(itemStr);
        
        // **LOGIC UPDATE: Filter to exclude COMPLETED items**
        if (item.status === MENU_STATUS.COMPLETED) {
            return; // Skip this item
        }

        // If we reach here, the item is NOT completed
        nonCompletedCount++;

        const roomId = item.room_id || 'unknown';
        const roomName = item.room_name || 'Unknown Stall';

        if (!grouped[roomId]) {
          grouped[roomId] = {
            roomName,
            items: [],
          };
        }

        grouped[roomId].items.push({
          ...item,
          index,
        });
      } catch {
        // skip broken item
      }
    });

    // Return the grouped items and the count of non-completed items
    return { grouped, nonCompletedCount };
  };

  const { grouped: groupedItems, nonCompletedCount } = parseItemsGroupedByRoom();

  // **CONDITIONAL RENDERING: Hide the entire card if all items are completed**
  if (nonCompletedCount === 0) {
      return null;
  }

  return (
    <div className="w-full">
      {/* Main Card Container: Dark theme, subtle border, and shadow for depth */}
      <div className="bg-neutral-900 text-white w-full rounded-xl border border-neutral-700 p-6 sm:p-8 shadow-2xl shadow-neutral-950/50">

        {/* Order Header */}
        <div className="pb-6 mb-6 border-b border-neutral-700">
          <div className="flex justify-between items-start mb-1">
            <h2 className="text-3xl font-extrabold tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-500 to-cyan-400">
                  ORDER #
              </span>
              <span className="text-white ml-1">
                  {order.$id.slice(-8)}
              </span>
            </h2>
            
            {/* View Receipt Button */}
            <button
              onClick={() => setShowReceipt(true)}
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-cyan-400 text-sm font-medium rounded-lg transition duration-150 border border-neutral-700 shadow-lg"
            >
              <FontAwesomeIcon icon={faReceipt} className="mr-2" />
              View Receipt
            </button>
          </div>
          
          <p className="text-sm text-gray-400 mb-4">{new Date(order.created_at).toLocaleString()}</p>

          {/* Status/Table Details Grid */}
          <div className="grid grid-cols-2 gap-4">

            {/* Payment Status */}
            <div>
                <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Payment Status</p>
                {renderPaymentStatus(order.payment_status || "failed")}
            </div>

            {/* Table Number */}
            <div className='flex flex-col items-end'>
                <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Table</p>
                <div className="flex items-center space-x-1 text-2xl font-semibold">
                    <span className="text-cyan-400 mr-1">#</span>
                    <span className="text-white">{tableNumber}</span>
                </div>
            </div>
          </div>
        </div>

        {/* Items Grouped by Stall */}
        <div className="mb-6 space-y-8">
          <h3 className="text-xl font-semibold text-gray-300">
            Items Being Processed
          </h3>
          {Object.entries(groupedItems).map(([roomId, { roomName, items }]) => (
            // Stall Group Container: Lighter dark background for distinction
            <div key={roomId} className="rounded-lg p-4 bg-neutral-800 border border-neutral-700 shadow-inner shadow-neutral-950/30">
              <h4 className="text-lg font-bold text-gray-100 mb-4 pb-2 border-b border-neutral-700">{roomName}</h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((item) => {
                  const itemQuantity = item.quantity;

                  return (
                    // Item Card
                    <div
                      key={item.index}
                      className="relative border border-neutral-700 rounded-md bg-neutral-900 p-4 flex flex-col items-center text-center transition-all duration-300"
                    >
                      {/* Menu Image */}
                      {item.menuImage && (
                        <div className="flex-shrink-0 w-20 h-20 rounded-full overflow-hidden relative mb-2 border border-neutral-600">
                          <Image 
                            src={item.menuImage}
                            alt={item.menuName}
                            width={80}  // Required width
                            height={80} // Required height
                            className="object-cover"
                          />
                        </div>
                      )}

                      {/* Item Details */}
                      <div className="flex-grow w-full">
                        <p className="font-semibold text-white text-base leading-snug">
                            {item.menuName} {item.size && <span className="text-gray-400 font-normal">({item.size})</span>}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            Qty: <span className="font-bold text-cyan-400">{itemQuantity}</span>
                        </p>

                        <div className="mt-4 pt-3 border-t border-neutral-700">
                            {/* Status (The focus of this non-rating card) */}
                            <div className="mb-1">
                                {renderStatus(item.status || MENU_STATUS.PENDING)}
                            </div>
                            
                            {/* Removed Rating Controls entirely */}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Footer */}
        <div className="pt-6 mt-6 border-t border-neutral-700 text-center">
            <p className="text-base text-gray-400 font-light">
                Thank you for your order!
            </p>
        </div>
      </div>

      {/* Removed Rating Modal JSX */}

      {/* Receipt Modal */}
      {showReceipt && (
        <div 
          className="fixed inset-0 z-50 flex items-start justify-center bg-gray-950 bg-opacity-80 backdrop-blur-sm p-4 overflow-y-auto" 
          aria-modal="true" 
          role="dialog"
        >
            <div className="relative w-full max-w-xl my-8">
                {/* Close button */}
                <button
                    onClick={() => setShowReceipt(false)}
                    className="absolute -top-3 -right-3 z-10 w-8 h-8 flex items-center justify-center text-white bg-pink-600 hover:bg-pink-700 rounded-full shadow-lg transition"
                    aria-label="Close Receipt"
                >
                    <FontAwesomeIcon icon={faXmark} className="w-5 h-5" />
                </button>
                <OrderReceipt order={order} />
            </div>
        </div>
      )}
    </div>
  );
};

export default OrderCard;
'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar as solidStar } from '@fortawesome/free-solid-svg-icons';
import updateRating from '@/app/actions/updateRating';

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

// Add the isReadOnly prop with a default value of false
const OrderCard = ({ order, setOrders, isReadOnly = false }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  // --- START: Extract Totals from Order Object ---
  const baseTotal = (order.total && order.total[0]) || 0;
  const discountAmount = Math.abs((order.total && order.total[1]) || 0); 
  const finalTotal = (order.total && order.total[2]) || 0;
  const serviceCharge = 0; 
  // --- END: Extract Totals from Order Object ---

  const openRatingModal = (index) => {
    setSelectedItem(index);
    const initialRating = order.rating?.[index] || 0;
    const initialComment = order.comment?.[index] || '';
    setRating(initialRating);
    setComment(initialComment);
  };

  const closeRatingModal = () => {
    setSelectedItem(null);
  };

  const handleSubmitRating = async () => {
    if (rating < 1 || rating > 5) {
      alert('Please give a rating between 1 and 5');
      return;
    }

    try {
      const updatedRatings = [...(order.rating || [])];
      const updatedComments = [...(order.comment || [])];
      const updatedRated = [...(order.rated || [])];

      updatedRatings[selectedItem] = rating;
      updatedComments[selectedItem] = comment;
      updatedRated[selectedItem] = true;

      await updateRating(order.$id, updatedRatings, updatedComments, updatedRated);

      setOrders((prevOrders) =>
        prevOrders.map((o) =>
          o.$id === order.$id
            ? { ...o, rating: updatedRatings, comment: updatedComments, rated: updatedRated }
            : o
        )
      );

      closeRatingModal();
      alert('Thank you for your rating!');
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Failed to submit rating.');
    }
  };

  // Status badge rendering logic remains the same...

  const renderStatusBadge = (status) => {
    const base = 'px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase';
    const badgeColors = {
      [MENU_STATUS.PENDING]: 'bg-blue-600',
      [MENU_STATUS.PREPARING]: 'bg-yellow-600',
      [MENU_STATUS.READY]: 'bg-purple-600',
      [MENU_STATUS.COMPLETED]: 'bg-green-600',
      [MENU_STATUS.CANCELLED]: 'bg-red-600',
      [MENU_STATUS.FAILED]: 'bg-gray-600',
    };

    const statusTextMap = {
      [MENU_STATUS.PENDING]: 'Pending',
      [MENU_STATUS.PREPARING]: 'Preparing',
      [MENU_STATUS.READY]: 'Ready',
      [MENU_STATUS.COMPLETED]: 'Completed',
      [MENU_STATUS.CANCELLED]: 'Cancelled',
      [MENU_STATUS.FAILED]: 'Failed',
    };

    return (
      <span className={`${base} ${badgeColors[status] || 'bg-gray-600'} text-white`}>
        {statusTextMap[status] || 'Pending'}
      </span>
    );
  };

  const renderPaymentBadge = (status) => {
    const base = "px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase";
    const badgeColors = {
      pending: "bg-yellow-600",
      paid: "bg-green-600",
      expired: "bg-gray-600",
      failed: "bg-red-600",
    };
  
    const statusTextMap = {
      pending: "Pending",
      paid: "Paid",
      expired: "Expired",
      failed: "Failed",
    };
  
    return (
      <span className={`${base} ${badgeColors[status.toLowerCase()] || "bg-gray-600"} text-white`}>
        {statusTextMap[status.toLowerCase()] || "Unknown"}
      </span>
    );
  };
  

  const parseItemsGroupedByRoom = () => {
    const grouped = {};
    (order.items || []).forEach((itemStr, index) => {
      try {
        const item = JSON.parse(itemStr);
        const roomId = item.room_id || 'unknown';
        const roomName = item.room_name || 'Unknown Stall';

        if (!grouped[roomId]) {
          grouped[roomId] = {
            roomName,
            items: [],
          };
        }

        // Add the index and original item data for correct rating tracking
        grouped[roomId].items.push({ 
          ...item, 
          index,
          itemTotal: (Number(item.menuPrice) * (item.quantity || 1)) - (Number(item.discountAmount) || 0) // Item final total
        });
      } catch {
        // skip broken item
      }
    });
    return grouped;
  };

  const getRoomSubtotal = (items) =>
    items.reduce((sum, item) => sum + Number(item.menuPrice) * (item.quantity || 1), 0);

  const getRoomDiscount = (items) =>
    items.reduce((sum, item) => sum + Number(item.discountAmount || 0), 0);

  const getRoomFinalTotal = (items) =>
    items.reduce((sum, item) => sum + item.itemTotal, 0);

  const groupedItems = parseItemsGroupedByRoom();

  /**
   * New helper function to count discounted items for a specific room.
   */
  const getDiscountedItemCount = (roomName) => {
    const roomEntry = Object.values(groupedItems).find(group => group.roomName === roomName);
    if (!roomEntry) return 0;

    // Count how many individual item entries have a non-zero discountAmount
    const count = roomEntry.items.filter(item => (Number(item.discountAmount) || 0) > 0).length;
    return count;
  };

  /**
   * REVISED parsePromos FUNCTION
   * Stores the full promo string and the descriptive part.
   */
  const parsePromos = () => {
    const roomPromos = {};
    (order.promos || []).forEach(promoStr => {
      // Assuming promo strings are like: 'Room Name - Discount Details (Promo Title)'
      const parts = promoStr.split(' - ');
      if (parts.length >= 2) {
        const roomName = parts[0].trim();
        const details = parts.slice(1).join(' - ').trim(); // Full descriptive part

        if (!roomPromos[roomName]) {
          roomPromos[roomName] = [];
        }

        // Store the details part (e.g., "20% off (Launch Discount)")
        roomPromos[roomName].push(details);
      }
    });
    return roomPromos;
  };

  const roomPromos = parsePromos();
  
  return (
    <div className="px-4">
      <div className="bg-white text-black max-w-xl mx-auto rounded-lg shadow-lg p-6 font-mono border border-pink-600">
        <div className="text-center border-b border-dashed border-gray-400 pb-4 mb-4">
          <h2 className="text-xl font-bold text-pink-600">ORDER RECEIPT</h2>
          <p className="text-sm">Order ID: #{order.$id}</p>
          <p className="text-xs text-gray-500 mt-1">{new Date(order.created_at).toLocaleString()}</p>
        </div>

        <div className="text-sm mb-4">
          <p className="mb-1">Customer: <strong>{order.name || 'Unknown'}</strong></p>
          <p className="mb-1">Email: {order.email}</p>
          <div className="mt-2">
            Payment Status: {renderPaymentBadge(order.payment_status || "failed")}
          </div>
        </div>

        <div className="mb-4 border-t border-b border-gray-300 py-4 space-y-6">
          {Object.entries(groupedItems).map(([roomId, { roomName, items }]) => {
            const subtotal = getRoomSubtotal(items); // Base Subtotal (before room-level discount)
            const roomDiscount = getRoomDiscount(items); // Total discount for items in this room
            const roomFinalTotal = getRoomFinalTotal(items); // Final subtotal after discounts

            return (
              <div key={roomId} className="border-b border-gray-200 pb-4">
                <h3 className="text-base font-bold text-pink-500 mb-2">{roomName}</h3>
                <ul className="space-y-1 text-sm">
                  {items.map((item) => {
                    const itemRated = order.rated?.[item.index];
                    const itemRating = order.rating?.[item.index];
                    const itemComment = order.comment?.[item.index];
                    const itemPrice = Number(item.menuPrice);
                    const itemQuantity = item.quantity;
                    const itemBasePrice = itemPrice * itemQuantity;
                    const itemDiscount = Number(item.discountAmount) || 0;

                    return (
                      <li key={item.index}>
                        <div className="flex justify-between">
                          <span>{item.menuName} {item.size && `(${item.size})`} × {itemQuantity}</span>
                          <span>₱{itemBasePrice.toFixed(2)}</span>
                        </div>
                        {itemDiscount > 0 && (
                          <div className="flex justify-end text-xs text-red-500 italic">
                            Discount: -₱{itemDiscount.toFixed(2)}
                          </div>
                        )}
                        <div className="text-xs text-gray-500">Stall: {item.room_name || 'N/A'}</div>
                        <div className="mt-1">{renderStatusBadge(item.status || MENU_STATUS.PENDING)}</div>

                        {/* Conditionally hide the rating buttons if in read-only mode */}
                        {!isReadOnly && item.status === MENU_STATUS.COMPLETED && (
                          <div className="mt-2">
                            {itemRated ? (
                              <div className="text-xs text-green-600">
                                Rated:
                                <div className="flex gap-1 mt-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <FontAwesomeIcon
                                      key={star}
                                      icon={solidStar}
                                      className={itemRating >= star ? 'text-yellow-400' : 'text-gray-400'}
                                    />
                                  ))}
                                </div>
                                {itemComment && <p className="italic text-gray-600 mt-1">"{itemComment}"</p>}
                                <button
                                  onClick={() => openRatingModal(item.index)}
                                  className="mt-2 text-xs text-pink-600 underline hover:text-pink-700"
                                >
                                  Edit Rating
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => openRatingModal(item.index)}
                                className="mt-2 text-xs text-pink-600 underline hover:text-pink-700"
                              >
                                Rate Item
                              </button>
                            )}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>

                <div className="mt-2 text-sm">
                  <p>Base Subtotal: ₱{subtotal.toFixed(2)}</p>
                  {roomDiscount > 0 && <p className="text-red-500">Item Discount: -₱{roomDiscount.toFixed(2)}</p>}
                  <p className="font-semibold text-pink-500">Stall Total: ₱{roomFinalTotal.toFixed(2)}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">Base Total:</p>
          <p className="text-lg font-bold text-gray-800">₱{baseTotal.toFixed(2)}</p>

          {/* Displaying the total discount amount */}
          {discountAmount > 0 && (
            <div className="mt-2">
              <p className="text-sm text-gray-500">Total Discount:</p>
              <p className="text-lg font-bold text-red-500">-₱{discountAmount.toFixed(2)}</p>
            </div>
          )}

          {(Object.keys(roomPromos).length > 0) && (
            <div className="mt-4 text-sm text-left mx-auto max-w-xs text-gray-700">
              <p className="font-semibold text-center text-pink-500 mb-2">Applied Promos:</p>
              <ul className="space-y-3">
                {Object.entries(roomPromos).map(([roomName, promoDetails], idx) => {
                  const discountedItemCount = getDiscountedItemCount(roomName);

                  return (
                    <li key={idx}>
                      <p className="font-bold text-black border-b border-gray-300 pb-1">{roomName}</p>
                      <ul className="ml-2 mt-1 space-y-0.5">
                        {promoDetails.map((detail, detailIdx) => (
                          <li key={detailIdx} className="text-pink-600 italic text-xs">
                            {/* NEW LOGIC: Prepend the item count */}
                            &bull; **{discountedItemCount} Item{discountedItemCount !== 1 ? 's' : ''}** applied with {detail}
                          </li>
                        ))}
                      </ul>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <div className="mt-6">
            <p className="text-sm text-gray-500">Final Total:</p>
            <p className="text-lg font-bold text-pink-600">₱{finalTotal.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Conditionally hide the rating modal based on the prop */}
      {!isReadOnly && selectedItem !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70" aria-modal="true" role="dialog">
          <div className="bg-neutral-800 p-6 rounded-lg w-full max-w-md shadow-lg text-white">
            <h3 className="text-lg font-bold text-center mb-4 text-pink-500">Rate This Menu Item</h3>
            <div className="flex justify-center mb-4 gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-2xl transition ${rating >= star ? 'text-yellow-400' : 'text-gray-600'}`}
                  aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                >
                  <FontAwesomeIcon icon={solidStar} />
                </button>
              ))}
            </div>
            <textarea
              className="w-full bg-neutral-900 border border-neutral-700 rounded-md p-2 text-sm text-white"
              rows={3}
              placeholder="Leave a comment (optional)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={closeRatingModal} className="px-4 py-2 text-gray-400 hover:text-white text-sm">Cancel</button>
              <button onClick={handleSubmitRating} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md">
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderCard;
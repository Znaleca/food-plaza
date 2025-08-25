'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar as solidStar } from '@fortawesome/free-solid-svg-icons';
import updateRating from '@/app/actions/updateRating';

const MENU_STATUS = {
  ORDER_PLACED: 'order-placed',
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

const OrderCard = ({ order, setOrders }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const openRatingModal = (index) => {
    setSelectedItem(index);
    setRating(0);
    setComment('');
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

  const renderStatusBadge = (status) => {
    const base = 'px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase';
    const badgeColors = {
      [MENU_STATUS.ORDER_PLACED]: 'bg-blue-600',
      [MENU_STATUS.PREPARING]: 'bg-yellow-600',
      [MENU_STATUS.READY]: 'bg-purple-600',
      [MENU_STATUS.COMPLETED]: 'bg-green-600',
      [MENU_STATUS.CANCELLED]: 'bg-red-600',
      [MENU_STATUS.FAILED]: 'bg-gray-600',
    };

    const statusTextMap = {
      [MENU_STATUS.ORDER_PLACED]: 'Order Placed',
      [MENU_STATUS.PREPARING]: 'Preparing',
      [MENU_STATUS.READY]: 'Ready',
      [MENU_STATUS.COMPLETED]: 'Completed',
      [MENU_STATUS.CANCELLED]: 'Cancelled',
      [MENU_STATUS.FAILED]: 'Failed',
    };

    return (
      <span className={`${base} ${badgeColors[status] || 'bg-gray-600'} text-white`}>
        {statusTextMap[status] || 'Order Placed'}
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

        grouped[roomId].items.push({ ...item, index });
      } catch {
        // skip broken item
      }
    });
    return grouped;
  };

  const getRoomSubtotal = (items) =>
    items.reduce((sum, item) => sum + Number(item.menuPrice) * (item.quantity || 1), 0);

  const groupedItems = parseItemsGroupedByRoom();

  const baseTotal = Object.values(groupedItems).reduce(
    (acc, { items }) => acc + getRoomSubtotal(items),
    0
  );

  const finalTotal = Object.entries(groupedItems).reduce((acc, [roomId, { roomName, items }]) => {
    const subtotal = getRoomSubtotal(items);
    const promoEntry = (order.promos || []).find((p) => p.startsWith(roomName));
    let discount = 0;

    if (promoEntry) {
      const match = promoEntry.match(/(\d+)%/);
      if (match) discount = parseInt(match[1]);
    }

    const discounted = subtotal - (discount / 100) * subtotal;
    return acc + discounted;
  }, 0);

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
            const subtotal = getRoomSubtotal(items);
            const promoEntry = (order.promos || []).find((p) => p.startsWith(roomName));
            let discount = 0;
            let promoTitle = '';

            if (promoEntry) {
              const parts = promoEntry.split(' - ');
              const percentMatch = promoEntry.match(/(\d+)%/);
              if (parts.length === 2 && percentMatch) {
                promoTitle = parts[1].replace(/\((.*?)\)/, '').trim();
                discount = parseInt(percentMatch[1]);
              }
            }

            const discounted = subtotal - (discount / 100) * subtotal;

            return (
              <div key={roomId} className="border-b border-gray-200 pb-4">
                <h3 className="text-base font-bold text-pink-500 mb-2">{roomName}</h3>
                <ul className="space-y-1 text-sm">
                  {items.map((item) => {
                    const itemRated = order.rated?.[item.index];
                    const itemRating = order.rating?.[item.index];
                    const itemComment = order.comment?.[item.index];

                    return (
                      <li key={item.index}>
                        <div className="flex justify-between">
                          <span>{item.menuName} {item.size && `(${item.size})`} × {item.quantity}</span>
                          <span>₱{(item.menuPrice * item.quantity).toFixed(2)}</span>
                        </div>
                        <div className="text-xs text-gray-500">Stall: {item.room_name || 'N/A'}</div>
                        <div className="mt-1">{renderStatusBadge(item.status || MENU_STATUS.ORDER_PLACED)}</div>

                        {itemRated ? (
                          <div className="mt-1 text-xs text-green-600">
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
                          </div>
                        ) : item.status === MENU_STATUS.COMPLETED ? (
                          <button
                            onClick={() => openRatingModal(item.index)}
                            className="mt-2 text-xs text-pink-600 underline hover:text-pink-700"
                          >
                            Rate Item
                          </button>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>

                <div className="mt-2 text-sm">
                  <p>Subtotal: ₱{subtotal.toFixed(2)}</p>
                  {discount > 0 && <p className="text-green-500">Discount: {discount}% ({promoTitle})</p>}
                  <p className="font-semibold text-pink-500">Stall Total: ₱{discounted.toFixed(2)}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-500"> Base Total:</p>
          <p className="text-lg font-bold text-gray-800">₱{baseTotal.toFixed(2)}</p>

          {order.promos?.length > 0 && (
            <div className="mt-4 text-sm text-left mx-auto max-w-xs text-gray-700">
              <p className="font-semibold text-center text-pink-500 mb-2">Applied Promos:</p>
              <ul className="space-y-1">
                {order.promos.map((promo, idx) => {
                  const [stallName, details] = promo.split(' - ');
                  const discountMatch = details?.match(/(\d+)%/);
                  const discount = discountMatch ? `${discountMatch[1]}%` : '';
                  const titleMatch = details?.match(/\((.*?)\)/);
                  const title = titleMatch ? titleMatch[1] : '';

                  return (
                    <li key={idx} className="flex justify-between border-b border-dashed border-gray-300 pb-1">
                      <span className="font-medium text-black">{stallName}</span>
                      <span className="text-pink-600 font-semibold">
                        {discount} {title && `(${title})`}
                      </span>
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

      {selectedItem !== null && (
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

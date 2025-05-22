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
      [MENU_STATUS.PENDING]: 'bg-blue-600',
      [MENU_STATUS.PREPARING]: 'bg-yellow-600',
      [MENU_STATUS.READY]: 'bg-purple-600',
      [MENU_STATUS.COMPLETED]: 'bg-green-600',
      [MENU_STATUS.CANCELLED]: 'bg-red-600',
    };

    return (
      <span className={`${base} ${badgeColors[status] || 'bg-gray-600'} text-white`}>
        {status}
      </span>
    );
  };

  const totalAmount = Array.isArray(order.total)
    ? order.total[3] || order.total.at(-1) || 0
    : Number(order.total || 0);

  const tableNumbers = Array.isArray(order.tableNumber)
    ? order.tableNumber.join(', ')
    : order.tableNumber || 'N/A';

  return (
    <div className="px-4">
      <div className="bg-white text-black max-w-xl mx-auto rounded-lg shadow-lg p-6 font-mono border border-pink-600">
        <div className="text-center border-b border-dashed border-gray-400 pb-4 mb-4">
          <h2 className="text-xl font-bold text-pink-600">ORDER RECEIPT</h2>
          <p className="text-sm">Order ID: #{order.$id}</p>
          <p className="text-xs text-gray-500 mt-1">
            {new Date(order.created_at).toLocaleString()}
          </p>
        </div>

        <div className="text-sm mb-4">
          <p className="mb-1">Customer: <strong>{order.name || 'Unknown'}</strong></p>
          <p className="mb-1">Email: {order.email}</p>
          <p className="mb-1">Table(s): {tableNumbers}</p>
        </div>

        <div className="mb-4 border-t border-b border-gray-300 py-3 space-y-3">
          {order.items.map((itemStr, index) => {
            let item;
            try {
              item = JSON.parse(itemStr);
              item.status = item.status || MENU_STATUS.PENDING;
            } catch {
              item = { menuName: 'Invalid Item', status: MENU_STATUS.PENDING };
            }

            const itemRated = order.rated?.[index];
            const itemRating = order.rating?.[index];
            const itemComment = order.comment?.[index];

            return (
              <div key={index}>
                <div className="flex justify-between">
                  <span>{item.menuName}</span>
                  <span>₱{(Number(item.menuPrice) * (item.quantity || 1)).toFixed(2)}</span>
                </div>
                <div className="text-xs text-gray-500">
                  Qty: {item.quantity || 1} | Stall: {item.room_name || 'N/A'}
                </div>
                <div className="mt-1">{renderStatusBadge(item.status)}</div>

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
                    {itemComment && (
                      <p className="italic text-gray-600 mt-1">"{itemComment}"</p>
                    )}
                  </div>
                ) : item.status === MENU_STATUS.COMPLETED ? (
                  <button
                    onClick={() => openRatingModal(index)}
                    className="mt-2 text-xs text-pink-600 underline hover:text-pink-700"
                  >
                    Rate Item
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="text-right font-semibold text-base text-pink-600">
          Total: ₱{totalAmount.toFixed(2)}
        </div>
      </div>

      {/* Rating Modal */}
      {selectedItem !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
          aria-modal="true"
          role="dialog"
        >
          <div className="bg-neutral-800 p-6 rounded-lg w-full max-w-md shadow-lg text-white">
            <h3 className="text-lg font-bold text-center mb-4 text-pink-500">Rate This Menu Item</h3>
            <div className="flex justify-center mb-4 gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-2xl transition ${
                    rating >= star ? 'text-yellow-400' : 'text-gray-600'
                  }`}
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
              <button
                onClick={closeRatingModal}
                className="px-4 py-2 text-gray-400 hover:text-white text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitRating}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md"
              >
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

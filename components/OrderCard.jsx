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

  const openRatingModal = (itemIndex) => {
    setSelectedItem(itemIndex);
    setRating(0);
    setComment('');
  };

  const closeRatingModal = () => {
    setSelectedItem(null);
  };

  const handleSubmitRating = async () => {
    if (!rating || rating < 1 || rating > 5) {
      alert('Please give a rating between 1 and 5');
      return;
    }

    try {
      let currentRatings = order.rating || [];
      let currentComments = order.comment || [];
      let currentRatedStatus = order.rated || [];

      currentRatings[selectedItem] = rating;
      currentComments[selectedItem] = comment;
      currentRatedStatus[selectedItem] = true;

      await updateRating(order.$id, currentRatings, currentComments, currentRatedStatus);

      setOrders((prevOrders) =>
        prevOrders.map((o) =>
          o.$id === order.$id
            ? { ...o, rating: currentRatings, comment: currentComments, rated: currentRatedStatus }
            : o
        )
      );

      closeRatingModal();
      alert('Thank you for rating!');
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Failed to submit rating.');
    }
  };

  const renderStatusBadge = (status) => {
    const base = 'px-3 py-2 rounded-full text-xs font-semibold tracking-wide uppercase';
    const normalized = String(status).toLowerCase();

    const badgeMap = {
      [MENU_STATUS.PENDING]: 'bg-blue-100 text-blue-700',
      [MENU_STATUS.PREPARING]: 'bg-yellow-100 text-yellow-700',
      [MENU_STATUS.READY]: 'bg-purple-100 text-purple-700',
      [MENU_STATUS.COMPLETED]: 'bg-green-100 text-green-700',
      [MENU_STATUS.CANCELLED]: 'bg-red-100 text-red-700',
    };

    const style = badgeMap[normalized] || 'bg-gray-100 text-gray-700';

    return <span className={`${base} ${style}`}>{String(status).toUpperCase()}</span>;
  };

  const totalAmount = Array.isArray(order.total)
    ? order.total[3] || order.total.at(-1) || 0
    : Number(order.total || 0);

  const paidAmount = Array.isArray(order.pay_amount)
    ? order.pay_amount[0] || 0
    : Number(order.pay_amount || 0);

  // Extract table number(s)
  const tableNumbers = Array.isArray(order.tableNumber)
    ? order.tableNumber.join(', ') // Join table numbers if it's an array
    : order.tableNumber || 'N/A'; // Fallback to 'N/A' if no table number is found

  return (
    <div className="border rounded-xl p-6 bg-white shadow-lg transition hover:shadow-xl">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Order #{order.$id}</h2>
        <p className="text-sm text-gray-500">User: {order.name || 'Unknown'} ({order.email})</p>
        <p className="text-sm text-gray-400 mt-1">
          Created: {new Date(order.created_at).toLocaleString()}
        </p>
        {/* Display table numbers here */}
        <p className="text-sm text-gray-500 mt-2">Table(s): {tableNumbers}</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {order.items.map((itemString, index) => {
          let item;
          try {
            item = JSON.parse(itemString);
            item.status = item.status || MENU_STATUS.PENDING;
          } catch {
            item = { menuName: 'Invalid Item', status: MENU_STATUS.PENDING };
          }

          const itemRated = order.rated?.[index];
          const itemRating = order.rating?.[index];
          const itemComment = order.comment?.[index];

          return (
            <div
              key={index}
              className="p-5 rounded-xl border-2 border-pink-600 bg-white shadow-md hover:shadow-xl transition-all flex flex-col items-center text-center gap-3"
            >
              {item.menuImage && (
                <img
                  src={item.menuImage}
                  alt={item.menuName}
                  className="w-32 h-32 object-cover rounded-full border-2 border-gray-200 shadow-md"
                />
              )}
              <p className="font-semibold text-gray-800 text-lg">{item.menuName}</p>
              <p className="text-sm text-gray-600">
                ₱{(Number(item.menuPrice) * (item.quantity || 1)).toFixed(2)} — Qty: {item.quantity || 1}
              </p>

              {/* Render Room Name Per Menu Item */}
              <div className="text-sm text-gray-500 mt-2">
                Food Stall: {item.room_name || 'Unknown Room'}
              </div>

              <div>{renderStatusBadge(item.status)}</div>

              {itemRated ? (
                <div className="mt-2 text-sm text-green-600">
                  Rated:
                  <div className="flex justify-center gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FontAwesomeIcon
                        key={star}
                        icon={solidStar}
                        className={itemRating >= star ? 'text-yellow-400' : 'text-gray-300'}
                      />
                    ))}
                  </div>
                  {itemComment && <p className="italic text-gray-500 mt-1">"{itemComment}"</p>}
                </div>
              ) : (
                <button
                  onClick={() => openRatingModal(index)}
                  className="mt-2 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white text-sm font-medium rounded-full shadow transition-all duration-150 ease-in-out"
                >
                  Rate Item
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="text-right text-sm text-gray-800">
        <p className="font-semibold text-lg text-green-700">Total: ₱ {totalAmount.toFixed(2)}</p>
      </div>

      {/* Rating Modal */}
      {selectedItem !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
            <h3 className="text-lg font-bold text-center mb-4">Rate This Menu Item</h3>
            <div className="flex justify-center mb-4 gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-2xl transition ${
                    rating >= star ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                >
                  <FontAwesomeIcon icon={solidStar} />
                </button>
              ))}
            </div>
            <textarea
              className="w-full border rounded-md p-2 text-sm"
              rows={3}
              placeholder="Leave a comment (optional)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={closeRatingModal}
                className="px-4 py-2 text-gray-500 hover:text-gray-700 text-sm"
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

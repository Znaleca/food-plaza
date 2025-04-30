'use client';

import { useEffect, useState } from 'react';
import getUserOrders from '@/app/actions/getUserOrders';
import updateRating from '@/app/actions/updateRating';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar as solidStar } from '@fortawesome/free-solid-svg-icons';
import Heading from '@/components/Heading';


const OrderStatusPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // For rating modals
  const [selectedItem, setSelectedItem] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await getUserOrders();
        if (Array.isArray(data.orders)) {
          setOrders(data.orders);
        } else {
          throw new Error('Unexpected response format');
        }
      } catch (error) {
        console.error('Could not load orders:', error);
        setError('Could not load orders');
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  const openRatingModal = (orderId, itemIndex) => {
    setSelectedItem({ orderId, itemIndex });
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

    if (!selectedItem) return;

    const { orderId, itemIndex } = selectedItem;

    // Find the current order
    const orderToUpdate = orders.find((order) => order.$id === orderId);
    if (!orderToUpdate) {
      alert('Order not found');
      return;
    }

    try {
      let currentRatings = orderToUpdate.rating || [];
      let currentComments = orderToUpdate.comment || [];
      let currentRatedStatus = orderToUpdate.rated || [];

      if (!Array.isArray(currentRatings)) currentRatings = [];
      if (!Array.isArray(currentComments)) currentComments = [];
      if (!Array.isArray(currentRatedStatus)) currentRatedStatus = [];

      currentRatings[itemIndex] = rating;
      currentComments[itemIndex] = comment;
      currentRatedStatus[itemIndex] = true;

      await updateRating(orderId, currentRatings, currentComments, currentRatedStatus);

      setOrders((prevOrders) =>
        prevOrders.map((order) => {
          if (order.$id === orderId) {
            return {
              ...order,
              rating: currentRatings,
              comment: currentComments,
              rated: currentRatedStatus,
            };
          }
          return order;
        })
      );

      closeRatingModal();
      alert('Thank you for rating!');
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Failed to submit rating.');
    }
  };

  const renderStatusBadge = (status) => {
    // ✨ your previous code for renderStatusBadge
  };

  const renderPaymentStatusBadge = (paymentStatus) => {
    // ✨ your previous code for renderPaymentStatusBadge
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-5xl mx-auto bg-white shadow-md rounded-2xl p-8">
      <Heading title="My Orders" />

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : orders.length === 0 ? (
          <p className="text-gray-600">No orders found.</p>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const totalAmount = Array.isArray(order.total)
                ? order.total[3] || order.total.at(-1) || 0
                : Number(order.total || 0);

              const paidAmount = Array.isArray(order.pay_amount)
                ? order.pay_amount[0] || 0
                : Number(order.pay_amount || 0);

              return (
                <div key={order.$id} className="border rounded-lg p-4 bg-gray-50 shadow-sm">
                  <div className="mb-2">
                    <h2 className="text-lg font-semibold text-gray-700">Order ID: {order.$id}</h2>
                    <p className="text-sm text-gray-600">
                      User: {order.name || 'Unknown User'} ({order.email || 'Unknown Email'})
                    </p>
                  </div>

                  <p className="text-sm text-gray-500">
                    Created at: {new Date(order.created_at).toLocaleString()}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 my-1">
                    <p className="text-sm">Status: {renderStatusBadge(order.status)}</p>
                    <p className="text-sm">Payment: {renderPaymentStatusBadge(order.payment_status)}</p>
                  </div>

                  <div className="text-sm text-gray-700 font-semibold mb-3">
                    {Array.isArray(order.spaces) ? (
                      order.spaces.map((space, i) => (
                        <div key={i}>Space: {space?.name || 'Unnamed Space'}</div>
                      ))
                    ) : (
                      <div>Space: {order.spaces?.name || order.spaces || 'N/A'}</div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {order.items.map((itemString, index) => {
                      let item;
                      try {
                        item = JSON.parse(itemString);
                      } catch (e) {
                        item = { menuName: 'Invalid Item' };
                      }

                      const itemRated = order.rated?.[index];
                      const itemRating = order.rating?.[index];
                      const itemComment = order.comment?.[index];

                      return (
                        <div key={index} className="border p-3 rounded-md bg-white flex flex-col gap-2">
                          {item.menuImage && (
                            <img
                              src={item.menuImage}
                              alt={item.menuName}
                              className="w-24 h-24 object-cover mb-2"
                            />
                          )}
                          <p className="font-medium">{item.menuName}</p>
                          <p className="text-sm text-gray-600">
                            ₱{(Number(item.menuPrice) * Number(item.quantity || 1)).toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity || 1}</p>

                          {itemRated ? (
  <div className="text-sm text-green-600">
    Rated:{' '}
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((starValue) => (
        <FontAwesomeIcon
          key={starValue}
          icon={solidStar}
          className={itemRating >= starValue ? 'text-yellow-400' : 'text-gray-300'}
        />
      ))}
    </div>
    - "{itemComment}"
  </div>
) : (
  <button
    onClick={() => openRatingModal(order.$id, index)}
    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs"
  >
    Rate
  </button>
)}

                        </div>
                      );
                    })}
                  </div>

                  <div className="text-right mt-4 space-y-1">
                    <p className="text-lg font-semibold text-green-700">
                      Total: ₱{totalAmount.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-700">
                      Paid: ₱{paidAmount.toFixed(2)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Popup Modal */}
        {selectedItem && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
    <div className="bg-white rounded-lg p-6 w-full max-w-md">
      <h2 className="text-xl font-bold mb-4 text-center">Rate this Menu Item</h2>
      <div className="space-y-4">

        {/* Star Rating */}
        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((starValue) => (
            <button
              key={starValue}
              onClick={() => setRating(starValue)}
              className="text-yellow-400 text-4xl focus:outline-none"
            >
              <FontAwesomeIcon
                icon={solidStar}
                className={rating >= starValue ? 'text-yellow-400' : 'text-gray-300'}
              />
            </button>
          ))}
        </div>

        {/* Comment Box */}
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="border p-2 rounded w-full"
          placeholder="Leave a comment..."
        ></textarea>

        {/* Buttons */}
        <div className="flex justify-end gap-2">
          <button
            onClick={closeRatingModal}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmitRating}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Submit
          </button>
        </div>

      </div>
    </div>
  </div>
)}

      </div>
    </div>
  );
};

export default OrderStatusPage;

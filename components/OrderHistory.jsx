'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar as solidStar, faCheckCircle, faClock, faHourglassHalf, faTimesCircle, faExclamationCircle, faBan, faReceipt, faXmark, faStore } from '@fortawesome/free-solid-svg-icons'; 
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

// Helper function to safely parse a JSON string from the stallReviews array
const safeParseStallReview = (reviewStr) => {
    try {
        return JSON.parse(reviewStr);
    } catch (e) {
        return null;
    }
}


const OrderHistory = ({ order, setOrders, isReadOnly = false }) => {
  // Item-level rating state
  const [selectedItem, setSelectedItem] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  
  // *** Stall-level rating state ***
  const [selectedStallId, setSelectedStallId] = useState(null);
  const [stallRating, setStallRating] = useState(0);
  const [stallComment, setStallComment] = useState('');

  const tableNumber = order.tableNumber?.[0] || 'N/A';

  // --- Item Rating Logic (Unchanged) ---
  const openRatingModal = (index) => {
    setSelectedItem(index);
    
    const initialRating = (order.rating && order.rating[index] > 0) ? order.rating[index] : 0;
    const initialComment = (order.comment && order.comment[index]) || '';
    
    setRating(initialRating);
    setComment(initialComment);
  };

  const closeRatingModal = () => {
    setSelectedItem(null);
    setRating(0);
    setComment('');
  };

  const handleSubmitRating = async () => {
    if (rating < 1 || rating > 5) {
      alert('Please give a rating between 1 and 5');
      return;
    }

    try {
      const totalItems = (order.items || []).length;
      
      const updatedRatings = Array.from({ length: totalItems }, (_, index) => {
        if (index === selectedItem) {
          return rating;
        }
        const existingRating = order.rating?.[index];
        return (typeof existingRating === 'number' && existingRating >= 1 && existingRating <= 5)
          ? existingRating 
          : null;
      });

      const updatedComments = [...(order.comment || [])];
      updatedComments.length = totalItems;
      updatedComments[selectedItem] = comment || null;
      
      const updatedRated = [...(order.rated || [])];
      updatedRated.length = totalItems;
      updatedRated[selectedItem] = true;

      await updateRating(order.$id, {
          item: {
              ratings: updatedRatings,
              comments: updatedComments,
              ratedStatus: updatedRated,
          }
      });

      setOrders((prevOrders) =>
        prevOrders.map((o) =>
          o.$id === order.$id
            ? { ...o, rating: updatedRatings, comment: updatedComments, rated: updatedRated }
            : o
        )
      );

      closeRatingModal();
      alert('Thank you for your item rating!');
    } catch (error) {
      console.error('Error submitting item rating:', error);
      alert('Failed to submit item rating.');
    }
  };
  // -----------------------------


  // --- Stall Rating Logic ---
  const openStallRatingModal = (stallId) => {
    setSelectedItem(null); 
    setSelectedStallId(stallId);
    
    const parsedReviews = (order.stallReviews || [])
        .map(safeParseStallReview)
        .filter(r => r !== null);
    
    const stallReview = parsedReviews.find(r => r.roomId === stallId) || {};

    setStallRating(stallReview.rating || 0);
    setStallComment(stallReview.comment || '');
  };

  const closeStallRatingModal = () => {
    setSelectedStallId(null);
    setStallRating(0);
    setStallComment('');
  };

  // 🔴 UPDATED FUNCTION
  const handleSubmitStallRating = async () => {
    if (stallRating < 1 || stallRating > 5) {
      alert('Please give a rating between 1 and 5');
      return;
    }

    try {
      const roomData = groupedItems[selectedStallId];
      if (!roomData) {
          throw new Error("Stall data not found.");
      }
      
      // --- STALL DATA PREPARATION (Unchanged) ---
      const newStallReviewObject = {
        roomId: selectedStallId,
        roomName: roomData.roomName,
        rating: stallRating,
        comment: stallComment,
        user_id: order.user_id,
        rated_at: new Date().toISOString(),
      };
      
      const parsedReviews = (order.stallReviews || [])
        .map(safeParseStallReview)
        .filter(r => r !== null);

      const updatedStallReviewObjects = [
        ...parsedReviews.filter(r => r.roomId !== selectedStallId),
        newStallReviewObject,
      ];
      
      const updatedStallReviewsStrings = updatedStallReviewObjects.map(obj => JSON.stringify(obj));

      // --- 🟢 BUNDLE ITEM DATA FOR VALIDATION (THE FIX) ---
      // We must send the existing item rating data (sanitized) to pass Appwrite's validation.
      const totalItems = (order.items || []).length;

      // Sanitize item ratings: ensure any 0 or invalid values are converted to null.
      const sanitizedItemRatings = Array.from({ length: totalItems }, (_, index) => {
        const existingRating = order.rating?.[index];
        return (typeof existingRating === 'number' && existingRating >= 1 && existingRating <= 5)
          ? existingRating
          : null;
      });

      // Ensure other item arrays have the correct length.
      const sanitizedItemComments = [...(order.comment || [])];
      sanitizedItemComments.length = totalItems;

      const sanitizedItemRatedStatus = [...(order.rated || [])];
      sanitizedItemRatedStatus.length = totalItems;
      // --- End of Fix ---

      // 🟢 SEND COMBINED PAYLOAD
      await updateRating(order.$id, {
          // Stall data
          stall: {
              reviews: updatedStallReviewsStrings
          },
          // Item data (to pass validation)
          item: {
              ratings: sanitizedItemRatings,
              comments: sanitizedItemComments,
              ratedStatus: sanitizedItemRatedStatus,
          }
      });

      setOrders((prevOrders) =>
        prevOrders.map((o) =>
          o.$id === order.$id
            ? { ...o, stallReviews: updatedStallReviewsStrings }
            : o
        )
      );

      closeStallRatingModal();
      alert(`Thank you for rating ${roomData.roomName}!`);
    } catch (error) {
      console.error('Error submitting stall rating:', error);
      alert('Failed to submit stall rating.');
    }
  };
  // -----------------------------


  // --- Status Rendering (Unchanged) ---
  const renderStatus = (status) => {
    const statusMap = {
      [MENU_STATUS.PENDING]: { text: 'Pending', icon: faClock, color: 'text-gray-400' },
      [MENU_STATUS.PREPARING]: { text: 'Preparing', icon: faHourglassHalf, color: 'text-yellow-400' },
      [MENU_STATUS.READY]: { text: 'Ready', icon: faCheckCircle, color: 'text-cyan-400' }, 
      [MENU_STATUS.COMPLETED]: { text: 'Completed', icon: faCheckCircle, color: 'text-green-500' },
      [MENU_STATUS.CANCELLED]: { text: 'Cancelled', icon: faTimesCircle, color: 'text-fuchsia-400' }, 
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
  // -----------------------------------


  // --- Item Grouping and Stall Status Check (Unchanged) ---
  const parseItemsGroupedByRoom = () => {
    const grouped = {};
    const items = (order.items || []).map((itemStr, index) => {
        try {
            return { ...JSON.parse(itemStr), index };
        } catch {
            return null;
        }
    }).filter(item => item !== null);
    
    const parsedReviews = (order.stallReviews || [])
        .map(safeParseStallReview)
        .filter(r => r !== null);

    items.forEach((item) => {
      const roomId = item.room_id || 'unknown';
      const roomName = item.room_name || 'Unknown Stall';
      const itemRated = order.rated?.[item.index];
      
      if (!grouped[roomId]) {
        grouped[roomId] = {
          roomName,
          items: [],
          totalCompleted: 0,
          totalToRate: 0, 
          totalRated: 0,
        };
      }
      
      grouped[roomId].items.push(item);
      
      if (item.status === MENU_STATUS.COMPLETED) {
          grouped[roomId].totalToRate += 1;
          grouped[roomId].totalCompleted += 1;
          if (itemRated) {
              grouped[roomId].totalRated += 1;
          }
      }
    });

    Object.keys(grouped).forEach(roomId => {
        const stallReview = parsedReviews.find(r => r.roomId === roomId);
        grouped[roomId].isStallRated = !!stallReview;
        grouped[roomId].stallRating = stallReview?.rating || 0;
        grouped[roomId].isReadyForStallReview = grouped[roomId].totalToRate > 0 && grouped[roomId].totalRated === grouped[roomId].totalToRate;
    });

    return grouped;
  };

  const groupedItems = parseItemsGroupedByRoom();
  
  const completedItemGroups = Object.entries(groupedItems)
    .filter(([, { totalCompleted }]) => totalCompleted > 0);
  
  const hasCompletedItems = completedItemGroups.length > 0;
  
  if (!hasCompletedItems) {
      return null;
  }

  // --- JSX REMAINS UNCHANGED FROM HERE DOWN ---
  return (
    <div className="w-full">
      <div className="bg-neutral-900 text-white w-full rounded-xl border border-neutral-700 p-6 sm:p-8 shadow-2xl shadow-neutral-950/50">
        <div className="pb-6 mb-6 border-b border-neutral-700">
          <div className="flex justify-between items-start mb-1">
            <h2 className="text-3xl font-extrabold tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-500 to-cyan-400">
                  ORDER - #
              </span>
              <span className="text-white ml-1">
                  {order.$id.slice(-8)}
              </span>
            </h2>
          </div>
          <p className="text-sm text-gray-400 mb-4">{new Date(order.created_at).toLocaleString()}</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
                <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Payment Status</p>
                {renderPaymentStatus(order.payment_status || "failed")}
            </div>
            <div className='flex flex-col items-end'>
                <p className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Table</p>
                <div className="flex items-center space-x-1 text-2xl font-semibold">
                    <span className="text-cyan-400 mr-1">#</span>
                    <span className="text-white">{tableNumber}</span>
                </div>
            </div>
          </div>
        </div>

        <div className="mb-6 space-y-8">
          <h3 className="text-xl font-semibold text-gray-300">
            Completed Items Ready for Rating
          </h3>
          {completedItemGroups.map(([roomId, { roomName, items, isReadyForStallReview, isStallRated, stallRating, totalRated, totalToRate }]) => (
              <div key={roomId} className="rounded-lg p-4 bg-neutral-800 border border-neutral-700 shadow-inner shadow-neutral-950/30">
                <div className="mb-4 pb-2 border-b border-neutral-700 flex justify-between items-center flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faStore} className="w-5 h-5 text-fuchsia-400" />
                        <h4 className="text-lg font-bold text-gray-100">{roomName}</h4>
                    </div>
                    <div className='flex items-center gap-4'>
                        {!isReadOnly && (
                            <div className="flex-shrink-0">
                                {isReadyForStallReview ? (
                                    isStallRated ? (
                                        <div className="flex flex-col items-end">
                                            <span className="text-xs text-green-500 font-medium">Stall Rated:</span>
                                            <div className="flex gap-1 mt-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <FontAwesomeIcon
                                                        key={star}
                                                        icon={solidStar}
                                                        className={stallRating >= star ? 'text-cyan-400' : 'text-neutral-600'}
                                                        size="sm"
                                                    />
                                                ))}
                                            </div>
                                            <button
                                                onClick={() => openStallRatingModal(roomId)}
                                                className="mt-2 text-xs text-cyan-400 hover:text-cyan-300 transition"
                                            >
                                                (Edit Stall Review)
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => openStallRatingModal(roomId)}
                                            className="px-3 py-1 bg-gradient-to-r from-cyan-400 to-fuchsia-500 hover:from-cyan-500 hover:to-fuchsia-600 text-white text-xs font-medium rounded-full transition duration-150 shadow-md shadow-cyan-400/30"
                                        >
                                            Rate Stall
                                        </button>
                                    )
                                ) : (
                                    <span className="text-xs text-yellow-400 font-medium italic">
                                        ({totalRated}/{totalToRate} items rated)
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.filter(item => item.status === MENU_STATUS.COMPLETED).map((item) => {
                    const itemRated = order.rated?.[item.index];
                    const itemRating = order.rating?.[item.index];
                    const itemQuantity = item.quantity;
                    return (
                      <div
                        key={item.index}
                        className="relative border border-neutral-700 rounded-md bg-neutral-900 p-4 flex flex-col items-center text-center transition-all duration-300"
                      >
                        {item.menuImage && (
                          <div className="flex-shrink-0 w-20 h-20 rounded-full overflow-hidden relative mb-2 border border-neutral-600">
                            <Image 
                              src={item.menuImage}
                              alt={item.menuName}
                              width={80} 
                              height={80} 
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-grow w-full">
                          <p className="font-semibold text-white text-base leading-snug">
                              {item.menuName} {item.size && <span className="text-gray-400 font-normal">({item.size})</span>}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                              Qty: <span className="font-bold text-cyan-400">{itemQuantity}</span>
                          </p>
                          <div className="mt-4 pt-3 border-t border-neutral-700">
                              <div className="mb-3">
                                  {renderStatus(item.status || MENU_STATUS.COMPLETED)}
                              </div>
                              <div>
                                  {!isReadOnly && item.status === MENU_STATUS.COMPLETED && (
                                    <div className="text-right">
                                      {itemRated ? (
                                        <div className="flex flex-col items-center">
                                          <span className="text-xs text-green-500 font-medium">Your Rating:</span>
                                          <div className="flex gap-1 mt-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                              <FontAwesomeIcon
                                                key={star}
                                                icon={solidStar}
                                                className={itemRating >= star ? 'text-fuchsia-400' : 'text-neutral-600'}
                                                size="sm"
                                              />
                                            ))}
                                          </div>
                                          <button
                                            onClick={() => openRatingModal(item.index)}
                                            className="mt-2 text-xs text-cyan-400 hover:text-cyan-300 transition"
                                          >
                                            (Edit Item Rating)
                                          </button>
                                        </div>
                                      ) : (
                                        <button
                                          onClick={() => openRatingModal(item.index)}
                                          className="w-full px-4 py-2 bg-gradient-to-r from-fuchsia-500 to-cyan-400 hover:from-fuchsia-600 hover:to-cyan-500 text-white text-sm font-medium rounded-full transition duration-150 shadow-md shadow-fuchsia-500/30"
                                        >
                                          Rate Item
                                        </button>
                                      )}
                                    </div>
                                  )}
                              </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
        </div>
        <div className="pt-6 mt-6 border-t border-neutral-700 text-center">
            <p className="text-base text-gray-400 font-light">
                Thank you for your order!
            </p>
        </div>
      </div>
      
      {/* Modals are unchanged */}
      {!isReadOnly && selectedItem !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950 bg-opacity-70 backdrop-blur-sm p-4" aria-modal="true" role="dialog">
            <div className="bg-neutral-900 p-8 rounded-xl w-full max-w-md border border-fuchsia-500/50 shadow-2xl shadow-fuchsia-500/20 transition-all duration-300 scale-100 ease-out">
                <button 
                    onClick={closeRatingModal} 
                    className="absolute top-4 right-4 text-gray-500 hover:text-white transition"
                    aria-label="Close item rating modal"
                >
                    <FontAwesomeIcon icon={faXmark} className="w-5 h-5" />
                </button>
                <h3 className="text-2xl font-semibold text-center mb-5 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-fuchsia-500">
                    Rate Item
                </h3>
                <div className="flex justify-center mb-6 gap-4">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`text-4xl transition transform hover:scale-110 ${rating >= star ? 'text-fuchsia-400 drop-shadow-lg drop-shadow-fuchsia-500/30' : 'text-neutral-600 hover:text-neutral-500'}`}
                    aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                    >
                    <FontAwesomeIcon icon={solidStar} />
                    </button>
                ))}
                </div>
                <textarea
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 text-base text-gray-200 focus:ring-cyan-400 focus:border-cyan-400 transition-all placeholder-gray-500 resize-none"
                rows={3}
                placeholder="Leave a comment (optional)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                />
                <div className="mt-6 flex justify-end gap-3">
                <button
                    onClick={closeRatingModal}
                    className="px-5 py-2 text-gray-400 hover:text-white text-sm font-medium border border-neutral-700 hover:border-cyan-400 rounded-lg transition duration-200"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSubmitRating}
                    className="px-5 py-2 bg-gradient-to-r from-fuchsia-500 to-cyan-400 hover:from-fuchsia-600 hover:to-cyan-500 text-white text-sm font-semibold rounded-lg transition duration-200 shadow-md shadow-fuchsia-500/30"
                >
                    Submit Rating
                </button>
                </div>
            </div>
        </div>
      )}
      {!isReadOnly && selectedStallId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950 bg-opacity-70 backdrop-blur-sm p-4" aria-modal="true" role="dialog">
            <div className="bg-neutral-900 p-8 rounded-xl w-full max-w-md border border-cyan-500/50 shadow-2xl shadow-cyan-500/20 transition-all duration-300 scale-100 ease-out">
                <button 
                    onClick={closeStallRatingModal} 
                    className="absolute top-4 right-4 text-gray-500 hover:text-white transition"
                    aria-label="Close stall rating modal"
                >
                    <FontAwesomeIcon icon={faXmark} className="w-5 h-5" />
                </button>
                <h3 className="text-2xl font-semibold text-center mb-5 bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-500 to-cyan-400">
                    Rate {groupedItems[selectedStallId]?.roomName || 'Stall'}
                </h3>
                <div className="flex justify-center mb-6 gap-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            onClick={() => setStallRating(star)}
                            className={`text-4xl transition transform hover:scale-110 ${stallRating >= star ? 'text-cyan-400 drop-shadow-lg drop-shadow-cyan-500/30' : 'text-neutral-600 hover:text-neutral-500'}`}
                            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                        >
                            <FontAwesomeIcon icon={solidStar} />
                        </button>
                    ))}
                </div>
                <textarea
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 text-base text-gray-200 focus:ring-fuchsia-400 focus:border-fuchsia-400 transition-all placeholder-gray-500 resize-none"
                    rows={3}
                    placeholder="Leave a comment for the stall (optional)"
                    value={stallComment}
                    onChange={(e) => setStallComment(e.target.value)}
                />
                <div className="mt-6 flex justify-end gap-3">
                    <button
                        onClick={closeStallRatingModal}
                        className="px-5 py-2 text-gray-400 hover:text-white text-sm font-medium border border-neutral-700 hover:border-fuchsia-400 rounded-lg transition duration-200"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmitStallRating}
                        className="px-5 py-2 bg-gradient-to-r from-cyan-400 to-fuchsia-500 hover:from-cyan-500 hover:to-fuchsia-600 text-white text-sm font-semibold rounded-lg transition duration-200 shadow-md shadow-cyan-500/30"
                    >
                        Submit Stall Review
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
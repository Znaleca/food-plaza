'use client';

import { useEffect, useState } from 'react';
import getAllReviews from '@/app/actions/getAllReviews';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar as solidStar } from '@fortawesome/free-solid-svg-icons';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

const RateCard = () => {
  const [groupedReviews, setGroupedReviews] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedRooms, setExpandedRooms] = useState({});

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const data = await getAllReviews();
        if (!Array.isArray(data.orders)) {
          throw new Error('Unexpected response format');
        }

        const grouped = {};

        data.orders.forEach((order) => {
          const { items, rated, rating, comment } = order;

          items.forEach((itemString, index) => {
            if (!rated?.[index]) return;

            let item;
            try {
              item = JSON.parse(itemString);
            } catch {
              item = { menuName: 'Invalid Item', room_name: 'Unknown' };
            }

            const room = item.room_name || 'Unknown';
            if (!grouped[room]) grouped[room] = [];

            grouped[room].push({
              orderId: order.$id,
              user: order.name || 'Unknown',
              email: order.email || 'N/A',
              item,
              rating: rating?.[index],
              comment: comment?.[index],
            });
          });
        });

        setGroupedReviews(grouped);
      } catch (error) {
        console.error('Could not load reviews:', error);
        setError('Could not load reviews');
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, []);

  const calculateAverageRating = (reviews) => {
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;
    const percentage = Math.round((averageRating / 5) * 100);
    return { averageRating, percentage };
  };

  const renderStarRating = (ratingValue) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <FontAwesomeIcon
          key={star}
          icon={solidStar}
          className={ratingValue >= star ? 'text-yellow-400' : 'text-gray-300'}
        />
      ))}
    </div>
  );

  const handleToggleExpand = (roomName) => {
    setExpandedRooms((prevState) => ({
      ...prevState,
      [roomName]: !prevState[roomName],
    }));
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : Object.keys(groupedReviews).length === 0 ? (
        <p className="text-gray-500">No reviews found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(groupedReviews).map(([roomName, reviews]) => {
            const { averageRating, percentage } = calculateAverageRating(reviews);

            const chartData = reviews.map((review, i) => ({
              index: i + 1,
              rating: review.rating,
            }));

            return (
              <div key={roomName} className="bg-gray-50 border rounded-xl shadow p-5">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold text-gray-700">{roomName}</h2>
                  <div className="flex items-center gap-2 text-sm">
                    {renderStarRating(averageRating)}
                    <span className="text-gray-500">({percentage}%)</span>
                  </div>
                </div>

                {/* Mini Wave Chart */}
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="miniChart" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="index" hide />
                      <YAxis domain={[0, 5]} hide />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="rating"
                        stroke="#3b82f6"
                        fill="url(#miniChart)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Toggle */}
                <button
                  onClick={() => handleToggleExpand(roomName)}
                  className="text-sm text-blue-500 hover:underline mt-3"
                >
                  {expandedRooms[roomName] ? 'Hide Reviews' : 'View More'}
                </button>

                {/* Expanded Reviews */}
                {expandedRooms[roomName] && (
                  <div className="mt-4 grid grid-cols-1 gap-4">
                    {reviews.map((review, idx) => (
                      <div
                        key={idx}
                        className="bg-white border rounded-lg p-4 shadow-sm flex flex-col gap-2"
                      >
                        <h3 className="font-semibold text-gray-700">{review.item.menuName}</h3>
                        <p className="text-xs text-gray-500">Order ID: {review.orderId}</p>
                        <p className="text-xs text-gray-500">
                          Reviewed by: {review.user} ({review.email})
                        </p>
                        {review.item.menuImage && (
                          <img
                            src={review.item.menuImage}
                            alt={review.item.menuName}
                            className="w-24 h-24 object-cover rounded-md"
                          />
                        )}
                        <p className="text-sm text-gray-600">
                          ₱{(Number(review.item.menuPrice) * Number(review.item.quantity || 1)).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600">Quantity: {review.item.quantity || 1}</p>
                        <div className="mt-2">{renderStarRating(review.rating)}</div>
                        <p className="italic text-gray-700 mt-1">"{review.comment}"</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RateCard;

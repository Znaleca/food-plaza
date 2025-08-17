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
          className={ratingValue >= star ? 'text-yellow-400' : 'text-neutral-600'}
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
    <div className="w-full min-h-screen bg-neutral-900 text-white overflow-x-hidden px-4 sm:px-6 py-16">
      {loading ? (
        <p className="text-neutral-400">Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : Object.keys(groupedReviews).length === 0 ? (
        <p className="text-neutral-400">No reviews found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(groupedReviews).map(([roomName, reviews]) => {
            const { averageRating, percentage } = calculateAverageRating(reviews);

            const chartData = reviews.map((review, i) => ({
              index: i + 1,
              rating: review.rating,
            }));

            return (
              <div
                key={roomName}
                className="bg-neutral-950 border border-neutral-700 rounded-xl shadow-lg p-6 hover:border-pink-600 transition-all"
              >
                <div className="w-16 h-0.5 bg-pink-600 mb-4 mx-auto" />

                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl sm:text-2xl font-semibold text-white uppercase tracking-wider">
                    {roomName}
                  </h2>
                  <div className="flex items-center gap-2 text-sm">
                    {renderStarRating(averageRating)}
                    <span className="text-neutral-400">
                      {percentage}% ({reviews.length})
                    </span>
                  </div>
                </div>

                <div className="h-32 mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="miniChart" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="index" hide />
                      <YAxis domain={[0, 5]} hide />
                      <Tooltip contentStyle={{ backgroundColor: "#1f2937", borderColor: "#ec4899" }} />
                      <Area
                        type="monotone"
                        dataKey="rating"
                        stroke="#ec4899"
                        fill="url(#miniChart)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <button
                  onClick={() => handleToggleExpand(roomName)}
                  className="text-sm text-pink-500 hover:underline mt-4"
                >
                  {expandedRooms[roomName] ? 'Hide Reviews' : 'View More'}
                </button>

                {expandedRooms[roomName] && (
                  <div className="mt-4 grid grid-cols-1 gap-4">
                    {reviews.map((review, idx) => (
                      <div
                        key={idx}
                        className="bg-neutral-900 border border-neutral-700 rounded-lg p-4 shadow-sm flex flex-col gap-2"
                      >
                        <h3 className="font-semibold text-white">{review.item.menuName}</h3>
                        <p className="text-xs text-neutral-500">Order ID: {review.orderId}</p>
                        <p className="text-xs text-neutral-500">
                          Reviewed by: {review.user} ({review.email})
                        </p>
                        {review.item.menuImage && (
                          <img
                            src={review.item.menuImage}
                            alt={review.item.menuName || 'Menu Item'}
                            className="w-24 h-24 object-cover rounded-md"
                          />
                        )}
                        <p className="text-sm text-neutral-300">
                          ₱
                          {(
                            Number(review.item.menuPrice) *
                            Number(review.item.quantity || 1)
                          ).toFixed(2)}
                        </p>
                        <p className="text-sm text-neutral-300">
                          Quantity: {review.item.quantity || 1}
                        </p>
                        <div className="mt-1">{renderStarRating(review.rating)}</div>
                        <p className="italic text-pink-400 mt-2">"{review.comment}"</p>
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

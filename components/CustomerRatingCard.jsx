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

const CustomerRatingCard = ({ roomName }) => {
  const [reviews, setReviews] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const data = await getAllReviews();
        if (!Array.isArray(data.orders)) throw new Error('Invalid review format');

        const filtered = [];

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

            if (item.room_name === roomName) {
              filtered.push({
                orderId: order.$id,
                user: order.name || 'Unknown',
                email: order.email || 'N/A',
                item,
                rating: rating?.[index],
                comment: comment?.[index],
              });
            }
          });
        });

        setReviews(filtered);
      } catch (error) {
        console.error('Error loading reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, [roomName]);

  const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / (reviews.length || 1);
  const percentage = Math.round((averageRating / 5) * 100);
  const chartData = reviews.map((r, i) => ({ index: i + 1, rating: r.rating }));

  const renderStarRating = (value) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <FontAwesomeIcon
          key={star}
          icon={solidStar}
          className={value >= star ? 'text-yellow-400' : 'text-neutral-600'}
        />
      ))}
    </div>
  );

  if (loading) return <p className="text-sm text-neutral-400">Loading ratings...</p>;
  if (reviews.length === 0) return <p className="text-sm text-neutral-500">No reviews yet.</p>;

  return (
    <div className="mt-10 bg-neutral-900 text-white p-8 rounded-xl border border-neutral-700 shadow-lg hover:shadow-2xl transition-all duration-300">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          {renderStarRating(averageRating)}
          <span className="text-neutral-400 text-sm">
  {percentage}% ({reviews.length})
</span>
        </div>
        <button
          onClick={() => setExpanded((prev) => !prev)}
          className="text-sm text-pink-400 hover:underline"
        >
          {expanded ? 'Hide Reviews' : 'View More'}
        </button>
      </div>

      {/* Mini Chart */}
      <div className="h-36 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="miniChart" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#db2777" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#db2777" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="index" hide />
            <YAxis domain={[0, 5]} hide />
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
              labelStyle={{ color: '#f9fafb' }}
            />
            <Area
              type="monotone"
              dataKey="rating"
              stroke="#db2777"
              fill="url(#miniChart)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {expanded && (
        <div className="grid grid-cols-1 gap-6">
          {reviews.map((review, idx) => (
            <div
              key={idx}
              className="bg-neutral-800 border border-neutral-700 rounded-lg p-6 shadow-sm hover:shadow-lg transition-all duration-300"
            >
              <h4 className="font-semibold text-pink-400">{review.item.menuName}</h4>
              <p className="text-xs text-neutral-500">Order ID: {review.orderId}</p>
              <p className="text-xs text-neutral-500">
                Reviewed by: {review.user} ({review.email})
              </p>
              {review.item.menuImage && (
                <img
                  src={review.item.menuImage}
                  alt={review.item.menuName}
                  className="w-24 h-24 object-cover rounded-md my-2 shadow-md"
                />
              )}
              <p className="text-sm text-neutral-300">
                ₱{(Number(review.item.menuPrice) * Number(review.item.quantity || 1)).toFixed(2)}
              </p>
              <p className="text-sm text-neutral-400">Quantity: {review.item.quantity || 1}</p>
              <div className="mt-2">{renderStarRating(review.rating)}</div>
              <p className="italic text-neutral-300 mt-2">"{review.comment}"</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerRatingCard;

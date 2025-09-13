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
import { motion, AnimatePresence } from 'framer-motion';

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

  const averageRating =
    reviews.reduce((sum, r) => sum + r.rating, 0) / (reviews.length || 1);
  const percentage = Math.round((averageRating / 5) * 100);
  const chartData = reviews.map((r, i) => ({ index: i + 1, rating: r.rating }));

  const renderStarRating = (value, size = "sm") => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <FontAwesomeIcon
          key={star}
          icon={solidStar}
          className={`${value >= star ? 'text-yellow-400' : 'text-neutral-600'} ${size === "lg" ? "text-xl" : "text-sm"}`}
        />
      ))}
    </div>
  );

  if (loading)
    return <p className="text-sm text-neutral-400">Loading ratings...</p>;
  if (reviews.length === 0)
    return <p className="text-sm text-neutral-500">No reviews yet.</p>;

  return (
    <div className="mt-10 bg-gradient-to-b from-neutral-900 to-neutral-950 text-white p-8 rounded-2xl border border-neutral-800 shadow-xl hover:shadow-2xl transition-all duration-300">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex items-center gap-2">
            {renderStarRating(averageRating, "lg")}
            <span className="text-lg font-semibold text-pink-400">
              {averageRating.toFixed(1)}/5
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Based on {reviews.length} reviews • {percentage}% positive
          </p>
        </div>
        <button
          onClick={() => setExpanded((prev) => !prev)}
          className="px-3 py-1 text-sm rounded-lg border border-pink-500 text-pink-400 hover:bg-pink-500/10 transition"
        >
          {expanded ? 'Hide Reviews' : 'View Reviews'}
        </button>
      </div>

      {/* Mini Chart */}
      <div className="h-32 mb-6">
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
              contentStyle={{
                backgroundColor: '#1f2937',
                borderColor: '#374151',
                color: '#fff',
              }}
              labelStyle={{ color: '#f9fafb' }}
            />
            <Area
              type="monotone"
              dataKey="rating"
              stroke="#db2777"
              fill="url(#miniChart)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Expandable Reviews */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {reviews.map((review, idx) => (
              <div
                key={idx}
                className="bg-neutral-800/60 border border-neutral-700 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  {review.item.menuImage ? (
                    <img
                      src={review.item.menuImage}
                      alt={review.item.menuName}
                      className="w-16 h-16 object-cover rounded-lg shadow"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-neutral-700 rounded-lg flex items-center justify-center text-neutral-400 text-xs">
                      No Image
                    </div>
                  )}
                  <div className="flex-1">
                    <h4 className="font-semibold text-pink-400">
                      {review.item.menuName}
                    </h4>
                    <p className="text-xs text-neutral-500">
                      {review.user} ({review.email})
                    </p>
                    <div className="mt-1">{renderStarRating(review.rating)}</div>
                    {review.comment && (
                      <p className="italic text-neutral-300 mt-2">
                        “{review.comment}”
                      </p>
                    )}
                    <p className="text-sm text-neutral-400 mt-2">
                      ₱
                      {(
                        Number(review.item.menuPrice) *
                        Number(review.item.quantity || 1)
                      ).toFixed(2)}{' '}
                      • Qty: {review.item.quantity || 1}
                    </p>
                    <p className="text-[10px] text-neutral-500 mt-1">
                      Order ID: {review.orderId}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomerRatingCard;

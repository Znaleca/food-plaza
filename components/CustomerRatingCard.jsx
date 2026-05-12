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

  const renderStarRating = (value, size = 'sm') => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <FontAwesomeIcon
          key={star}
          icon={solidStar}
          className={`${
            value >= star ? 'text-red-600' : 'text-neutral-300'
          } ${size === 'lg' ? 'text-2xl' : 'text-sm'}`}
        />
      ))}
    </div>
  );

  if (loading)
    return (
      <div className="border-4 border-neutral-950 p-6 flex justify-center bg-white">
        <span className="text-sm font-black uppercase tracking-[0.3em] animate-pulse">ANALYZING METRICS...</span>
      </div>
    );
    
  if (reviews.length === 0)
    return (
      <div className="border-4 border-dashed border-neutral-400 p-8 text-center bg-neutral-50">
        <span className="text-xl font-black uppercase tracking-tighter text-neutral-400">NO RATINGS YET</span>
      </div>
    );

  return (
    <div className="mt-8 border-[6px] border-neutral-950 bg-white text-neutral-950 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-[6px] border-neutral-950 bg-neutral-50 p-6 sm:p-8 gap-6">
        <div>
          <div className="flex items-center gap-4">
            {renderStarRating(averageRating, 'lg')}
            <span className="text-4xl sm:text-5xl font-black text-neutral-950 tracking-tighter leading-none">
              {averageRating.toFixed(1)}<span className="text-2xl text-neutral-400">/5</span>
            </span>
          </div>
          <p className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-neutral-500 mt-2">
            BASED ON {reviews.length} REVIEWS • <span className="text-red-600">{percentage}% POSITIVE</span>
          </p>
        </div>
        <button
          onClick={() => setExpanded((prev) => !prev)}
          className="px-6 py-3 text-xs sm:text-sm font-black uppercase tracking-[0.2em] border-4 border-neutral-950 text-neutral-950 bg-white hover:bg-neutral-950 hover:text-white transition-colors w-full sm:w-auto"
        >
          {expanded ? 'HIDE REVIEWS' : 'VIEW REVIEWS'}
        </button>
      </div>

      {/* Mini Chart */}
      <div className="h-32 sm:h-40 border-b-[6px] border-neutral-950 bg-neutral-950 p-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="miniChart" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#dc2626" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="index" hide />
            <YAxis domain={[0, 5]} hide />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                borderColor: '#0a0a0a',
                borderWidth: '4px',
                color: '#0a0a0a',
                fontFamily: 'monospace',
                fontWeight: '900',
                textTransform: 'uppercase',
                borderRadius: '0px',
              }}
              itemStyle={{ color: '#dc2626' }}
              labelStyle={{ display: 'none' }}
              formatter={(value) => [`${value} STARS`, 'RATING']}
            />
            <Area
              type="step"
              dataKey="rating"
              stroke="#dc2626"
              fill="url(#miniChart)"
              strokeWidth={4}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Expandable Reviews */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col bg-neutral-50 overflow-hidden"
          >
            {reviews.map((review, idx) => (
              <div
                key={idx}
                className="border-b-[4px] border-neutral-950 p-6 sm:p-8 flex flex-col sm:flex-row gap-6 bg-white hover:bg-neutral-50 transition-colors last:border-b-0"
              >
                {/* Review Image */}
                <div className="flex-shrink-0 w-24 h-24 border-4 border-neutral-950 overflow-hidden bg-neutral-100">
                  {review.item.menuImage ? (
                    <img
                      src={review.item.menuImage}
                      alt={review.item.menuName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] font-black uppercase text-neutral-400">
                      NO IMG
                    </div>
                  )}
                </div>

                {/* Review Content */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <h4 className="font-black uppercase text-lg tracking-tighter text-neutral-950">
                        {review.item.menuName}
                      </h4>
                      <div className="flex-shrink-0">{renderStarRating(review.rating)}</div>
                    </div>
                    
                    <p className="text-xs font-black text-neutral-500 uppercase tracking-widest mb-4">
                      {review.user} <span className="text-neutral-400 font-bold lowercase">({review.email})</span>
                    </p>
                    
                    {review.comment && (
                      <div className="border-l-4 border-red-600 pl-4 py-1 mb-4">
                        <p className="font-bold text-neutral-800 text-sm sm:text-base italic">
                          “{review.comment}”
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mt-2 pt-4 border-t-2 border-neutral-100">
                    <p className="text-xs font-black text-neutral-400 uppercase tracking-widest">
                      QTY: <span className="text-neutral-950">{review.item.quantity || 1}</span> • ₱
                      {(
                        Number(review.item.menuPrice) *
                        Number(review.item.quantity || 1)
                      ).toFixed(2)}
                    </p>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">
                      ID: {review.orderId.slice(-8)}
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

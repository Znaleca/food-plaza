'use client';

import { useEffect, useState, useRef } from 'react';
import getAllReviews from '@/app/actions/getAllReviews';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar as solidStar } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link'; // 👈 Import Link

const RateCard = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef(null);

  const startX = useRef(0);
  const currentTranslate = useRef(0);
  const isDragging = useRef(false);

  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const data = await getAllReviews();
        if (!Array.isArray(data.orders)) throw new Error('Unexpected response format');

        const extracted = [];
        data.orders.forEach((order) => {
          const { items, rated, rating, comment } = order;
          items.forEach((itemString, index) => {
            if (!rated?.[index]) return;
            let item;
            try {
              item = JSON.parse(itemString);
              // Assuming `item` now includes a `roomId` property
              if (!item.roomId) return; // Skip if no roomId
            } catch {
              item = { menuName: 'Invalid Item' };
            }
            extracted.push({
              orderId: order.$id,
              user: order.name || 'Anonymous',
              item,
              rating: rating?.[index],
              comment: comment?.[index],
              roomId: item.roomId // 👈 Extract roomId
            });
          });
        });

        setReviews(extracted);
      } catch (error) {
        console.error('Could not load reviews:', error);
        setError('Could not load reviews');
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, []);

  // ... [IntersectionObserver and Auto-slide useEffects remain the same] ...
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => setIsVisible(entry.isIntersecting));
      },
      { threshold: 0.3 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (reviews.length > 3 && isVisible) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1 >= reviews.length ? 0 : prev + 1));
      }, 3000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [reviews, isVisible]);
  // ...

  const handleStart = (clientX) => {
    startX.current = clientX;
    isDragging.current = true;
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const handleMove = (clientX) => {
    if (!isDragging.current) return;
    const diff = clientX - startX.current;
    currentTranslate.current = diff;
  };

  const handleEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;

    if (currentTranslate.current < -50) {
      setCurrentIndex((prev) => (prev + 1 >= reviews.length ? 0 : prev + 1));
    } else if (currentTranslate.current > 50) {
      setCurrentIndex((prev) => (prev - 1 < 0 ? reviews.length - 1 : prev - 1));
    }

    currentTranslate.current = 0;
  };

  const renderStarRating = (ratingValue) => (
    <div className="flex justify-center gap-1 text-xl sm:text-2xl">
      {[1, 2, 3, 4, 5].map((star) => (
        <FontAwesomeIcon
          key={star}
          icon={solidStar}
          className={ratingValue >= star ? 'text-fuchsia-400 drop-shadow-md' : 'text-neutral-700'}
        />
      ))}
    </div>
  );

  return (
    <div ref={containerRef} className="w-full text-white py-10 px-6 bg-neutral-950 relative">
      {loading ? (
        <p className="text-neutral-400 text-xl text-center">Loading...</p>
      ) : error ? (
        <p className="text-red-500 text-xl text-center">{error}</p>
      ) : reviews.length === 0 ? (
        <p className="text-neutral-400 text-xl text-center">No reviews found.</p>
      ) : (
        <div
          className="overflow-hidden w-full"
          onMouseDown={(e) => handleStart(e.clientX)}
          onMouseMove={(e) => handleMove(e.clientX)}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={(e) => handleStart(e.touches[0].clientX)}
          onTouchMove={(e) => handleMove(e.touches[0].clientX)}
          onTouchEnd={handleEnd}
        >
          <div
            className="flex gap-6 transition-transform duration-700 ease-in-out"
            style={{
              transform: `translateX(calc(-${currentIndex * 33}% + ${currentTranslate.current}px))`,
            }}
          >
            {reviews.map((review, idx) => (
              // 👈 Link component added
              <Link key={idx} href={`/rooms/${review.roomId}`} passHref className="min-w-[80%] sm:min-w-[40%] md:min-w-[30%]">
                <div
                  className="bg-neutral-900/70 backdrop-blur-md border border-neutral-800 
                             rounded-3xl shadow-lg hover:shadow-fuchsia-500/30 
                             hover:border-fuchsia-400 transition-all duration-500 
                             p-6 aspect-square flex flex-col cursor-pointer" // 👈 Add cursor-pointer
                >
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2 line-clamp-2">
                    {review.item.menuName}
                  </h3>

                  <p className="italic text-gray-300 text-sm leading-relaxed mb-3 line-clamp-3">
                    "{review.comment}"
                  </p>

                  <div className="mt-auto">
                    <div className="mb-3">{renderStarRating(review.rating)}</div>
                    <div className="text-xs text-gray-400 text-center">
                      Reviewed by{' '}
                      <span className="text-cyan-400 font-semibold">{review.user}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RateCard;
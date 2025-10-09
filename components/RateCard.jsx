'use client';

import { useEffect, useState, useRef } from 'react';
import getAllStallReviews from '@/app/actions/getAllStallReviews';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar as solidStar } from '@fortawesome/free-solid-svg-icons';

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
        // 2. Call the new server action
        const data = await getAllStallReviews();
        
        // 3. Check for the correct structure (data.reviews)
        if (!Array.isArray(data.reviews)) throw new Error('Unexpected response format');
        
        // The data is already formatted correctly as stall reviews by the server action
        setReviews(data.reviews); 
      } catch (error) {
        console.error('Could not load stall reviews:', error);
        setError('Could not load stall reviews');
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, []);

  // 🔥 Observe visibility
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

  // Auto slide only if visible
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
        <p className="text-neutral-400 text-xl text-center">No stall reviews found.</p>
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
              <div
                key={idx}
                className="min-w-[80%] sm:min-w-[40%] md:min-w-[30%] 
                           bg-neutral-900/70 backdrop-blur-md border border-neutral-800 
                           rounded-3xl shadow-lg hover:shadow-fuchsia-500/30 
                           hover:border-fuchsia-400 transition-all duration-500 
                           p-6 aspect-square flex flex-col"
              >
                {/* 4. Use the stall/room name as the title */}
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2 line-clamp-2">
                  {review.roomName || 'Overall Stall Experience'}
                </h3>

                {/* 5. Use the stall comment */}
                <p className="italic text-gray-300 text-sm leading-relaxed mb-3 line-clamp-3">
                  "{review.comment || 'No comment provided.'}"
                </p>

                <div className="mt-auto">
                  {/* 6. Use the stall rating */}
                  <div className="mb-3">{renderStarRating(review.rating)}</div>
                  <div className="text-xs text-gray-400 text-center">
                    Reviewed by{' '}
                    {/* 👇 Using review.user (which is the user's name from the order document) */}
                    <span className="text-cyan-400 font-semibold">{review.user || 'Anonymous'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RateCard;
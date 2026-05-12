'use client';

import { useEffect, useState, useRef } from 'react';
import getAllStallReviews from '@/app/actions/getAllStallReviews';

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
        const data = await getAllStallReviews();
        if (!Array.isArray(data.reviews)) throw new Error('Unexpected response format');
        setReviews(data.reviews); 
      } catch (error) {
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };
    loadReviews();
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (reviews.length > 3 && isVisible) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1 >= reviews.length ? 0 : prev + 1));
      }, 5000);
    }
    return () => clearInterval(intervalRef.current);
  }, [reviews, isVisible]);

  const handleStart = (clientX) => {
    startX.current = clientX;
    isDragging.current = true;
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const handleMove = (clientX) => {
    if (!isDragging.current) return;
    currentTranslate.current = clientX - startX.current;
  };

  const handleEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (currentTranslate.current < -50) setCurrentIndex((prev) => (prev + 1 >= reviews.length ? 0 : prev + 1));
    else if (currentTranslate.current > 50) setCurrentIndex((prev) => (prev - 1 < 0 ? reviews.length - 1 : prev - 1));
    currentTranslate.current = 0;
  };

  const renderStars = (rating) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <div key={s} className={`h-1.5 w-6 ${rating >= s ? 'bg-red-600' : 'bg-neutral-200'}`} />
      ))}
    </div>
  );

  return (
    <div ref={containerRef} className="w-full bg-white text-neutral-950 font-sans selection:bg-red-600 selection:text-white border-t-[8px] border-neutral-950">
      
      {/* 1. CLEAN HEADER */}
      <div className="p-8 md:p-16 lg:p-20 border-b-4 border-neutral-950 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <p className="text-xs font-black tracking-[0.3em] uppercase mb-4 text-red-600">[ 03 // VIBE CHECK ]</p>
          <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">
            GUEST <br /> FEEDBACK
          </h2>
        </div>
        <p className="max-w-[300px] text-sm font-bold uppercase leading-tight text-neutral-500">
          Unfiltered logs from the food court floor. Freshness is our standard.
        </p>
      </div>

      {/* 2. SLIDER AREA */}
      <div className="relative bg-neutral-50 overflow-hidden">
        {loading ? (
          <div className="h-[400px] flex items-center justify-center font-black uppercase tracking-widest animate-pulse">Initializing...</div>
        ) : (
          <div
            className="flex transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
            onMouseDown={(e) => handleStart(e.clientX)}
            onMouseMove={(e) => handleMove(e.clientX)}
            onMouseUp={handleEnd}
            style={{ transform: `translateX(calc(-${currentIndex * (typeof window !== 'undefined' && window.innerWidth < 768 ? 100 : 33.33)}% + ${currentTranslate.current}px))` }}
          >
            {reviews.map((review, i) => (
              <div 
                key={i} 
                className="min-w-full md:min-w-[33.33%] p-10 md:p-16 border-r-4 border-neutral-950 bg-white flex flex-col justify-between group transition-colors duration-300 hover:bg-neutral-950 hover:text-white"
              >
                <div>
                  <div className="mb-8">{renderStars(review.rating)}</div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter mb-4 group-hover:text-red-600 transition-colors">
                    {review.roomName || 'General'}
                  </h3>
                  <p className="text-lg font-bold leading-snug italic uppercase opacity-80 group-hover:opacity-100">
                    "{review.comment || 'Top tier flavor profile.'}"
                  </p>
                </div>

                <div className="mt-12 flex items-center justify-between pt-6 border-t-2 border-neutral-100 group-hover:border-neutral-800">
                  <span className="text-[10px] font-black tracking-widest uppercase">ID: 0{i + 1}</span>
                  <span className="text-[10px] font-black tracking-widest uppercase text-red-600">VERIFIED</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. PROGRESS BAR - Visual indicator of which slide we are on */}
      <div className="w-full h-2 bg-neutral-200 overflow-hidden">
        <div 
          className="h-full bg-red-600 transition-all duration-700 ease-out" 
          style={{ width: `${((currentIndex + 1) / reviews.length) * 100}%` }}
        />
      </div>
    </div>
  );
};

export default RateCard;
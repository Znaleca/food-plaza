'use client';

import { useState, useEffect, useRef } from 'react';
import getAllSpaces from '@/app/actions/getAllSpaces';
import getAllStallReviews from '@/app/actions/getAllStallReviews'; 
import LoadingSpinner from '@/components/LoadingSpinner';
import SpaceCard from './SpaceCard';
import FeaturedCard from './FeaturedCard';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function BrowsePreview() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const containerRef = useRef(null);
  const featuredRef = useRef(null);
  const gridRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [spaces, reviewData] = await Promise.all([
          getAllSpaces(),
          getAllStallReviews(),
        ]);

        const allReviews = reviewData?.reviews || [];
        const ratingMap = {};

        allReviews.forEach((review) => {
          const { roomName, rating } = review;
          if (!roomName || rating === undefined || rating === null) return;
          if (!ratingMap[roomName]) {
            ratingMap[roomName] = { total: 0, count: 0 };
          }
          const value = Number(rating) || 0;
          ratingMap[roomName].total += value;
          ratingMap[roomName].count += 1;
        });

        const enrichedRooms = (spaces || []).map((room) => {
          const ratingData = ratingMap[room.name] || { total: 0, count: 0 };
          const averageRating =
            ratingData.count > 0 ? ratingData.total / ratingData.count : 0;
          return { ...room, averageRating, reviewCount: ratingData.count };
        });

        setRooms(enrichedRooms);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (loading || rooms.length === 0) return;

    let ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 1024px)", () => {
        ScrollTrigger.create({
          trigger: containerRef.current,
          pin: featuredRef.current,
          start: 'top 5%', // Brought slightly higher to maximize viewable area
          end: 'bottom bottom',
          pinSpacing: false,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, [loading, rooms]);

  if (loading) {
    return <LoadingSpinner message="Loading food stalls..." />;
  }

  return (
    <section id="browse" className="bg-white text-neutral-950 pb-16 font-sans selection:bg-red-600 selection:text-white">
      {/* Header */}
      <div className="w-full px-6 md:px-20 pt-12 mb-10">
        <span className="text-xs font-bold tracking-[0.4em] text-red-600 uppercase">
          DIRECTORY
        </span>
        <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase mt-2">
          EXPLORE STALLS
        </h2>
        <div className="h-2 w-32 bg-neutral-950 mt-6" />
      </div>

      <div className="w-full px-4 sm:px-6 md:px-20" ref={containerRef}>
        {/* CHANGED: items-stretch -> items-start to allow the pinned card to auto-adjust height */}
        <div className="w-full flex flex-col lg:flex-row lg:gap-12 gap-10 items-start relative">
          
          {/* Featured Column (Pinned) */}
          <div className="w-full lg:w-1/2 relative">
            <div
              className="z-10 w-full border-[6px] border-neutral-950 bg-white sticky-card-wrapper"
              ref={featuredRef}
            >
              <FeaturedCard
                imageSrc="/images/Featured.jpg"
                buttonText="ORDER NOW"
                href="/search"
              />
            </div>
          </div>

          {/* Grid Column (Scrollable) */}
          <div className="w-full lg:w-1/2" ref={gridRef}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {rooms.length === 0 ? (
                <div className="flex flex-col items-center justify-center col-span-2 text-center py-20 border-4 border-neutral-950 italic font-semibold text-neutral-400">
                  <p>No food stalls available.</p>
                </div>
              ) : (
                rooms.map((room) => (
                  <SpaceCard
                    key={room.$id}
                    room={room}
                    averageRating={room.averageRating}
                    reviewCount={room.reviewCount}
                    isStallOpen={room.operatingStatus !== false}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
'use client';

import { useState, useEffect, useRef } from 'react';
import getAllSpaces from '@/app/actions/getAllSpaces';
import getAllReviews from '@/app/actions/getAllReviews';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useRouter } from 'next/navigation';
import SpaceCard from './SpaceCard';
import FeaturedCard from './FeaturedCard';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function BrowsePreview() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const containerRef = useRef(null);
  const featuredRef = useRef(null);
  const gridRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [spaces, reviewData] = await Promise.all([
          getAllSpaces(),
          getAllReviews(1, 100),
        ]);

        const allReviews = reviewData?.orders || [];
        const ratingMap = {};

        allReviews.forEach((order) => {
          const { items, rated, rating } = order;
          items.forEach((itemStr, idx) => {
            if (!rated?.[idx]) return;
            let item;
            try {
              item = JSON.parse(itemStr);
            } catch {
              return;
            }
            const roomName = item.room_name;
            if (!roomName) return;
            if (!ratingMap[roomName]) {
              ratingMap[roomName] = { total: 0, count: 0 };
            }
            const value = Number(rating?.[idx]) || 0;
            ratingMap[roomName].total += value;
            ratingMap[roomName].count += 1;
          });
        });

        const enrichedRooms = (spaces || []).map((room) => {
          const ratingData = ratingMap[room.name] || { total: 0, count: 0 };
          const averageRating =
            ratingData.count > 0 ? ratingData.total / ratingData.count : 0;
          return {
            ...room,
            averageRating,
            reviewCount: ratingData.count,
          };
        });

        setRooms(enrichedRooms);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // GSAP ScrollTrigger setup for desktop only
    let st;
    if (
      window.innerWidth >= 1024 &&
      containerRef.current &&
      featuredRef.current &&
      gridRef.current
    ) {
      st = ScrollTrigger.create({
        trigger: containerRef.current,
        pin: featuredRef.current,
        start: 'top top',
        end: () => `bottom bottom`,
        pinSpacing: false,
      });
    }

    return () => {
      if (st) {
        st.kill();
      }
    };
  }, [rooms]);

  if (loading) {
    return <LoadingSpinner message="Loading food stalls..." />;
  }

  return (
    <section id="browse" className="py-20 bg-neutral-950 text-white">
      {/* Section Header */}
      <div className="text-center py-8 px-6">
      <h2 className="text-base sm:text-lg font-light tracking-[0.3em] bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-500 to-cyan-400">
            BROWSE
          </h2>
          <p className="mt-3 text-3xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
            Discover{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-fuchsia-500">
            delicious</span> and <span className="bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-500 to-cyan-400">tasty menus</span>
          </p>
          
      </div>

      {/* Content */}
      <div
        className="w-full md:mt-20 h-full mt-14 px-4 sm:px-6 md:px-20"
        ref={containerRef}
      >
        <div className="w-full h-full flex flex-col lg:flex-row lg:gap-4 gap-6 relative">
          {/* Featured Section */}
          <div
            className="relative z-0 w-full h-auto lg:h-screen lg:flex-none lg:w-1/2 lg:sticky lg:top-0 mb-4 lg:mb-0"
            ref={featuredRef}
          >
            <FeaturedCard
              imageSrc="/images/Featured.jpg"
              buttonText="Order now"
              href="/search"
            />
          </div>

          {/* Grid Section */}
          <div
            className="w-full lg:w-1/2 lg:flex-none lg:overflow-y-auto lg:mt-0"
            ref={gridRef}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 p-2 sm:p-4">
              {rooms.length === 0 ? (
                <div className="flex flex-col items-center justify-center col-span-2 text-center text-gray-500">
                  <p>No food stalls available.</p>
                </div>
              ) : (
                rooms.map((room) => (
                  <SpaceCard
                    key={room.$id}
                    room={room}
                    averageRating={room.averageRating}
                    reviewCount={room.reviewCount}
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

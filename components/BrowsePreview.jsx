'use client';

import { useState, useEffect, useRef } from 'react';
import getAllSpaces from '@/app/actions/getAllSpaces';
import getAllReviews from '@/app/actions/getAllReviews';
import SpaceCard from '@/components/SpaceCard';
import dynamic from 'next/dynamic';
import LoadingSpinner from '@/components/LoadingSpinner';

const MenuBrowse = dynamic(() => import('@/components/MenuBrowse'), { ssr: false });

export default function BrowsePreview() {
  const [rooms, setRooms] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const headingRef = useRef(null);

  // ✅ Update showMenu based on URL query param, and listen for changes
  useEffect(() => {
    const updateViewFromUrl = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const viewParam = urlParams.get('view');
      setShowMenu(viewParam === 'menu');
    };

    updateViewFromUrl(); // run on mount
    window.addEventListener('popstate', updateViewFromUrl);

    return () => {
      window.removeEventListener('popstate', updateViewFromUrl);
    };
  }, []);

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
  }, []);

  const toggleView = () => {
    const newView = showMenu ? 'stall' : 'menu';

    // ✅ update URL param
    const url = new URL(window.location.href);
    url.searchParams.set('view', newView);
    window.history.replaceState({}, '', url);
    window.dispatchEvent(new Event('popstate')); // notify listener
  };

  if (loading) {
    return <LoadingSpinner message="Loading food stalls..." />;
  }

  return (
    <div className="w-full">
      {/* Toggle Button */}
      <div className="flex justify-center mb-8">
        <button
          onClick={toggleView}
          className="px-8 py-4 tracking-widest uppercase font-bold text-2xl text-white rounded-full bg-gradient-to-r from-pink-600 to-fuchsia-600 hover:from-pink-700 hover:to-fuchsia-700 shadow-lg hover:scale-105 transition-all flex items-center gap-3"
        >
          {showMenu ? 'Food Stalls' : 'Menu'}
        </button>
      </div>

      {/* Section Heading */}
      <div className="w-full text-center mb-12">
        <h2
          ref={headingRef}
          className="text-lg sm:text-xl text-pink-600 font-light tracking-widest"
        >
          {showMenu ? 'BROWSE MENUS' : 'BROWSE FOOD STALLS'}
        </h2>
        <p className="mt-4 text-3xl sm:text-5xl mb-36 font-bold text-white tracking-wider">
          {showMenu ? 'Find something delicious.' : 'Find something you crave.'}
        </p>
      </div>

      {/* Content */}
      <div className="w-full">
        {showMenu ? (
          <MenuBrowse />
        ) : rooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96">
            <p className="mt-4 text-lg text-gray-500">
              No food stalls available at the moment. Please check back later.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 w-full">
            {rooms.map((room, index) => (
              <SpaceCard
                key={room.$id}
                room={room}
                averageRating={room.averageRating}
                reviewCount={room.reviewCount}
                priority={index < 4}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

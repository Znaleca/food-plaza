'use client';

import { useState, useEffect } from 'react';
import getAllSpaces from '@/app/actions/getAllSpaces';
import getAllReviews from '@/app/actions/getAllReviews';
import SpaceCard from '@/components/SpaceCard';
import dynamic from 'next/dynamic';

const MenuBrowse = dynamic(() => import('@/components/MenuBrowse'), { ssr: false });

export default function BrowsePage() {
  const [rooms, setRooms] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const viewParam = urlParams.get('view');
    setShowMenu(viewParam === 'menu');
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [spaces, reviewData] = await Promise.all([
          getAllSpaces(),
          getAllReviews(1, 100),
        ]);

        const allReviews = reviewData?.orders || [];

        // Group and average ratings by room_name
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

        // Add rating data into each space
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

  const toggleView = () => setShowMenu((prev) => !prev);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="animate-spin h-12 w-12 border-4 border-t-transparent border-blue-500 border-solid rounded-full"></div>
        <p className="mt-4 text-lg text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-center -mb-20">
        <button
          onClick={toggleView}
          className="px-8 py-4 tracking-widest uppercase font-bold text-2xl text-white rounded-full bg-gradient-to-r from-pink-600 to-fuchsia-600 hover:from-pink-700 hover:to-fuchsia-700 shadow-lg hover:scale-105 transition-all flex items-center gap-3 animate-fade-in delay-500 mb-28"
          >
          {showMenu ? 'Food Stalls' : 'Menu'}
        </button>
      </div>

      <div className="text-center mb-10 px-4">
        <h2 className="text-lg sm:text-xl text-pink-600 font-light tracking-widest">
          {showMenu ? 'BROWSE MENUS' : 'BROWSE FOOD STALLS'}
        </h2>
        <p className="mt-4 text-3xl sm:text-5xl font-bold text-white tracking-wider">
          {showMenu ? 'Find something delicious.' : 'Find something you crave.'}
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {showMenu ? (
          <MenuBrowse />
        ) : rooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96">
            <p className="mt-4 text-lg text-gray-500">
              No food stalls available at the moment. Please check back later.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mt-40">
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
    </>
  );
}

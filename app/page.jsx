'use client';

import { useState, useEffect } from 'react';
import getAllSpaces from '@/app/actions/getAllSpaces';
import Heading from '@/components/Heading';
import SpaceCard from '@/components/SpaceCard';
import dynamic from 'next/dynamic';

const MenuBrowse = dynamic(() => import('@/components/MenuBrowse'), { ssr: false });

export default function Home() {
  const [rooms, setRooms] = useState([]);  // State to hold room data
  const [showMenu, setShowMenu] = useState(false);  // State to toggle between views
  const [loading, setLoading] = useState(true);  // Loading state

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const data = await getAllSpaces();
        setRooms(data || []);  // Ensure we set it to an empty array if data is undefined
      } catch (error) {
        console.error('Error fetching rooms:', error);
      } finally {
        setLoading(false);  // Set loading to false once data is fetched
      }
    };

    fetchRooms();  // Fetch data when the component mounts
  }, []);  // Empty dependency array to run only once

  const toggleView = () => {
    setShowMenu((prev) => !prev);  // Toggle between menu and food stalls
  };

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
      {/* Toggle Button */}
      <div className="flex justify-center mb-6">
        <button 
          onClick={toggleView} 
          className="px-8 py-4 text-2xl bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition shadow-lg"
        >
          {showMenu ? 'Show Food Stalls' : 'Show Menu'}
        </button>
      </div>

      {/* Heading */}
      <Heading 
        title={showMenu ? "Menu" : "Food Stalls"} 
        className="text-center mb-12 text-4xl font-bold text-gray-900 
        bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 
        bg-clip-text text-transparent" 
      />

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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-12">
            {rooms.map((room) => (
              <div key={room.$id} className="flex justify-center">
                <SpaceCard room={room} />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

'use client';

import { useEffect, useState, useRef } from 'react';
import getFeaturedMenu from '@/app/actions/getFeaturedMenu';
import Link from 'next/link';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const FeaturedPage = () => {
  const [featuredMenus, setFeaturedMenus] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getFeaturedMenu();
      setFeaturedMenus(data);
    };

    fetchData();
  }, []);

  const bucketId = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ROOMS;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;

  // Scroll left
  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  // Scroll right
  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  return (
    <div 
      className="max-w-6xl mx-auto p-6 bg-cover bg-center bg-no-repeat rounded-lg shadow-lg"
      style={{ backgroundImage: "url('/images/card.jpg')" }}
    >
      {/* Featured Menu Title with Solid Box */}
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold text-yellow-400 bg-black border-4 border-yellow-400 px-6 py-2 inline-block rounded-lg">
          Featured Menu
        </h1>
      </div>

      {featuredMenus.length > 0 ? (
        <div className="relative">
          {/* Left Scroll Button */}
          <button 
            onClick={scrollLeft} 
            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black p-3 rounded-full text-white hover:bg-gray-950 transition shadow-lg z-10"
          >
            <FaChevronLeft size={20} />
          </button>

          {/* Scrollable Container */}
          <div 
            ref={scrollRef} 
            className="flex space-x-6 overflow-x-auto scrollbar-hide p-4"
          >
            {featuredMenus.map((menu) => (
              <div 
                key={menu.id} 
                className="min-w-[250px] border-2 border-yellow-400 p-4 shadow-lg rounded-lg bg-white flex flex-col items-center"
              >
                {/* Circular Menu Image */}
                {menu.menuImage ? (
                  <img
                    src={`https://cloud.appwrite.io/v1/storage/buckets/${bucketId}/files/${menu.menuImage}/view?project=${projectId}`}
                    alt={menu.menuName}
                    className="w-32 h-32 object-cover rounded-full mb-3 shadow-md"
                  />
                ) : (
                  <div className="w-32 h-32 bg-gray-200 flex items-center justify-center rounded-full mb-3">
                    <p className="text-gray-500 text-center">No Image</p>
                  </div>
                )}

                <h2 className="text-lg font-semibold">{menu.menuName}</h2>
                <p className="text-gray-600">₱{menu.menuPrice.toFixed(2)}</p>
                <p className="text-gray-500 text-sm">Food Stall: {menu.roomName}</p>
                <Link
                  href={`/rooms/${menu.roomId}`}
                  className="block mt-4 text-yellow-400 font-medium hover:underline"
                >
                  View Stall
                </Link>
              </div>
            ))}
          </div>

          {/* Right Scroll Button */}
          <button 
            onClick={scrollRight} 
            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-black p-3 rounded-full text-white hover:bg-gray-950 transition shadow-lg z-10"
          >
            <FaChevronRight size={20} />
          </button>
        </div>
      ) : (
        <p className="text-center text-white">No featured menus available.</p>
      )}
    </div>
  );
};

export default FeaturedPage;

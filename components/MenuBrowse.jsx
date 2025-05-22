'use client';

import { useEffect, useState, useRef } from 'react';
import getFeaturedMenu from '@/app/actions/getFeaturedMenu';
import Link from 'next/link';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const MenuBrowse = () => {
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

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  // Group menus by room (stall)
  const groupedMenus = featuredMenus.reduce((acc, menu) => {
    if (!acc[menu.roomId]) {
      acc[menu.roomId] = {
        roomName: menu.roomName || 'Unknown Stall',
        menus: [],
      };
    }
    acc[menu.roomId].menus.push(menu);
    return acc;
  }, {});

  return (
    <div className="max-w-7xl mx-auto px-6 py-24 bg-neutral-900">
      

      {Object.entries(groupedMenus).length > 0 ? (
        Object.entries(groupedMenus).map(([roomId, { roomName, menus }]) => (
          <div key={roomId} className="mb-20">
            <h3 className="text-white text-2xl font-semibold mb-6">{roomName}</h3>
            <div className="relative">
              {/* Left Scroll Button */}
              <button
                onClick={scrollLeft}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black p-3 rounded-full text-white hover:bg-gray-800 transition z-10 shadow-lg"
                aria-label="Scroll left"
              >
                <FaChevronLeft size={20} />
              </button>

              {/* Scrollable Container */}
              <div
                ref={scrollRef}
                className="flex space-x-6 overflow-x-auto scrollbar-hide px-10"
              >
                {menus.map((menu) => (
                  <Link
                    key={menu.id}
                    href={`/rooms/${menu.roomId}`}
                    className="min-w-[200px] flex flex-col items-center text-white hover:text-yellow-300 transition-colors"
                  >
                    {menu.menuImage ? (
                      <img
                        src={`https://cloud.appwrite.io/v1/storage/buckets/${bucketId}/files/${menu.menuImage}/view?project=${projectId}`}
                        alt={menu.menuName}
                        className="w-32 h-32 object-cover rounded-full mb-3 shadow-md border-4 border-pink-600 transition-transform hover:scale-105"
                      />
                    ) : (
                      <div className="w-32 h-32 bg-gray-200 flex items-center justify-center rounded-full mb-3">
                        <p className="text-gray-500 text-sm text-center">No Image</p>
                      </div>
                    )}
                    <h4 className="text-md font-semibold text-center">{menu.menuName}</h4>
                  </Link>
                ))}
              </div>

              {/* Right Scroll Button */}
              <button
                onClick={scrollRight}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-black p-3 rounded-full text-white hover:bg-gray-800 transition z-10 shadow-lg"
                aria-label="Scroll right"
              >
                <FaChevronRight size={20} />
              </button>
            </div>
          </div>
        ))
      ) : (
        <p className="text-center text-gray-400">No menus available.</p>
      )}
    </div>
  );
};

export default MenuBrowse;

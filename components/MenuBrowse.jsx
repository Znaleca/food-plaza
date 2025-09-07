'use client';

import { useEffect, useState, useRef } from 'react';
import getFeaturedMenu from '@/app/actions/getFeaturedMenu';
import Link from 'next/link';

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
    <div className="w-full">
      {Object.entries(groupedMenus).length > 0 ? (
        Object.entries(groupedMenus).map(([roomId, { roomName, menus }]) => (
          <div key={roomId} className="mb-8">
            <h3 className="text-white text-2xl font-semibold mb-4 px-4">
              {roomName}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-4">
              {menus.map((menu) => (
                <Link
                  key={menu.id}
                  href={`/rooms/${menu.roomId}`}
                  className="bg-neutral-900 rounded-lg p-4 flex flex-col items-center justify-center text-white hover:bg-neutral-800 transition-colors shadow-lg"
                >
                  {menu.menuImage ? (
                    <img
                      src={`https://cloud.appwrite.io/v1/storage/buckets/${bucketId}/files/${menu.menuImage}/view?project=${projectId}`}
                      alt={menu.menuName}
                      className="w-32 h-32 object-cover rounded-lg mb-3"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-gray-200 flex items-center justify-center rounded-lg mb-3">
                      <p className="text-gray-500 text-sm text-center">No Image</p>
                    </div>
                  )}
                  <h4 className="text-lg font-semibold text-center mt-2">
                    {menu.menuName}
                  </h4>
                  {/* You can add a price here if available in your data */}
                  <p className="text-gray-400 text-sm mt-1">Price: $X.XX</p>
                </Link>
              ))}
            </div>
          </div>
        ))
      ) : (
        <p className="text-center text-gray-400 py-10">
          No menus available.
        </p>
      )}
    </div>
  );
};

export default MenuBrowse;
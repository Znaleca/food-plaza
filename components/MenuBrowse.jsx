'use client';

import { useEffect, useState } from 'react';
import getFeaturedMenu from '@/app/actions/getFeaturedMenu';
import Link from 'next/link';

const MenuBrowse = () => {
  const [featuredMenus, setFeaturedMenus] = useState([]);
  const [view, setView] = useState('circle'); // 'circle' or 'list'

  useEffect(() => {
    const fetchData = async () => {
      const data = await getFeaturedMenu();
      setFeaturedMenus(data);
    };

    fetchData();
  }, []);

  const bucketId = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ROOMS;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;

  // Group menus by room (food stall)
  const groupedMenus = featuredMenus.reduce((acc, menu) => {
    if (!acc[menu.roomId]) {
      acc[menu.roomId] = {
        roomName: menu.roomName,  // Assuming menu object has roomName
        menus: [],
      };
    }
    acc[menu.roomId].menus.push(menu);
    return acc;
  }, {});

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => setView(view === 'circle' ? 'list' : 'circle')}
          className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
        >
          Switch to {view === 'circle' ? 'List' : 'Circle'} View
        </button>
      </div>

      {Object.entries(groupedMenus).length > 0 ? (
        Object.entries(groupedMenus).map(([roomId, { roomName, menus }]) => (
          <div key={roomId} className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{roomName}</h2>
            <div className={`grid ${view === 'circle' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6' : 'gap-4'}`}>
              {menus.map((menu) => (
                <Link
                  href={`/rooms/${menu.roomId}`}
                  key={menu.id}
                  className="hover:shadow-lg transition-transform transform hover:-translate-y-1"
                >
                  <div
                    className={`border border-pink-600 p-4 shadow-md rounded-lg bg-white cursor-pointer ${
                      view === 'list' ? 'flex items-center space-x-4' : 'flex flex-col items-center'
                    }`}
                  >
                    {menu.menuImage ? (
                      <img
                        src={`https://cloud.appwrite.io/v1/storage/buckets/${bucketId}/files/${menu.menuImage}/view?project=${projectId}`}
                        alt={menu.menuName}
                        className={`${
                          view === 'circle' ? 'w-32 h-32 rounded-full' : 'w-24 h-24 rounded-lg'
                        } object-cover shadow-md`}
                      />
                    ) : (
                      <div
                        className={`${
                          view === 'circle' ? 'w-32 h-32' : 'w-24 h-24'
                        } bg-gray-200 flex items-center justify-center rounded-full`}
                      >
                        <p className="text-gray-500 text-center">No Image</p>
                      </div>
                    )}

                    <div className={view === 'list' ? 'flex-1' : 'text-center mt-3'}>
                      <h3 className="text-lg font-semibold">{menu.menuName}</h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))
      ) : (
        <p className="text-center text-gray-500">No menus available.</p>
      )}
    </div>
  );
};

export default MenuBrowse;

'use client';

import { useEffect, useState } from 'react';
import getFeaturedMenu from '@/app/actions/getFeaturedMenu';

const FeaturedPage = () => {
  const [featuredMenus, setFeaturedMenus] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getFeaturedMenu();
      setFeaturedMenus(data);
    };

    fetchData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) =>
        featuredMenus.length > 0
          ? (prev + 4) % featuredMenus.length
          : 0
      );
    }, 10000); // every 10 seconds

    return () => clearInterval(interval);
  }, [featuredMenus]);

  const bucketId = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ROOMS;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;

  const getCurrentBatch = () => {
    if (!featuredMenus.length) return [];
    const batch = featuredMenus.slice(currentIndex, currentIndex + 4);
    if (batch.length < 4) {
      return [...batch, ...featuredMenus.slice(0, 4 - batch.length)];
    }
    return batch;
  };

  const currentMenus = getCurrentBatch();

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 bg-neutral-900 transition-all duration-700">
      <div className="text-center mb-12 px-4">
        <h2 className="text-lg sm:text-1xl text-pink-600 font-light tracking-widest">
          OUR MENU
        </h2>
        <p className="mt-4 text-xl sm:text-5xl font-bold text-white tracking-widest">
        Enjoy a taste of comfort and flavor.
        </p>
      </div>

      {currentMenus.length > 0 ? (
        <div className="grid grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="flex flex-col space-y-6">
            {currentMenus.slice(0, 2).map((menu) => (
              <div key={menu.id} className="bg-black rounded-xl overflow-hidden shadow-md">
                {menu.menuImage ? (
                  <img
                    src={`https://cloud.appwrite.io/v1/storage/buckets/${bucketId}/files/${menu.menuImage}/view?project=${projectId}`}
                    alt={menu.menuName}
                    className="w-full h-64 object-cover"
                  />
                ) : (
                  <div className="w-full h-64 bg-gray-300 flex items-center justify-center">
                    <span className="text-gray-600">No Image</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right Column */}
          <div className="flex flex-col space-y-6">
            {currentMenus.slice(2, 4).map((menu) => (
              <div key={menu.id} className="bg-black rounded-xl overflow-hidden shadow-md">
                {menu.menuImage ? (
                  <img
                    src={`https://cloud.appwrite.io/v1/storage/buckets/${bucketId}/files/${menu.menuImage}/view?project=${projectId}`}
                    alt={menu.menuName}
                    className="w-full h-64 object-cover"
                  />
                ) : (
                  <div className="w-full h-64 bg-gray-300 flex items-center justify-center">
                    <span className="text-gray-600">No Image</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-500">No featured menus available.</p>
      )}
    </div>
  );
};

export default FeaturedPage;

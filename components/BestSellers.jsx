'use client';

import { FaMedal } from 'react-icons/fa6';

const BestSellers = ({ topItems, menuData, room, setSelectedMenu }) => {
  if (topItems.length === 0) {
    return null;
  }

  const rankIcons = [
    <FaMedal className="text-yellow-400 mr-1" title="1st Place" />,
    <FaMedal className="text-gray-300 mr-1" title="2nd Place" />,
    <FaMedal className="text-black mr-1" title="3rd Place" />,
  ];

  return (
    <div className="mt-20 mb-20">
      <h3 className="text-3xl font-bold text-white mb-10 text-center uppercase tracking-widest">
        Best Sellers
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
        {topItems.slice(0, 3).map((item, index) => {
          // Find the full menu item object using the name
          const found = menuData.find((m) => m.name === item.name);
          if (!found) return null;

          const isAvailable = found.isAvailable ?? true;

          return (
            <div
              key={found.menuId} // Use the stable menuId for the key
              onClick={() => {
                if (!isAvailable) return;
                setSelectedMenu({
                  name: found.name,
                  price: found.price,
                  image: found.image,
                  roomName: room.name,
                  description: found.description,
                  smallFee: found.smallFee,
                  mediumFee: found.mediumFee,
                  largeFee: found.largeFee,
                  menuId: found.menuId, // Pass the unique ID
                });
              }}
              className={`relative border border-pink-600 rounded-xl bg-neutral-900 p-6 flex flex-col items-center transition-all ${
                isAvailable
                  ? 'cursor-pointer hover:shadow-2xl hover:scale-105'
                  : 'grayscale opacity-60 cursor-not-allowed'
              }`}
            >
              {!isAvailable && (
                <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-[11px] px-2 py-1 rounded font-bold z-10">
                  Not Available
                </div>
              )}
              <div className="absolute top-2 right-2 flex items-center gap-1 bg-pink-600 text-white text-[11px] px-2 py-1 rounded font-bold z-10">
                {rankIcons[index]} {['1st', '2nd', '3rd'][index]}
              </div>
              {found.image && (
                <img
                  src={found.image}
                  alt={found.name}
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover mb-4 shadow-md"
                />
              )}
              <h4 className="text-base sm:text-lg font-semibold text-center text-white">
                {found.name}
              </h4>
              {found.description && (
                <p className="text-sm italic text-neutral-400 text-center mt-1 mb-2">
                  {found.description}
                </p>
              )}
              <p className="text-sm text-gray-400">{item.count} orders</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BestSellers;
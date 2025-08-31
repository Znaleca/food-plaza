'use client';

import { useState } from "react";
import Image from "next/image";
import MenuPopUp from "@/components/MenuPopUp";
import clsx from 'clsx';

const BrowseCardMenu = ({ roomId, menuItem, roomName, allMenus }) => { // allMenus is a new prop
  const [selectedMenu, setSelectedMenu] = useState(null);

  const handleClick = () => {
    if (!menuItem.isAvailable) return;
    // Pass the menu item details and the entire list of menus for recommendations
    setSelectedMenu({ ...menuItem, roomName, allMenus });
  };

  const cardClasses = clsx(
    "group relative flex flex-col rounded-3xl bg-neutral-900/90 border-2 border-neutral-700 shadow-md hover:border-neutral-500 hover:shadow-lg transition-all duration-300 overflow-hidden",
    {
      "cursor-pointer": menuItem.isAvailable,
      "opacity-60 grayscale cursor-not-allowed": !menuItem.isAvailable,
    }
  );

  return (
    <>
      <div
        onClick={handleClick}
        className={cardClasses}
        style={{ minHeight: "340px" }}
      >
        {/* Image Section */}
        {menuItem.image ? (
          <div className="relative w-full h-48 overflow-hidden rounded-t-3xl">
            <Image
              src={menuItem.image}
              alt={menuItem.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
            {!menuItem.isAvailable && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-sm font-medium">
                Unavailable
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-48 bg-neutral-800 flex items-center justify-center text-gray-400 text-sm rounded-t-3xl">
            No Image
          </div>
        )}

        {/* Content Section */}
        <div className="flex flex-col flex-1 p-4 justify-between">
          <div>
            <p className="text-lg font-semibold text-white truncate">
              {menuItem.name}
            </p>
            {menuItem.description && (
              <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                {menuItem.description}
              </p>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-gray-300">{roomName}</span>
            <span className="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-400 font-medium text-xs">
              {menuItem.type}
            </span>
          </div>
        </div>
      </div>

      {/* Menu PopUp */}
      {selectedMenu && (
        <MenuPopUp
          item={selectedMenu.name}
          price={selectedMenu.price}
          smallFee={selectedMenu.smallFee}
          mediumFee={selectedMenu.mediumFee}
          largeFee={selectedMenu.largeFee}
          menuImage={selectedMenu.image}
          roomName={selectedMenu.roomName}
          roomId={roomId}
          description={selectedMenu.description}
          recommendedMenus={selectedMenu.allMenus.filter( // Filter recommendations directly here
            (m) => m.type === selectedMenu.type && m.menuId !== selectedMenu.menuId
          )}
          onSelectMenu={(item) => setSelectedMenu({ ...item, roomName, allMenus: selectedMenu.allMenus })}
          onClose={() => setSelectedMenu(null)}
          onAddToCart={() => setSelectedMenu(null)}
        />
      )}
    </>
  );
};

export default BrowseCardMenu;
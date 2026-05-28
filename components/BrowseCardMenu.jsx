'use client';

import { useState } from "react";
import Image from "next/image";
import MenuPopUp from "@/components/MenuPopUp";
import clsx from 'clsx';

const BrowseCardMenu = ({ roomId, menuItem, roomName, allMenus }) => {
  const [selectedMenu, setSelectedMenu] = useState(null);

  const handleClick = () => {
    if (!menuItem.isAvailable) return;
    setSelectedMenu({ ...menuItem, roomName, allMenus });
  };

  const cardClasses = clsx(
    // Removed rounded-3xl, added border-4 and sharp corners
    "group relative flex flex-col bg-white border-4 border-neutral-950 transition-all duration-300 overflow-hidden",
    {
      "cursor-pointer hover:border-red-600": menuItem.isAvailable,
      "opacity-50 grayscale cursor-not-allowed": !menuItem.isAvailable,
    }
  );

  return (
    <>
      <div
        onClick={handleClick}
        className={cardClasses}
        style={{ minHeight: "360px" }}
      >
        {/* Image Section - Sharp corners and bottom border */}
        {menuItem.image ? (
          <div className="relative w-full h-48 overflow-hidden border-b-4 border-neutral-950">
            <Image
              src={menuItem.image}
              alt={menuItem.name}
              fill
              className="object-cover transition-opacity duration-300"
            />
            {!menuItem.isAvailable && (
              <div className="absolute inset-0 bg-neutral-950/80 flex items-center justify-center">
                <span className="text-white text-xs font-black uppercase tracking-widest border-2 border-white px-3 py-1">
                  Sold Out
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-48 bg-neutral-100 flex items-center justify-center text-neutral-400 font-bold uppercase text-xs border-b-4 border-neutral-950">
            No Preview
          </div>
        )}

        {/* Content Section */}
        <div className="flex flex-col flex-1 p-5 justify-between bg-white">
          <div>
            <h4 className="text-xl font-black text-neutral-950 uppercase leading-none mb-2 group-hover:text-red-600 transition-colors">
              {menuItem.name}
            </h4>
            {menuItem.description && (
              <p className="text-xs font-medium text-neutral-600 line-clamp-2 leading-relaxed">
                {menuItem.description}
              </p>
            )}
          </div>

          <div className="mt-4 pt-4 border-t-2 border-neutral-100 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
              {roomName}
            </span>
            <span className="px-2 py-1 bg-neutral-950 text-white font-black text-[9px] uppercase tracking-tighter">
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
          recommendedMenus={selectedMenu.allMenus.filter(
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
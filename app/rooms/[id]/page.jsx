'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaChevronLeft } from 'react-icons/fa';
import getSingleSpace from '@/app/actions/getSingleSpace';
import getOrdersQuantity from '@/app/actions/getOrdersQuantity';
import SpacesImage from '@/components/SpacesImage';
import MenuPopUp from '@/components/MenuPopUp';
import CustomerRatingCard from '@/components/CustomerRatingCard';
import BestSellers from '@/components/BestSellers';

const categories = ['Drinks', 'Add-Ons', 'Meals', 'Snacks', 'Dessert'];

// simple cache so we don’t refetch the same stall repeatedly
const bestSellersCache = {};

function RoomSpace({ params }) {
  const { id } = params;
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [topItems, setTopItems] = useState([]);

  const bucketId = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ROOMS;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;
  const toURL = (fid) =>
    `https://cloud.appwrite.io/v1/storage/buckets/${bucketId}/files/${fid}/view?project=${projectId}`;

  useEffect(() => {
    (async () => {
      try {
        const data = await getSingleSpace(id);
        setRoom(data);
      } catch (e) {
        console.error('Error fetching room:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const menuImageUrls = (room?.menuImages || []).map(toURL);

  const menuAvailability =
    Array.isArray(room?.menuAvailability) && room.menuAvailability.length === room.menuName?.length
      ? room.menuAvailability
      : new Array(room?.menuName?.length || 0).fill(true);

  // --- MODIFIED menuData GENERATION TO INCLUDE SUB-TYPE ---
  const menuData =
    (room?.menuName || []).map((name, idx) => ({
      menuId: `${id}_${idx}`,
      name,
      price: room.menuPrice?.[idx] ?? 0,
      description: room.menuDescription?.[idx] ?? '',
      image: menuImageUrls[idx] || null,
      type: room.menuType?.[idx] || 'Others',
      // Get the subType, use a default key if the value is empty
      subType: room.menuSubType?.[idx] || 'Main Items', 
      smallFee: room.menuSmall?.[idx] ?? 0,
      mediumFee: room.menuMedium?.[idx] ?? 0,
      largeFee: room.menuLarge?.[idx] ?? 0,
      isAvailable: menuAvailability[idx] ?? true,
      idx,
    })) || [];

  // --- NEW LOGIC: Group menuData by Type and then SubType ---
  const groupedMenu = categories.reduce((acc, cat) => {
    const items = menuData.filter((m) => m.type === cat);
    if (items.length) {
      acc[cat] = items.reduce((subAcc, item) => {
        const subTypeKey = item.subType.trim() || 'Main Items';
        if (!subAcc[subTypeKey]) {
          subAcc[subTypeKey] = [];
        }
        subAcc[subTypeKey].push(item);
        return subAcc;
      }, {});
    }
    return acc;
  }, {});
  // --- END NEW LOGIC ---

  useEffect(() => {
    if (!room) return;

    // check cache first
    if (bestSellersCache[id]) {
      setTopItems(bestSellersCache[id]);
      return;
    }

    const fetchBestSellers = async () => {
      try {
        const allCounts = await getOrdersQuantity();
        const roomCounts = allCounts.filter((item) => item.roomId === id);

        const sorted = roomCounts
          .sort((a, b) => b.count - a.count)
          .slice(0, 3)
          .map((item) => {
            const found = menuData.find(
              (m) => m.menuId === item.menuId || m.name === item.menuName
            );
            if (!found) return null;
            return {
              name: found.name,
              count: item.count,
              image: found.image || null,
            };
          })
          .filter(Boolean);

        bestSellersCache[id] = sorted; // save in cache
        setTopItems(sorted);
      } catch (err) {
        console.error('Failed to fetch top items:', err);
      }
    };

    fetchBestSellers();
  }, [room, id, menuData]); // Added menuData dependency back since it is computed outside useEffect

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-neutral-950">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-cyan-400" />
      </div>
    );

  if (!room)
    return <div className="text-white text-center mt-20 text-xl">Food Stall Not Found</div>;

  const imageUrls = (room.images || []).map(toURL);

  const handleSelectMenu = (menuItem) => {
    // Note: Recommended menus currently filters by main type.
    const recommendedMenus = menuData.filter(
      (m) => m.type === menuItem.type && m.menuId !== menuItem.menuId
    );

    setSelectedMenu({
      name: menuItem.name,
      price: menuItem.price,
      image: menuItem.image,
      roomName: room.name,
      description: menuItem.description,
      smallFee: menuItem.smallFee,
      mediumFee: menuItem.mediumFee,
      largeFee: menuItem.largeFee,
      menuId: menuItem.menuId,
      recommendedMenus,
    });
  };

  return (
    <div className="w-full min-h-screen -mt-20 bg-neutral-950 text-white pb-8">
      <div className="px-4 sm:px-8">
        <Link
          href="/"
          className="flex items-center text-white hover:text-cyan-400 transition duration-300 py-6"
        >
          <FaChevronLeft className="mr-2" />
          <span className="font-medium text-lg">Back</span>
        </Link>
      </div>

      <div className="mt-6 sm:mt-12 text-center mb-8 px-4 sm:px-8">
        <h2 className="text-sm sm:text-lg bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-fuchsia-500 font-light tracking-widest uppercase">
          Food Stall
        </h2>
        <p className="mt-2 text-3xl sm:text-5xl font-extrabold leading-tight">{room.name}</p>
      </div>

      <div className="w-full">
        <SpacesImage imageUrls={imageUrls} />
      </div>

      <div className="px-4 sm:px-8">
        <div className="flex flex-col sm:flex-row justify-center sm:justify-around items-center gap-6 mt-6 mb-12 sm:mb-20">
          <div className="flex flex-col items-center">
            <span className="font-semibold text-base mb-2">Stall #:</span>
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 flex items-center justify-center shadow-lg">
              <p className="text-lg sm:text-xl font-bold">{room.stallNumber || 'N/A'}</p>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-semibold text-base">Type:</span>
            <p className="text-neutral-300 mt-2 text-center text-sm sm:text-base">
              {room.type?.join(' • ') || 'N/A'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-neutral-900 text-white p-4 sm:p-6 rounded-lg -mt-6 sm:-mt-9 shadow-lg text-center mx-4 sm:mx-8 border border-neutral-800">
        <p className="mt-2 italic text-sm sm:text-lg text-neutral-400">
          {room.description || 'Delicious food available here!'}
        </p>
      </div>

      <div className="px-4 sm:px-8">
        <BestSellers
          topItems={topItems}
          menuData={menuData}
          room={room}
          setSelectedMenu={setSelectedMenu}
        />
      </div>

      {/* --- MODIFIED MENU RENDERING SECTION --- */}
      <div className="mt-12 sm:mt-20 px-4 sm:px-8">
        {Object.keys(groupedMenu).map((cat) => (
          <div key={cat} className="mb-12">
            <h3 className="text-white font-semibold mb-6 text-2xl bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-fuchsia-500 border-b border-neutral-700 pb-2">
              {cat}
            </h3>

            {/* Iterate over Sub-Types within the Category */}
            {Object.keys(groupedMenu[cat]).map((subType) => {
              const items = groupedMenu[cat][subType];
              return (
                <div key={subType} className="mb-8">
                  {/* Sub-Type Heading - only show if it's not the default "Main Items" */}
                  {subType !== 'Main Items' && (
                    <h4 className="text-neutral-300 font-medium mb-4 text-lg border-l-4 border-fuchsia-500 pl-3">
                      {subType}
                    </h4>
                  )}

                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {items.map((m) => (
                      <div
                        key={m.idx}
                        onClick={() => {
                          if (!m.isAvailable) return;
                          handleSelectMenu(m);
                        }}
                        className={`relative border border-neutral-800 rounded-md bg-neutral-900 p-3 flex flex-col items-center text-center transition-all duration-300 ${
                          m.isAvailable
                            ? 'cursor-pointer hover:border-white hover:shadow-xl hover:scale-105'
                            : 'grayscale opacity-60 cursor-not-allowed'
                        }`}
                      >
                        {!m.isAvailable && (
                          <div className="absolute top-2 left-2 bg-neutral-800 text-white text-[10px] px-2 py-1 rounded font-bold z-10">
                            Not Available
                          </div>
                        )}
                        {m.image && (
                          <img
                            src={m.image}
                            alt={m.name}
                            className="w-20 h-20 rounded-full object-cover mb-2 shadow-sm"
                          />
                        )}
                        <h4 className="text-sm font-medium">{m.name}</h4>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
      {/* --- END MODIFIED MENU RENDERING SECTION --- */}

      <div className="px-4 sm:px-8 mt-6">
        <CustomerRatingCard roomName={room.name} />
      </div>

      {selectedMenu && (
        <MenuPopUp
          item={selectedMenu.name}
          price={selectedMenu.price}
          smallFee={selectedMenu.smallFee}
          mediumFee={selectedMenu.mediumFee}
          largeFee={selectedMenu.largeFee}
          menuImage={selectedMenu.image}
          roomName={selectedMenu.roomName}
          roomId={id}
          description={selectedMenu.description}
          recommendedMenus={selectedMenu.recommendedMenus}
          onSelectMenu={(item) => handleSelectMenu(item)}
          onClose={() => setSelectedMenu(null)}
          onAddToCart={() => setSelectedMenu(null)}
        />
      )}
    </div>
  );
}

export default RoomSpace;
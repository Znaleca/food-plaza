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

  // Check the overall stall status. Default to true (Open) if the field is missing/undefined.
  // The 'operatingStatus' attribute is assumed to be a boolean: true for Open, false for Closed.
  const isStallOpen = room?.operatingStatus !== false;

  // The individual menu availability array is now only used if the stall is open.
  const menuAvailability =
    // If the stall is closed, treat all items as unavailable
    !isStallOpen
      ? new Array(room?.menuName?.length || 0).fill(false)
      : Array.isArray(room?.menuAvailability) && room.menuAvailability.length === room.menuName?.length
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
      // Use the calculated availability based on overall stall status
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

    // We only fetch best sellers if the stall is open to avoid showing unorderable items
    if (!isStallOpen) {
        setTopItems([]);
        return;
    }

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
            // Only include the item if it exists in the menu AND is available
            if (!found || !found.isAvailable) return null; 
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
    // Added menuData and isStallOpen dependency
  }, [room, id, menuData, isStallOpen]); 
  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="animate-spin h-16 w-16 border-b-4 border-neutral-950" />
      </div>
    );

  if (!room)
    return (
      <div className="text-neutral-950 text-center mt-20 text-xl font-black uppercase tracking-widest">
        Food Stall Not Found
      </div>
    );

  const imageUrls = (room.images || []).map(toURL);

  const handleSelectMenu = (menuItem) => {
    if (!menuItem.isAvailable) return;
    const recommendedMenus = menuData.filter(
      (m) => m.type === menuItem.type && m.menuId !== menuItem.menuId && m.isAvailable
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
    <div className="w-full min-h-screen bg-white text-neutral-950 font-sans selection:bg-red-600 selection:text-white">

      {/* ── BACK LINK ── */}
      <div className="border-b-4 border-neutral-950 px-6 md:px-20">
        <Link href="/"
          className="inline-flex items-center gap-3 py-5 text-xs font-black uppercase tracking-[0.3em] text-neutral-950 hover:text-red-600 transition-colors">
          <FaChevronLeft /> BACK
        </Link>
      </div>

      {/* ── STALL HEADER ── */}
      <div className="w-full border-b-[8px] border-neutral-950 pt-10 pb-14 px-6 md:px-20">
        <span className="text-xs font-black tracking-[0.4em] text-red-600 uppercase block mb-4">
          FOOD STALL
        </span>
        <h1 className="text-5xl sm:text-7xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85] text-neutral-950">
          {room.name}
        </h1>
        <div className="h-3 w-32 bg-neutral-950 mt-8" />

        {/* Stall Meta */}
        <div className="flex flex-wrap gap-6 mt-8">
          {room.stallNumber && (
            <div className="flex items-center gap-3 border-4 border-neutral-950 px-5 py-3">
              <span className="text-xs font-black uppercase tracking-widest text-neutral-400">STALL</span>
              <span className="text-2xl font-black">#{room.stallNumber}</span>
            </div>
          )}
          {room.type?.length > 0 && (
            <div className="flex items-center gap-3 border-4 border-neutral-950 px-5 py-3">
              <span className="text-xs font-black uppercase tracking-widest text-neutral-400">TYPE</span>
              <span className="text-sm font-black uppercase tracking-wide">{room.type.join(' · ')}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── CLOSED BANNER ── */}
      {!isStallOpen && (
        <div className="mx-6 md:mx-20 mt-8 border-l-8 border-red-600 bg-red-50 p-6">
          <p className="text-xl font-black uppercase tracking-tighter text-red-600">STALL IS CLOSED</p>
          <p className="text-sm font-bold text-neutral-600 mt-1 uppercase tracking-wide">
            We are currently not accepting orders. Please check back later.
          </p>
        </div>
      )}

      {/* ── IMAGES ── */}
      <div className="w-full border-b-4 border-neutral-950 mt-8">
        <SpacesImage imageUrls={imageUrls} />
      </div>

      {/* ── DESCRIPTION ── */}
      {room.description && (
        <div className="px-6 md:px-20 py-8 border-b-4 border-neutral-950">
          <p className="text-lg font-bold italic text-neutral-600 leading-relaxed max-w-3xl">
            "{room.description}"
          </p>
        </div>
      )}

      {/* ── BEST SELLERS ── */}
      <div className="px-6 md:px-20 py-8 border-b-4 border-neutral-950">
        <BestSellers topItems={topItems} menuData={menuData} room={room} setSelectedMenu={handleSelectMenu} />
      </div>

      {/* ── MENU ── */}
      <div className="px-6 md:px-20 py-12">
        {Object.keys(groupedMenu).map((cat) => (
          <div key={cat} className="mb-16">
            {/* Category heading */}
            <div className="flex items-center gap-6 mb-8 border-b-[6px] border-neutral-950 pb-4">
              <h3 className="text-4xl font-black uppercase tracking-tighter">{cat}</h3>
              <span className="text-xs font-black tracking-[0.3em] uppercase text-red-600">MENU</span>
            </div>

            {Object.keys(groupedMenu[cat]).map((subType) => {
              const items = groupedMenu[cat][subType];
              return (
                <div key={subType} className="mb-10">
                  {subType !== 'Main Items' && (
                    <div className="flex items-center gap-3 mb-6">
                      <div className="h-1 w-6 bg-red-600" />
                      <h4 className="text-sm font-black uppercase tracking-[0.3em] text-neutral-500">{subType}</h4>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {items.map((m) => (
                      <div
                        key={m.idx}
                        onClick={() => { if (!m.isAvailable) return; handleSelectMenu(m); }}
                        className={`relative border-4 border-neutral-950 bg-white flex flex-col overflow-hidden transition-all duration-200 ${
                          m.isAvailable
                            ? 'cursor-pointer hover:border-red-600 hover:shadow-[4px_4px_0px_0px_rgba(220,38,38,1)] group'
                            : 'grayscale opacity-50 cursor-not-allowed'
                        }`}
                      >
                        {!m.isAvailable && (
                          <div className="absolute top-2 left-2 bg-neutral-950 text-white text-[9px] px-2 py-0.5 font-black uppercase tracking-widest z-10">
                            UNAVAILABLE
                          </div>
                        )}
                        {/* Image fills top of card */}
                        {m.image ? (
                          <img src={m.image} alt={m.name}
                            className="w-full aspect-square object-cover" />
                        ) : (
                          <div className="w-full aspect-square bg-neutral-100 flex items-center justify-center">
                            <span className="text-[9px] font-black uppercase text-neutral-400">No Image</span>
                          </div>
                        )}
                        {/* Black label bar always visible below image */}
                        <div className="bg-neutral-950 text-white px-3 py-3 flex flex-col items-center justify-center text-center h-full">
                          <h4 className="text-[10px] font-black uppercase tracking-tight leading-tight">{m.name}</h4>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* ── RATINGS ── */}
      <div className="px-6 md:px-20 pb-16 border-t-4 border-neutral-950 pt-12">
        <div className="mb-8">
          <span className="text-xs font-black tracking-[0.4em] text-red-600 uppercase block mb-2">REVIEWS</span>
          <h2 className="text-4xl font-black uppercase tracking-tighter">Customer Ratings</h2>
          <div className="h-2 w-24 bg-neutral-950 mt-4" />
        </div>
        <CustomerRatingCard roomName={room.name} />
      </div>

      {/* ── MENU POPUP ── */}
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
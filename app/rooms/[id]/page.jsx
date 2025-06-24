'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaChevronLeft } from 'react-icons/fa';
import getSingleSpace from '@/app/actions/getSingleSpace';
import SpacesImage from '@/components/SpacesImage';
import MenuPopUp from '@/components/MenuPopUp';
import CustomerRatingCard from '@/components/CustomerRatingCard';

const categories = ['Drinks', 'Add-ons', 'Meals', 'Snacks', 'Dessert'];

function RoomSpace({ params }) {
  const { id } = params;
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMenu, setSelectedMenu] = useState(null);

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

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-neutral-900">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-pink-600" />
      </div>
    );
  if (!room)
    return (
      <div className="text-white text-center mt-20 text-xl">Food Stall Not Found</div>
    );

  const bucketId = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ROOMS;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;
  const toURL = (fid) =>
    `https://cloud.appwrite.io/v1/storage/buckets/${bucketId}/files/${fid}/view?project=${projectId}`;

  const imageUrls = (room.images || []).map(toURL);
  const menuImageUrls = (room.menuImages || []).map(toURL);

  const menuAvailability =
    Array.isArray(room.menuAvailability) && room.menuAvailability.length === room.menuName?.length
      ? room.menuAvailability
      : new Array(room.menuName?.length || 0).fill(true);

  const menuData =
    (room.menuName || []).map((name, idx) => ({
      name,
      price: room.menuPrice?.[idx] ?? 0,
      description: room.menuDescription?.[idx] ?? '',
      image: menuImageUrls[idx] || null,
      type: room.menuType?.[idx] || 'Others',
      smallFee: room.menuSmall?.[idx] ?? 0,
      mediumFee: room.menuMedium?.[idx] ?? 0,
      largeFee: room.menuLarge?.[idx] ?? 0,
      isAvailable: menuAvailability[idx] ?? true,
      idx,
    })) || [];

  const addToCart = ({ name, basePrice, extraFee, quantity, size, image }) => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.push({
      menuName: name,
      menuPrice: basePrice + extraFee,
      basePrice,
      extraFee,
      size,
      quantity,
      menuImage: image,
      room_name: room.name,
    });
    localStorage.setItem('cart', JSON.stringify(cart));
    alert('Item added to cart!');
  };

  return (
    <div className="w-full min-h-screen bg-neutral-900 text-white px-8 pb-8">
      <Link
        href="/"
        className="flex items-center text-white hover:text-pink-500 transition duration-300 py-6"
      >
        <FaChevronLeft className="mr-2" />
        <span className="font-medium text-lg">Back</span>
      </Link>

      <div className="mt-12 sm:mt-16 text-center mb-8 px-4">
        <h2 className="text-lg sm:text-xl text-pink-600 font-light tracking-widest uppercase">
          Food Stall
        </h2>
        <p className="mt-4 text-2xl sm:text-5xl mb-28 font-extrabold leading-tight">
          {room.name}
        </p>
      </div>

      <div className="bg-neutral-900 rounded-xl p-6">
        <SpacesImage imageUrls={imageUrls} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-12 mb-20">
          <div className="flex flex-col items-center">
            <span className="font-semibold text-lg mb-2">Stall #:</span>
            <div className="w-20 h-20 rounded-full bg-pink-600 flex items-center justify-center shadow-lg">
              <p className="text-xl font-bold">{room.stallNumber || 'N/A'}</p>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-semibold text-lg">Type:</span>
            <p className="text-neutral-300 mt-2">
              {room.type?.join(' • ') || 'N/A'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-pink-600 text-white p-6 rounded-lg -mt-9 shadow-lg text-center">
        <p className="mt-2 italic text-lg">
          {room.description || 'Delicious food available here!'}
        </p>
      </div>

      <div className="mt-20 bg-neutral-900 rounded-xl p-4">
        {categories.map((cat) => {
          const items = menuData.filter((m) => m.type === cat);
          if (!items.length) return null;
          return (
            <div key={cat} className="mb-10">
              <h3 className="text-pink-500 font-semibold mb-4">{cat}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-7">
                {items.map((m) => (
                  <div
                    key={m.idx}
                    onClick={() => {
                      if (!m.isAvailable) return;
                      setSelectedMenu({
                        name: m.name,
                        price: m.price,
                        image: m.image,
                        roomName: room.name,
                        description: m.description,
                        smallFee: m.smallFee,
                        mediumFee: m.mediumFee,
                        largeFee: m.largeFee,
                      });
                    }}
                    className={`relative border border-pink-600 rounded-md bg-neutral-800 p-3 flex flex-col items-center transition ${
                      m.isAvailable
                        ? 'cursor-pointer hover:shadow-xl hover:scale-105'
                        : 'grayscale opacity-60 cursor-not-allowed'
                    }`}
                  >
                    {!m.isAvailable && (
                      <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-[10px] px-2 py-1 rounded font-bold z-10">
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
                    <h4 className="text-sm text-center">{m.name}</h4>
                    {m.description && (
                      <p className="text-xs italic text-neutral-400 text-center mb-1">
                        {m.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-neutral-900 rounded-xl p-6 mt-6">
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
          description={selectedMenu.description}
          onClose={() => setSelectedMenu(null)}
          onAddToCart={addToCart}
        />
      )}
    </div>
  );
}

export default RoomSpace;

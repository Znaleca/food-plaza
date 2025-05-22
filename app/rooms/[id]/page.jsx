'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaChevronLeft } from "react-icons/fa";
import getSingleSpace from "@/app/actions/getSingleSpace";
import SpacesImage from "@/components/SpacesImage";
import MenuPopUp from "@/components/MenuPopUp";
import CustomerRatingCard from "@/components/CustomerRatingCard";

const RoomSpace = ({ params }) => {
  const { id } = params;
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMenu, setSelectedMenu] = useState(null);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const data = await getSingleSpace(id);
        setRoom(data);
      } catch (error) {
        console.error("Error fetching room data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-neutral-900">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-pink-600"></div>
      </div>
    );
  }

  if (!room) {
    return <div className="text-white text-center mt-20 text-xl">Food Stall Not Found</div>;
  }

  const bucketId = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ROOMS;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;

  const imageUrls = room.images?.map(
    (imageId) =>
      `https://cloud.appwrite.io/v1/storage/buckets/${bucketId}/files/${imageId}/view?project=${projectId}`
  ) || [];

  const menuImageUrls = room.menuImages?.map(
    (imageId) =>
      `https://cloud.appwrite.io/v1/storage/buckets/${bucketId}/files/${imageId}/view?project=${projectId}`
  ) || [];

  const addToCart = (menuName, menuPrice, quantity, menuImage) => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.push({
      menuName,
      menuPrice,
      quantity,
      menuImage,
      room_name: room.name
    });
    localStorage.setItem("cart", JSON.stringify(cart));
    alert("Item added to cart!");
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
  <p className="mt-4 text-2xl sm:text-5xl mb-28 font-extrabold text-white leading-tight">
    {room.name}
  </p>
</div>


      <div className="bg-neutral-900 rounded-xl p-6">
        <SpacesImage imageUrls={imageUrls} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-12 mb-20">
          <div className="flex flex-col items-center">
            <span className="text-white font-semibold text-lg mb-2">Stall #:</span>
            <div className="w-20 h-20 flex items-center justify-center rounded-full bg-pink-600 shadow-lg">
              <p className="text-xl text-white font-bold">{room.stallNumber || "N/A"}</p>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-white font-semibold text-lg">Type:</span>
            <p className="text-neutral-300 mt-2">{room.type?.join(" • ") || "N/A"}</p>
          </div>
        </div>
      </div>

      <div className="bg-pink-600 text-white p-6 rounded-lg -mt-9 shadow-lg text-center">
        <p className="mt-2 italic text-lg">{room.description || "Delicious food available here!"}</p>
      </div>

      {/* Menu Section - Adjusted for smaller layout and 4 columns */}
      <div className="mt-20 bg-neutral-900 rounded-xl p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-7">
          {Array.isArray(room.menuName) && room.menuName.length > 0 ? (
            room.menuName.map((item, index) => (
              <div
                key={index}
                className="border border-pink-600 rounded-md bg-neutral-800 p-3 flex flex-col items-center cursor-pointer hover:shadow-xl hover:scale-105 transition duration-300"
                onClick={() =>
                  setSelectedMenu({
                    name: item,
                    price: room.menuPrice[index]?.toFixed(2),
                    image: menuImageUrls[index] || null,
                    roomName: room.name,
                    description: room.menuDescription[index] || ''
                  })
                }
              >
                {menuImageUrls[index] && (
                  <img
                    src={menuImageUrls[index]}
                    alt={item}
                    className="w-20 h-20 object-cover rounded-full mb-2 shadow-sm"
                  />
                )}
                <h4 className="text-sm text-white text-center">{item}</h4>
                {room.menuDescription && room.menuDescription[index] && (
                  <p className="text-xs text-neutral-400 text-center italic mb-1">
                    {room.menuDescription[index]}
                  </p>
                )}
                <p className="text-xs text-neutral-500">{`₱${room.menuPrice[index]?.toFixed(2)}`}</p>
              </div>
            ))
          ) : (
            <p className="text-neutral-400 text-lg text-center col-span-4">Menu not available</p>
          )}
        </div>
      </div>

      <div className="bg-neutral-900 rounded-xl p-6 mt-6">
        <CustomerRatingCard roomName={room.name} />
      </div>

      {selectedMenu && (
        <MenuPopUp
          item={selectedMenu.name}
          price={selectedMenu.price}
          menuImage={selectedMenu.image}
          roomName={selectedMenu.roomName}
          description={selectedMenu.description}
          onClose={() => setSelectedMenu(null)}
          onAddToCart={addToCart}
        />
      )}
    </div>
  );
};

export default RoomSpace;

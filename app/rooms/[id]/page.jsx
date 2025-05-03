"use client";

import { useEffect, useState } from "react";
import Heading from "@/components/Heading";
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
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  if (!room) {
    return <Heading title="Food Stall Not Found" />;
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
      room_name: room.name // Ensure the room name is stored correctly
    });
    localStorage.setItem("cart", JSON.stringify(cart));
    alert("Item added to cart!");
  };

  return (
    <div className="max-w-7xl mx-auto px-8 py-16 bg-gray-50"> {/* Increased max width and padding */}
      {/* Back Button */}
      <Link
        href="/"
        className="flex items-center text-black hover:text-gray-800 transition duration-300 mb-6"
      >
        <FaChevronLeft className="mr-2" />
        <span className="font-medium text-lg">Back to Food Stalls</span>
      </Link>

      {/* Title */}
      <Heading title={room.name} className="text-center text-4xl font-extrabold text-blue-600 mb-8" />

      {/* Content Card */}
      <div className="bg-white shadow-xl rounded-xl p-8 border border-gray-300 mb-8">
        {/* Images */}
        <div className="mb-6">
          <SpacesImage imageUrls={imageUrls} />
        </div>

        {/* Stall Number & Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Stall Number inside a Circular Border */}
          <div className="flex flex-col items-center">
            <span className="text-gray-800 font-semibold text-lg mb-2">Stall #:</span>
            <div className="w-24 h-24 flex items-center justify-center rounded-full bg-gray-900 shadow-lg">
              <p className="text-2xl text-white font-bold">{room.stallNumber || "N/A"}</p>
            </div>
          </div>

          {/* Type of Stall */}
          <div className="flex flex-col items-center">
            <span className="text-gray-800 font-semibold block text-lg">Type:</span>
            <p className="text-clip text-gray-500 font-normal mt-2">{room.type?.join(" • ") || "N/A"}</p>
          </div>
        </div>
      </div>

      {/* Room Details */}
      <div className="bg-pink-600 text-white p-6 rounded-lg text-center shadow-lg mb-6">
        <h2 className="text-3xl font-bold">{room.name}</h2>
        <p className="text-lg mt-2 italic">{room.description || "Delicious food available here!"}</p>
      </div>

      {/* Menu Section */}
      <div className="mt-10 bg-white shadow-xl rounded-xl p-8 mb-6">
        {/* Menu Heading */}
        <Heading title="Menu" className="text-2xl font-semibold mb-6 text-center text-gray-900" />

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {Array.isArray(room.menuName) && room.menuName.length > 0 ? (
            room.menuName.map((item, index) => (
              <div
                key={index}
                className="border border-pink-600 rounded-lg shadow-lg bg-white p-4 flex flex-col items-center cursor-pointer hover:shadow-2xl transform hover:scale-105 transition duration-300"
                onClick={() =>
                  setSelectedMenu({
                    name: item,
                    price: room.menuPrice[index]?.toFixed(2),
                    image: menuImageUrls[index] || null,
                    roomName: room.name,
                  })
                }
              >
                {menuImageUrls[index] && (
                  <img
                    src={menuImageUrls[index]}
                    alt={item}
                    className="w-32 h-32 object-cover rounded-full mb-3 shadow-md"
                  />
                )}
                <h4 className="text-lg font-normal text-gray-700">{item}</h4>
                <p className="text-sm text-gray-500">{`₱${room.menuPrice[index]?.toFixed(2)}`}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-600 text-lg text-center col-span-2">Menu not available</p>
          )}
        </div>
      </div>

      {/* Ratings Section */}
      <div className="mt-10 bg-white shadow-xl rounded-xl p-8 mb-6">
        <Heading title="Ratings" className="text-2xl font-semibold mb-6 text-center text-gray-900" />

        {/* Customer Rating Card */}
        <CustomerRatingCard roomName={room.name} />
      </div>

      {/* Menu Pop-Up */}
      {selectedMenu && (
        <MenuPopUp
          item={selectedMenu.name}
          price={selectedMenu.price}
          menuImage={selectedMenu.image}
          roomName={selectedMenu.roomName} // Pass roomName
          onClose={() => setSelectedMenu(null)}
          onAddToCart={addToCart}
        />
      )}
    </div>
  );
};

export default RoomSpace;

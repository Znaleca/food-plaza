"use client";

import { useEffect, useState } from "react";
import Heading from "@/components/Heading";
import Link from "next/link";
import { FaChevronLeft } from "react-icons/fa";
import getSingleSpace from "@/app/actions/getSingleSpace";
import SpacesImage from "@/components/SpacesImage";

const RoomSpace = ({ params }) => {
  const { id } = params;
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedItem, setExpandedItem] = useState(null);

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
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (!room) {
    return <Heading title="Food Stall Not Found" />;
  }

  const bucketId = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ROOMS;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;

  const imageUrls =
    room.images?.map(
      (imageId) =>
        `https://cloud.appwrite.io/v1/storage/buckets/${bucketId}/files/${imageId}/view?project=${projectId}`
    ) || [];

  const addToCart = (menuName, menuPrice) => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.push({ menuName, menuPrice });
    localStorage.setItem("cart", JSON.stringify(cart));
    alert("Item added to cart!");
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <Link
        href="/"
        className="flex items-center text-blue-500 hover:text-blue-700 transition duration-300 mb-6"
      >
        <FaChevronLeft className="mr-2" />
        <span className="font-medium text-lg">Back to Food Stalls</span>
      </Link>

      <Heading title={room.name} className="text-center text-4xl font-extrabold text-gray-900 mb-6" />

      <div className="bg-white shadow-lg rounded-xl p-8 border border-gray-200">
        <div className="mb-8">
          <SpacesImage imageUrls={imageUrls} />
        </div>

        <div className="bg-green-900 text-white p-6 rounded-lg text-center shadow-md mb-6">
          <h2 className="text-3xl font-bold">{room.name}</h2>
          <p className="text-lg mt-2 italic">{room.description || "Delicious food available here!"}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 border border-gray-300 rounded-lg shadow-md text-center">
            <span className="text-gray-700 font-semibold">Stall Number:</span>
            <p className="text-xl font-bold mt-1">{room.stallNumber || "N/A"}</p>
          </div>

          <div className="p-4 border border-gray-300 rounded-lg shadow-md text-center">
            <span className="text-gray-700 font-semibold">Type:</span>
            <p className="text-lg font-normal mt-1">{room.type?.join(" • ") || "N/A"}</p>
          </div>
        </div>
      </div>

      <div className="mt-10 p-6 border border-gray-300 rounded-lg shadow-md bg-gray-100">
        <h3 className="text-3xl font-semibold text-yellow-500 mb-4 text-center">Menu</h3>
        {Array.isArray(room.menuName) && room.menuName.length > 0 ? (
          <ul className="divide-y divide-gray-300">
            {room.menuName.map((item, index) => (
              <li key={index} className="py-4 px-4 text-gray-700">
                <div
                  className="flex justify-between items-center cursor-pointer py-2 hover:bg-gray-200 rounded-lg transition"
                  onClick={() => setExpandedItem(expandedItem === index ? null : index)}
                >
                  <span>{item}</span>
                  <span className="font-bold text-green-900 text-lg">₱{room.menuPrice[index]?.toFixed(2) || "N/A"}</span>
                </div>
                {expandedItem === index && (
                  <div className="mt-2 flex justify-center">
                    <button
                      onClick={() => addToCart(item, room.menuPrice[index]?.toFixed(2))}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                      Add to Cart
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600 text-lg text-center">Menu not available</p>
        )}
      </div>

      <div className="text-center mt-8">
        <Link href="/order/cart" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          View Cart
        </Link>
      </div>
    </div>
  );
};

export default RoomSpace;

"use client";

import { useEffect, useState } from "react";
import getSingleSpace from "@/app/actions/getSingleSpace";
import updateQuantities from "@/app/actions/updateQuantities";
import Heading from "@/components/Heading";
import StocksChart from "@/components/StocksChart"; // ✅ Import the chart

const PreviewStallPage = ({ params }) => {
  const { id } = params;
  const [stall, setStall] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState([]);

  useEffect(() => {
    const fetchStall = async () => {
      try {
        const data = await getSingleSpace(id);
        setStall(data);

        const initialQuantities =
          data.menuQuantity?.map((q) => (typeof q === "number" && !isNaN(q) ? q : 0)) ??
          new Array(data.menuName?.length).fill(0);

        setQuantities(initialQuantities);
      } catch (err) {
        console.error("Error loading stall:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStall();
  }, [id]);

  const handleQuantityChange = async (index, delta) => {
    const newQuantities = [...quantities];
    const currentValue = Number(newQuantities[index]);
    const newValue = isNaN(currentValue) ? 0 : currentValue + delta;
    newQuantities[index] = Math.max(0, newValue);
    setQuantities(newQuantities);

    try {
      const cleanedQuantities = newQuantities.map((q) =>
        typeof q === "number" && !isNaN(q) ? q : 0
      );
      await updateQuantities(id, cleanedQuantities);
    } catch (err) {
      console.error("Failed to update Appwrite:", err);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500"></div>
      </div>
    );

  if (!stall) return <p className="text-center mt-10">Stall not found.</p>;

  const bucketId = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ROOMS;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;

  const imageUrls =
    stall.images?.map(
      (imgId) =>
        `https://cloud.appwrite.io/v1/storage/buckets/${bucketId}/files/${imgId}/view?project=${projectId}`
    ) || [];

  const menuImageUrls =
    stall.menuImages?.map(
      (imgId) =>
        `https://cloud.appwrite.io/v1/storage/buckets/${bucketId}/files/${imgId}/view?project=${projectId}`
    ) || [];

  const chartData =
    stall.menuName?.map((name, idx) => ({
      name,
      quantity: quantities[idx] ?? 0,
    })) || [];

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 bg-gray-50">
      <Heading title={stall.name} />

      <div
        className="w-full h-96 bg-cover bg-center rounded-xl mb-8"
        style={{ backgroundImage: `url(${imageUrls[0]})` }}
      />

      <p className="italic text-gray-600 text-center mb-8">{stall.description}</p>

      <div className="bg-white shadow-lg rounded-xl p-8 border mb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-center mb-6">
          <div>
            <span className="block text-gray-800 text-lg font-semibold">Stall Number</span>
            <div className="w-24 h-24 mx-auto mt-2 flex items-center justify-center rounded-full bg-green-900 shadow-lg">
              <span className="text-white text-2xl font-bold">{stall.stallNumber}</span>
            </div>
          </div>
          <div>
            <span className="block text-gray-800 text-lg font-semibold">Type</span>
            <p className="text-gray-600 mt-3">{stall.type?.join(" • ") || "None"}</p>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-green-900 mb-4 text-center">Menu</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {stall.menuName?.map((name, idx) => (
          <div
            key={idx}
            className="bg-white border rounded-xl shadow-md p-4 flex flex-col items-center hover:shadow-xl transition-all"
          >
            {menuImageUrls[idx] && (
              <img
                src={menuImageUrls[idx]}
                alt={name}
                className="w-28 h-28 object-cover rounded-full mb-3 shadow"
              />
            )}
            <p className="text-lg font-medium text-gray-800">{name}</p>
            <p className="text-sm text-gray-500 mb-2">₱{stall.menuPrice?.[idx]?.toFixed(2)}</p>

            <div className="flex items-center gap-3 mt-2">
              <button
                onClick={() => handleQuantityChange(idx, -1)}
                className="bg-red-500 text-white w-8 h-8 rounded-full hover:bg-red-600"
              >
                −
              </button>
              <span className="text-lg font-semibold">{quantities[idx] ?? 0}</span>
              <button
                onClick={() => handleQuantityChange(idx, 1)}
                className="bg-green-500 text-white w-8 h-8 rounded-full hover:bg-green-600"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ✅ Stocks Chart Section */}
      <div className="mt-16 bg-white border rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-yellow-400 mb-4 text-center">Menu Chart</h2>
        <StocksChart data={chartData} />
      </div>
    </div>
  );
};

export default PreviewStallPage;

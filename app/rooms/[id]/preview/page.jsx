'use client';

import { useEffect, useState, useMemo } from 'react';
import getSingleSpace from '@/app/actions/getSingleSpace';
import updateQuantities from '@/app/actions/updateQuantities';
import getSales from '@/app/actions/getAllOrders';
import Heading from '@/components/Heading';
import StocksChart from '@/components/StocksChart';
import SalesCard from '@/components/SalesCard';
import CustomerRatingCard from '@/components/CustomerRatingCard';

const PreviewStallPage = ({ params }) => {
  const { id } = params;
  const [stall, setStall] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState([]);
  const [salesData, setSalesData] = useState([]);

  const bucketId = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ROOMS;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;

  useEffect(() => {
    const fetchStall = async () => {
      try {
        const data = await getSingleSpace(id);
        setStall(data);
        const initialQuantities =
          data.menuQuantity?.map((q) => (typeof q === 'number' ? q : 0)) ??
          new Array(data.menuName?.length).fill(0);
        setQuantities(initialQuantities);
      } catch (err) {
        console.error('Error loading stall:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStall();
  }, [id]);

  useEffect(() => {
    if (!stall) return;

    const loadSalesData = async () => {
      try {
        const res = await getSales();
        const allSales = res.orders || [];

        const filteredSales = allSales.filter((order) =>
          order.items.some((item) => item.room_name === stall.name)
        );

        setSalesData(filteredSales);
      } catch (err) {
        console.error('Failed to fetch sales data:', err);
      }
    };

    loadSalesData();
  }, [stall]);

  const handleQuantityChange = async (index, delta) => {
    const updated = [...quantities];
    const newValue = Math.max(0, (Number(updated[index]) || 0) + delta);
    updated[index] = newValue;
    setQuantities(updated);

    try {
      await updateQuantities(id, updated);
    } catch (err) {
      console.error('Failed to update Appwrite:', err);
    }
  };

  const imageUrls = useMemo(() => {
    return (
      stall?.images?.map(
        (imgId) =>
          `https://cloud.appwrite.io/v1/storage/buckets/${bucketId}/files/${imgId}/view?project=${projectId}`
      ) || []
    );
  }, [stall]);

  const menuImageUrls = useMemo(() => {
    return (
      stall?.menuImages?.map(
        (imgId) =>
          `https://cloud.appwrite.io/v1/storage/buckets/${bucketId}/files/${imgId}/view?project=${projectId}`
      ) || []
    );
  }, [stall]);

  const chartData = useMemo(() => {
    return (
      stall?.menuName?.map((name, idx) => ({
        name,
        quantity: quantities[idx] ?? 0,
      })) || []
    );
  }, [stall, quantities]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500" />
      </div>
    );
  }

  if (!stall) {
    return <p className="text-center mt-10">Stall not found.</p>;
  }

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-12 bg-white text-black rounded-2xl shadow-lg">
      <Heading title={stall.name} className="text-4xl font-bold mb-6 text-center text-gray-900" />

      <div
        className="w-full h-96 bg-cover bg-center rounded-2xl mb-8 shadow-xl"
        style={{ backgroundImage: `url(${imageUrls[0] ?? ''})` }}
        aria-label={`${stall.name} image`}
      />

      <p className="italic text-gray-700 text-center mb-8 text-lg">{stall.description}</p>

      {/* Stall Info */}
      <div className="bg-white shadow-xl rounded-2xl p-8 mb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-center mb-6">
          <div>
            <span className="block text-black text-lg font-semibold">Stall Number</span>
            <div className="w-32 h-32 mx-auto mt-2 flex items-center justify-center rounded-full bg-black shadow-xl">
              <span className="text-white text-3xl font-bold">{stall.stallNumber}</span>
            </div>
          </div>
          <div>
            <span className="block text-black text-lg font-semibold">Type</span>
            <p className="text-gray-600 mt-3">{stall.type?.join(' • ') || 'None'}</p>
          </div>
        </div>
      </div>

      {/* Menu Section */}
      <Heading title="My Menu" className="text-2xl font-semibold mb-8 text-center text-gray-900" />

      <div className="bg-white shadow-xl rounded-2xl p-8 mb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {stall.menuName?.map((name, idx) => (
            <div
              key={idx}
              className="bg-white text-black rounded-2xl shadow-xl p-6 flex flex-col items-center border border-yellow-400 hover:border-yellow-500 transition-all duration-300"
            >
              {menuImageUrls[idx] ? (
                <img
                  src={menuImageUrls[idx]}
                  alt={name}
                  className="w-36 h-36 object-cover rounded-full mb-4 shadow-md"
                />
              ) : (
                <div className="w-36 h-36 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                  <span className="text-gray-500">No Image</span>
                </div>
              )}
              <p className="text-xl font-medium">{name}</p>
              <p className="text-sm text-gray-600 mb-4">
                ₱{stall.menuPrice?.[idx]?.toFixed(2) ?? '0.00'}
              </p>

              <div className="flex items-center gap-6 mt-4">
                <button
                  onClick={() => handleQuantityChange(idx, -1)}
                  className="bg-black text-white w-12 h-12 rounded-full hover:bg-gray-800 transition"
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="text-xl font-semibold">{quantities[idx] ?? 0}</span>
                <button
                  onClick={() => handleQuantityChange(idx, 1)}
                  className="bg-black text-white w-12 h-12 rounded-full hover:bg-gray-800 transition"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Inventory Section */}
      <div className="mt-16 p-8 bg-white shadow-xl rounded-2xl mb-16">
        <Heading title="Inventory" className="text-2xl font-semibold mb-6 text-center text-gray-900" />
        <StocksChart data={chartData} />
      </div>

      {/* Sales */}
      <div className="mt-16 bg-white rounded-2xl shadow-xl p-12">
        <Heading title="Food Stall Sales" className="text-2xl font-semibold mb-6 text-center text-gray-900" />
        <SalesCard roomName={stall.name} />
      </div>

      {/* Ratings */}
      <div className="mt-16 bg-white rounded-2xl shadow-xl p-12">
        <Heading title="Ratings" className="text-2xl font-semibold mb-6 text-center text-gray-900" />
        <CustomerRatingCard roomName={stall.name} />
      </div>
    </div>
  );
};

export default PreviewStallPage;

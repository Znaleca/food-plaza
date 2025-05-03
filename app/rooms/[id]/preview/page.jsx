'use client';

import { useEffect, useState } from 'react';
import getSingleSpace from '@/app/actions/getSingleSpace';
import updateQuantities from '@/app/actions/updateQuantities';
import Heading from '@/components/Heading';
import StocksChart from '@/components/StocksChart'; 
import SalesCard from '@/components/SalesCard'; 
import getSales from '@/app/actions/getAllOrders'; 
import CustomerRatingCard from '@/components/CustomerRatingCard';

const PreviewStallPage = ({ params }) => {
  const { id } = params;
  const [stall, setStall] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState([]);
  const [salesData, setSalesData] = useState([]);

  // Fetch the stall data
  useEffect(() => {
    const fetchStall = async () => {
      try {
        const data = await getSingleSpace(id);
        setStall(data);

        const initialQuantities =
          data.menuQuantity?.map((q) => (typeof q === 'number' && !isNaN(q) ? q : 0)) ??
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

  // Fetch sales data only after the stall is loaded
  useEffect(() => {
    if (!stall) return; // Ensure stall is available before loading sales data

    const loadSalesData = async () => {
      try {
        const res = await getSales();  // Assuming getSales fetches all sales data
        const allSales = res.orders || [];

        // Filter sales by the room name (stall name)
        const filteredSales = allSales.filter((order) =>
          order.items.some((item) => item.room_name === stall.name)  // Filter by stall name
        );

        setSalesData(filteredSales);
      } catch (err) {
        console.error('Failed to fetch sales data:', err);
      }
    };

    loadSalesData();
  }, [stall]);  // Trigger this useEffect when the `stall` object changes

  const handleQuantityChange = async (index, delta) => {
    const newQuantities = [...quantities];
    const currentValue = Number(newQuantities[index]);
    const newValue = isNaN(currentValue) ? 0 : currentValue + delta;
    newQuantities[index] = Math.max(0, newValue);
    setQuantities(newQuantities);

    try {
      const cleanedQuantities = newQuantities.map((q) =>
        typeof q === 'number' && !isNaN(q) ? q : 0
      );
      await updateQuantities(id, cleanedQuantities);
    } catch (err) {
      console.error('Failed to update Appwrite:', err);
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
    <div className="max-w-screen-xl mx-auto px-6 py-12 bg-white text-black rounded-2xl shadow-lg">
      <Heading title={stall.name} className="text-4xl font-bold mb-6 text-center text-gray-900" />

      <div
        className="w-full h-96 bg-cover bg-center rounded-2xl mb-8 shadow-xl"
        style={{ backgroundImage: `url(${imageUrls[0]})` }}
      />

      <p className="italic text-gray-700 text-center mb-8 text-lg">{stall.description}</p>

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

      <Heading title="My Menu" className="text-2xl font-semibold mb-8 text-center text-gray-900" />
      
      <div className="bg-white shadow-xl rounded-2xl p-8 mb-16">
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
    {stall.menuName?.map((name, idx) => (
      <div
        key={idx}
        className="bg-white text-black rounded-2xl shadow-xl p-6 flex flex-col items-center border border-yellow-400 hover:border-yellow-500 transition-all duration-300"
      >
        {menuImageUrls[idx] && (
          <img
            src={menuImageUrls[idx]}
            alt={name}
            className="w-36 h-36 object-cover rounded-full mb-4 shadow-md"
          />
        )}
        <p className="text-xl font-medium text-black">{name}</p>
        <p className="text-sm text-gray-600 mb-4">₱{stall.menuPrice?.[idx]?.toFixed(2)}</p>

        <div className="flex items-center gap-6 mt-4">
          <button
            onClick={() => handleQuantityChange(idx, -1)}
            className="bg-black text-white w-12 h-12 rounded-full hover:bg-gray-800 transition-all duration-300"
          >
            −
          </button>
          <span className="text-xl font-semibold">{quantities[idx] ?? 0}</span>
          <button
            onClick={() => handleQuantityChange(idx, 1)}
            className="bg-black text-white w-12 h-12 rounded-full hover:bg-gray-800 transition-all duration-300"
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

      {/* Sales Card Section */}
      <div className="mt-16 bg-white rounded-2xl shadow-xl p-12">
        <Heading title="Food Stall Sales" className="text-2xl font-semibold mb-6 text-center text-gray-900" />
        <SalesCard roomName={stall.name} /> {/* Pass stall name as roomName */}
      </div>
      <div className="mt-16 bg-white rounded-2xl shadow-xl p-12">
        <Heading title="Ratings" className="text-2xl font-semibold mb-6 text-center text-gray-900" />
        <CustomerRatingCard roomName={stall.name} />
      </div>
    </div>
  );
};

export default PreviewStallPage;

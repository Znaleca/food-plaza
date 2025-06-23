'use client';

import { useEffect, useState, useMemo } from 'react';
import getSingleSpace from '@/app/actions/getSingleSpace';
import getSales from '@/app/actions/getAllOrders';
import Heading from '@/components/Heading';
import SalesCard from '@/components/SalesCard';
import CustomerRatingCard from '@/components/CustomerRatingCard';
import Link from 'next/link';
import { FaChevronLeft } from 'react-icons/fa6';

const categories = ['Drinks', 'Add-ons', 'Meals', 'Snacks', 'Dessert'];

const PreviewStallPage = ({ params }) => {
  const { id } = params;
  const [stall, setStall] = useState(null);
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState([]);

  const bucketId = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ROOMS;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;

  useEffect(() => {
    const fetchStall = async () => {
      try {
        const data = await getSingleSpace(id);
        setStall(data);
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

  const toURL = (fid) =>
    `https://cloud.appwrite.io/v1/storage/buckets/${bucketId}/files/${fid}/view?project=${projectId}`;

  const imageUrls = useMemo(() => (stall?.images || []).map(toURL), [stall]);
  const menuImageUrls = useMemo(() => (stall?.menuImages || []).map(toURL), [stall]);

  const menuData =
    (stall?.menuName || []).map((name, idx) => ({
      name,
      price: stall.menuPrice?.[idx] ?? 0,
      description: stall.menuDescription?.[idx] ?? '',
      image: menuImageUrls[idx] || null,
      type: stall.menuType?.[idx] || 'Others',
      small: stall.menuSmall?.[idx] ?? 0,
      medium: stall.menuMedium?.[idx] ?? 0,
      large: stall.menuLarge?.[idx] ?? 0,
    })) || [];

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-neutral-900">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-pink-600" />
      </div>
    );

  if (!stall)
    return (
      <div className="text-white text-center mt-20 text-xl">Food Stall Not Found</div>
    );

  return (
    <div className="w-full min-h-screen bg-neutral-900 text-white px-8 pb-8">
      <Link
        href="/rooms/my"
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
          {stall.name}
        </p>
      </div>

      <div className="bg-neutral-900 rounded-xl p-6">
        <img
          src={imageUrls[0]}
          alt="Stall Cover"
          className="rounded-xl w-full h-80 object-cover mb-6"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-12 mb-20">
          <div className="flex flex-col items-center">
            <span className="font-semibold text-lg mb-2">Stall #:</span>
            <div className="w-20 h-20 rounded-full bg-pink-600 flex items-center justify-center shadow-lg">
              <p className="text-xl font-bold">{stall.stallNumber || 'N/A'}</p>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-semibold text-lg">Type:</span>
            <p className="text-neutral-300 mt-2">{stall.type?.join(' • ') || 'N/A'}</p>
          </div>
        </div>
      </div>

      <div className="bg-pink-600 text-white p-6 rounded-lg -mt-9 shadow-lg text-center">
        <p className="mt-2 italic text-lg">
          {stall.description || 'Delicious food available here!'}
        </p>
      </div>

      {/* Grouped Menu Display */}
      <div className="mt-20 bg-neutral-900 rounded-xl p-4">
        {categories.map((cat) => {
          const items = menuData.filter((m) => m.type === cat);
          if (!items.length) return null;
          return (
            <div key={cat} className="mb-10">
              <h3 className="text-pink-500 font-semibold mb-4">{cat}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-7">
                {items.map((m, idx) => {
                  const hasSizes = m.small > 0 || m.medium > 0 || m.large > 0;

                  return (
                    <div
                      key={idx}
                      className="border border-pink-600 rounded-md bg-neutral-800 p-3 flex flex-col items-center"
                    >
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

                      <div className="mt-2 flex gap-2 flex-wrap justify-center">
                        {hasSizes ? (
                          <>
                            {m.small > 0 && (
                              <span className="bg-pink-600 text-white text-xs px-2 py-1 rounded-full">
                                S
                              </span>
                            )}
                            {m.medium > 0 && (
                              <span className="bg-pink-600 text-white text-xs px-2 py-1 rounded-full">
                                M
                              </span>
                            )}
                            {m.large > 0 && (
                              <span className="bg-pink-600 text-white text-xs px-2 py-1 rounded-full">
                                L
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="bg-pink-600 text-white text-xs px-2 py-1 rounded-full">
                            One-size
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-neutral-900 rounded-xl p-6 mt-6">
        <SalesCard roomName={stall.name} />
      </div>

      <div className="bg-neutral-900 rounded-xl p-6 mt-6">
        <CustomerRatingCard roomName={stall.name} />
      </div>
    </div>
  );
};

export default PreviewStallPage;

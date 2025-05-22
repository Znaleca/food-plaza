import React from 'react';
import getPromos from '@/app/actions/getPromos';
import PromosCard from '@/components/PromosCard';

const PromosPage = async () => {
  const promos = await getPromos();

  return (
    <div className="container mx-auto py-12 bg-neutral-900 text-white">
      {/* Matching Header Theme */}
      <div className="text-center mb-40 mt-5 px-4">
        <h2 className="text-lg sm:text-1xl text-pink-600 font-light tracking-widest">ALL PROMOTIONS</h2>
        <p className="mt-4 text-xl sm:text-5xl font-bold text-white tracking-widest">
          Explore current deals and marketing offers.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {promos && promos.length > 0 ? (
          promos.map((promo) => (
            <PromosCard key={promo.$id} promo={promo} />
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500">No promos available.</p>
        )}
      </div>
    </div>
  );
};

export default PromosPage;

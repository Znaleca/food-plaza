import React from 'react';
import getPromos from '@/app/actions/getPromos';
import PromosCard from '@/components/PromosCard';
import Heading from '@/components/Heading'; // Ensure you have this component

const PromosPage = async () => {
  const promos = await getPromos();
  
  return (
    <div className="container mx-auto py-12">
      <Heading title="All Promos" />
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

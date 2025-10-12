// src/app/lessees/LesseesAccountPage.jsx
import LesseesAccountCard from '@/components/LesseesAccountCard';
import Link from 'next/link';
import { FaChevronLeft } from 'react-icons/fa6';
import getAllLesseesWithStalls from '../actions/getAllLesseesWithStalls';

const LesseesAccountPage = async () => {
  const lesseesWithStalls = await getAllLesseesWithStalls();

  return (
    <div className="min-h-screen bg-neutral-900 text-white p-6">
      {/* Back Button */}
      <Link
        href="/lease/management"
        className="flex items-center text-yellow-400 hover:text-pink-400 transition duration-300 py-6"
      >
        <FaChevronLeft className="mr-2" />
        <span className="font-medium text-lg">Back</span>
      </Link>

      {/* Header Section */}
      <div className="text-center mb-12 px-4">
        <h2 className="text-lg sm:text-xl text-pink-600 font-light tracking-widest">
          LESSEE INFORMATION
        </h2>
        <p className="mt-4 text-xl sm:text-5xl font-bold text-white">Account & Stall</p>
      </div>

      {/* Display No Data Message or Card Grid */}
      {!lesseesWithStalls || lesseesWithStalls.length === 0 ? (
        <p className="text-gray-400 mt-4 text-center">No lessee accounts found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {lesseesWithStalls.map((lessee, index) => (
            <LesseesAccountCard key={lessee.$id || lessee.stallNumber || index} lessee={lessee} />
          ))}
        </div>
      )}
    </div>
  );
};

export default LesseesAccountPage;

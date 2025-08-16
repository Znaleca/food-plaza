
import MySpaceCard from '@/components/MySpaceCard';
import getMySpaces from '@/app/actions/getMySpaces';
import getStallStatus from '@/app/actions/getStallStatus';
import Link from 'next/link';
import { FaChevronLeft } from 'react-icons/fa6';

const MySpacePage = async () => {
  const rooms = await getMySpaces();

  // Filter rooms that have been approved based on booking status
  const approvedRooms = await Promise.all(
    rooms.map(async (room) => {
      const status = await getStallStatus(room.$id);
      return status && status.status === 'approved' ? room : null;
    })
  );

  const filteredRooms = approvedRooms.filter((room) => room !== null); // Remove null values

  return (
    <div className="bg-neutral-900 min-h-screen text-white p-6">
      <Link
        href="/foodstall"
        className="flex items-center text-white hover:text-pink-500 transition duration-300 py-6"
      >
        <FaChevronLeft className="mr-2" />
        <span className="font-medium text-lg">Back</span>
      </Link>

      <div className="text-center mb-24 px-4">
        <h2 className="text-lg sm:text-xl text-pink-600 font-light tracking-widest uppercase">
          My Food Stall
        </h2>
        <p className="mt-4 text-2xl sm:text-5xl font-extrabold text-white leading-tight">
          Preview
        </p>
      </div>

      {filteredRooms.length > 0 ? (
        filteredRooms.map((room) => <MySpaceCard key={room.$id} room={room} />)
      ) : (
        <p>You have no approved Food Stall listings</p>
      )}
    </div>
  );
};

export default MySpacePage;

import RoomCard from '@/components/SpaceCard';
import getAllSpaces from '@/app/actions/getAllSpaces';
import Heading from '@/components/Heading';

export default async function Home() {
  const rooms = await getAllSpaces();

  return (
    <>
      {/* Heading Section */}
      <Heading title="Available Spaces" className="text-center mb-12 text-4xl font-bold text-gray-900 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Loading State */}
        {rooms.length === 0 ? (
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin h-12 w-12 border-4 border-t-transparent border-blue-500 border-solid rounded-full"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {rooms.map((room) => (
              <RoomCard room={room} key={room.$id} />
            ))}
          </div>
        )}

        {/* No Spaces Available Message */}
        {rooms.length === 0 && (
          <p className="text-center col-span-full text-lg text-gray-500">
            No spaces available at the moment. Please check back later.
          </p>
        )}
      </div>
    </>
  );
}

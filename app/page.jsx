import getAllSpaces from '@/app/actions/getAllSpaces';
import Heading from '@/components/Heading';
import SpaceCard from '@/components/SpaceCard';

export default async function Home() {
  const rooms = await getAllSpaces();

  return (
    <>
      <Heading 
        title="Food Stalls" 
        className="text-center mb-12 text-4xl font-bold text-gray-900 
        bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 
        bg-clip-text text-transparent" 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {rooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96">
            <div className="animate-spin h-12 w-12 border-4 border-t-transparent border-blue-500 border-solid rounded-full"></div>
            <p className="mt-4 text-lg text-gray-500">
              No spaces available at the moment. Please check back later.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-12">
            {rooms.map((room) => (
              <div key={room.$id} className="flex justify-center">
                <SpaceCard room={room} />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

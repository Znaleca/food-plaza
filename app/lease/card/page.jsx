import getAllSpaces from '@/app/actions/getAllSpaces';
import Heading from '@/components/Heading';
import LeaseCard from '@/components/LeaseCard';

export default async function Home() {
  const rooms = await getAllSpaces();

  return (
    <>
      <Heading 
        title="Stall Lease" 
        className="text-center mb-12 text-4xl font-bold text-gray-900 
                  bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 
                  bg-clip-text text-transparent" 
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {rooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96">
            <div className="animate-spin h-12 w-12 border-4 border-t-transparent border-blue-500 
                        border-solid rounded-full"></div>
            <p className="mt-4 text-lg text-gray-500">
              No spaces available at the moment. Please check back later.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {rooms.map((room) => (
              <LeaseCard key={room.$id} room={room} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

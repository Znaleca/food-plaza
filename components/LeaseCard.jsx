import Link from 'next/link';

const LeaseCard = ({ room }) => {
  return (
    <div 
      className="relative flex w-full max-w-2xl bg-white shadow-lg rounded-xl overflow-hidden 
                transition-transform transform hover:scale-105 hover:shadow-2xl border-4 border-yellow-400 p-6"
      style={{
        backgroundImage: "url('/images/card.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-xl"></div>

      {/* Details Section */}
      <div className="relative w-full flex flex-col items-center justify-center z-10">
        <h3 className="text-2xl font-extrabold text-white tracking-wide uppercase text-center mb-4">
          Stall#:
        </h3>

        <div className="w-20 h-20 flex items-center justify-center rounded-full bg-white shadow-lg">
          <p className="text-2xl text-black font-bold">{room.stallNumber || "N/A"}</p>
        </div>

        {/* Call-to-Action */}
        <div className="mt-4 w-full">
          <Link 
            href={`/lease/${room.$id}`} 
            className="block text-center bg-yellow-400 text-white 
                      py-2 px-4 rounded-md shadow-md text-sm font-semibold tracking-wide transition-all 
                      hover:bg-yellow-500 hover:shadow-lg transform hover:scale-105"
          >
            View Lease
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LeaseCard;

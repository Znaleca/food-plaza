import Link from 'next/link';

const LeaseCard = ({ room }) => {
  return (
    <div 
      className="relative flex w-full max-w-2xl bg-white shadow-lg rounded-xl overflow-hidden 
                transition-transform transform hover:scale-105 hover:shadow-2xl border-2 border-pink-400 p-6"
    >
      {/* Details Section */}
      <div className="relative w-full flex flex-col items-center justify-center z-10">
        <h3 className="text-2xl font-extrabold text-black tracking-wide uppercase text-center mb-4">
          Stall#:
        </h3>

        <div className="w-20 h-20 flex items-center justify-center rounded-full bg-black shadow-lg">
          <p className="text-2xl text-white font-bold">{room.stallNumber || "N/A"}</p>
        </div>

        {/* Call-to-Action */}
        <div className="mt-4 w-full">
          <Link 
            href={`/lease/${room.$id}`} 
            className="block text-center bg-pink-600 text-white 
                      py-2 px-4 rounded-md shadow-md text-sm font-semibold tracking-wide transition-all 
                      hover:bg-pink-700 hover:shadow-lg transform hover:scale-105"
          >
            View Lease
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LeaseCard;

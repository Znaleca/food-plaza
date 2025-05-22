import Link from 'next/link';

const LeaseCard = ({ room }) => {
  return (
    <div className="bg-neutral-900 border border-pink-600 rounded-xl p-6 flex flex-col justify-center items-center text-center hover:bg-neutral-950 transition-all duration-300">
      {/* Decorative Line Above Title */}
      <div className="w-16 h-0.5 bg-pink-600 mb-6" />

      {/* Stall Title */}
      <h3 className="text-base font-bold text-white tracking-widest uppercase mb-4">
        Stall #{room.stallNumber || "N/A"}
      </h3>

      {/* Decorative Line Below Title */}
      <div className="w-16 h-0.5 bg-gray-600 mb-6" />

      {/* Lease Button */}
      <Link
        href={`/lease/${room.$id}`}
        className="mt-4 inline-block bg-pink-600 text-white py-2 px-4 rounded-md text-sm font-semibold tracking-wide transition-all hover:bg-pink-700 hover:scale-105"
      >
        View Lease
      </Link>
    </div>
  );
};

export default LeaseCard;

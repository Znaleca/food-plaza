'use client';

import Link from "next/link";
// Updated imports: Added FaClipboardUser
import { FaNewspaper, FaClipboardList, FaCalendarAlt } from "react-icons/fa";
import { FaChevronLeft, FaClipboardUser } from "react-icons/fa6"; 

// Updated links array with a new entry for "Manage Lessees"
const links = [
  {
    href: "/lease/card",
    icon: <FaNewspaper className="text-3xl" />,
    label: "Lease Food Stall",
  },
  {
    href: "/bookings",
    icon: <FaClipboardList className="text-3xl" />,
    label: "Lease Status",
  },
  {
    href: "/lease-calendar",
    icon: <FaCalendarAlt className="text-3xl" />,
    label: "Calendar",
  },
  {
    // New link for managing lessees
    href: "/lessees", // You can adjust the href as needed
    icon: <FaClipboardUser className="text-3xl" />,
    label: "Lessee Accounts",
  },
];

const LeasePage = () => {
  return (
    <div className="min-h-screen bg-neutral-900 text-white p-6">
      {/* Back Button */}
      <Link
        href="/admin"
        className="flex items-center text-yellow-400 hover:text-pink-400 transition duration-300 py-6"
      >
        <FaChevronLeft className="mr-2" />
        <span className="font-medium text-lg">Back</span>
      </Link>

      {/* Heading */}
      <div className="text-center mb-10">
        <h2 className="text-yellow-500 uppercase text-sm tracking-widest">Admin</h2>
        <h1 className="text-4xl font-bold mt-2">Lease Management</h1>
      </div>

      {/* Lease Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {links.map(({ href, icon, label }, idx) => (
          <Link
            key={idx}
            href={href}
            className="group flex items-center gap-4 px-6 py-5 rounded-xl transition-all duration-300 ease-in-out
              bg-neutral-800 text-white border border-neutral-700
              hover:bg-gradient-to-r hover:from-yellow-500 hover:to-pink-500 hover:text-white transform hover:scale-[1.02]"
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white text-black text-2xl transition-colors duration-300 group-hover:bg-yellow-300 group-hover:text-black">
              {icon}
            </div>
            <span className="text-base font-semibold tracking-wide group-hover:text-white">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default LeasePage;
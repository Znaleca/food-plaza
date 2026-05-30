'use client';

import Link from "next/link";
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
    <div className="min-h-screen bg-white text-neutral-950 selection:bg-red-600 selection:text-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        <Link
          href="/admin"
          className="inline-flex items-center border-2 border-neutral-950 bg-white px-4 py-2 text-xs font-black uppercase tracking-widest text-neutral-950 shadow-[4px_4px_0px_#000] transition-transform hover:-translate-y-1 hover:bg-neutral-950 hover:text-white"
        >
          <FaChevronLeft className="mr-2" />
          Back
        </Link>

        <section className="relative mt-6 mb-8 overflow-hidden border-4 border-neutral-950 bg-white px-6 py-8 shadow-[8px_8px_0px_#000] sm:px-8 sm:py-10">
          <div className="absolute top-0 left-0 h-3 w-24 bg-red-600" />
          <div className="absolute bottom-0 right-0 h-3 w-24 bg-red-600" />
          <p className="text-xs font-black tracking-[0.45em] uppercase text-red-600 mb-3">
            Admin Module
          </p>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tighter uppercase text-neutral-950 leading-none">
            Lease Management
          </h1>
          <p className="mt-4 max-w-2xl text-sm sm:text-base text-neutral-600 font-medium leading-relaxed">
            Jump into lease actions, calendar views, and lessee tools from a cleaner admin hub.
          </p>
        </section>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
          {links.map(({ href, icon, label }, idx) => (
            <Link
              key={idx}
              href={href}
              className="group flex items-center gap-4 border-4 border-neutral-950 bg-white px-5 py-5 shadow-[6px_6px_0px_#000] transition-all duration-200 hover:-translate-y-1 hover:bg-neutral-950 hover:text-white"
            >
              <div className="flex h-12 w-12 items-center justify-center border-2 border-neutral-950 bg-red-600 text-white transition-colors group-hover:bg-white group-hover:text-neutral-950">
                {icon}
              </div>
              <div>
                <p className="text-xs font-black tracking-[0.35em] uppercase text-red-600 group-hover:text-red-400">
                  Admin Link
                </p>
                <span className="mt-1 block text-base font-black uppercase tracking-tight">
                  {label}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LeasePage;
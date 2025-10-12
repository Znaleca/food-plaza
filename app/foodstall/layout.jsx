'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  FaHouse,
  FaBullhorn,
  FaTags,
  FaBagShopping,
  FaStore,
  FaTableColumns,
  FaHandHoldingDollar,
} from 'react-icons/fa6';
import { FaChevronRight, FaChevronLeft } from 'react-icons/fa';

export default function FoodStallLayout({ children }) {
  const [isHovered, setIsHovered] = useState(false);

  const baseLinks = [
    { href: '/foodstall', icon: <FaHouse />, label: 'Dashboard' },
    { href: '/foodstall/add-promos', icon: <FaBullhorn />, label: 'Create Promos' },
    { href: '/foodstall/promos', icon: <FaTags />, label: 'Promotions' },
    { href: '/foodstall/order-status', icon: <FaBagShopping />, label: 'Orders' },
    { href: '/foodstall/approval', icon: <FaHandHoldingDollar />, label: 'Stall Lease' },
    { href: '/rooms/my', icon: <FaStore />, label: 'My Food Stall' },
  ];

  const links = baseLinks.filter(Boolean);

  return (
    <div className="flex min-h-screen bg-neutral-900 text-neutral-100 relative">
      {/* Sidebar */}
      <aside
        className={`bg-neutral-800 shadow-xl px-6 py-8 w-64 z-40 transition-transform duration-300 
        fixed top-0 left-0 h-full overflow-y-auto scrollbar-thin
        md:relative md:translate-x-0 md:flex md:flex-col
        ${isHovered ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold tracking-widest text-white">Stall Panel</h2>
          <div className="h-1 w-20 bg-gradient-to-r from-pink-500 to-purple-500 mt-2 rounded-full"></div>
        </div>

        <nav className="space-y-2">
          {links.map(({ href, icon, label }, idx) => (
            <Link
              key={idx}
              href={href}
              className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-pink-600 hover:to-purple-600 hover:text-white transition-all duration-300 ease-in-out group"
            >
              <div className="p-2 rounded-xl bg-white text-black group-hover:text-pink-600 transition">
                {icon}
              </div>
              <span className="text-sm font-semibold tracking-wide">{label}</span>
            </Link>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-neutral-700 text-xs text-pink-400">
          <p>&copy; {new Date().getFullYear()} The Corner | Manage with ease.</p>
        </div>
      </aside>

      {/* Floating Arrow Toggle (Mobile only) */}
      <button
        className="fixed top-1/2 -translate-y-1/2 bg-neutral-700 text-white rounded-full p-2 shadow-lg md:hidden z-50 transition-all duration-300"
        style={{
          left: isHovered ? '16rem' : '0.5rem', // Move to sidebar edge when open
        }}
        onClick={() => setIsHovered(!isHovered)}
      >
        {isHovered ? <FaChevronLeft /> : <FaChevronRight />}
      </button>

      {/* Main Content */}
      <main className="flex-1 px-6 py-8 overflow-y-auto">{children}</main>
    </div>
  );
}

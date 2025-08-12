'use client';

import { useEffect, useState, startTransition } from 'react';
import Link from 'next/link';
import {
  FaHouse,
  FaSquarePlus,
  FaBullhorn,
  FaTags,
  FaBagShopping,
  FaStore,
  FaTableColumns,
  FaHandHoldingDollar,
} from 'react-icons/fa6';

export default function FoodStallLayout({ children }) {
  const [isHovered, setIsHovered] = useState(false);
  const [hasSpace, setHasSpace] = useState(null); // null = loading

  useEffect(() => {
    startTransition(async () => {
      const { default: getMySpaces } = await import('@/app/actions/getMySpaces');
      const rooms = await getMySpaces();
      setHasSpace(rooms.length > 0); // true if user has at least one stall
    });
  }, []);

  const baseLinks = [
    { href: '/foodstall', icon: <FaHouse />, label: 'Dashboard' },
    hasSpace === false && { href: '/rooms/add', icon: <FaSquarePlus />, label: 'Add Food Stall' },
    { href: '/foodstall/add-promos', icon: <FaBullhorn />, label: 'Create Promos' },
    { href: '/foodstall/promos', icon: <FaTags />, label: 'Promotions' },
    { href: '/foodstall/order-status', icon: <FaBagShopping />, label: 'Orders' },
    { href: '/foodstall/approval', icon: <FaHandHoldingDollar />, label: 'Stall Lease' },
    { href: '/rooms/my', icon: <FaStore />, label: 'My Food Stall' },
    { href: '/foodstall/tables', icon: <FaTableColumns />, label: 'Tables' },
  ];

  const links = baseLinks.filter(Boolean);

  return (
    <div className="flex min-h-screen bg-neutral-900 text-neutral-100 relative">
      {/* Hover trigger for mobile */}
      <div
        className="fixed top-0 left-0 h-full w-4 z-40 md:hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />

      {/* Sidebar */}
      <aside
        className={`bg-neutral-800 shadow-xl px-6 py-8 w-64 z-50 transition-transform duration-300 
        fixed top-0 left-0 h-full overflow-y-auto scrollbar-thin
        md:relative md:translate-x-0 md:flex md:flex-col
        ${isHovered ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
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

      {/* Main Content */}
      <main className="flex-1 px-6 py-8 overflow-y-auto">{children}</main>
    </div>
  );
}

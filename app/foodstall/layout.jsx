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
  const [isCollapsed, setIsCollapsed] = useState(false);

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
    <div className="min-h-screen bg-white text-neutral-950 relative overflow-hidden selection:bg-red-600 selection:text-white md:flex md:flex-row md:items-stretch">
      <div className="relative md:flex md:items-stretch">
        {/* Sidebar */}
        <aside
          className={`relative z-40 flex h-full min-h-screen flex-col overflow-y-auto border-r-4 border-neutral-950 bg-white py-5 shadow-[8px_0px_0px_#000] transition-all duration-300 ease-in-out ${
            isCollapsed ? 'w-20 px-2' : 'w-72 px-4'
          }`}
        >
          <div className={`mb-6 border-4 border-neutral-950 bg-white py-4 shadow-[6px_6px_0px_#000] ${isCollapsed ? 'px-2' : 'px-4'}`}>
            <p className="mb-2 text-xs font-black tracking-[0.4em] uppercase text-red-600">
              {isCollapsed ? 'SP' : 'Stall Panel'}
            </p>
            {!isCollapsed && (
              <>
                <h2 className="text-2xl font-black tracking-tighter uppercase text-neutral-950">
                  Food Stall
                </h2>
                <div className="mt-3 h-2 w-24 border-2 border-neutral-950 bg-red-600" />
              </>
            )}
          </div>

          <nav className="flex-1 space-y-2">
            {links.map(({ href, icon, label }, idx) => (
              <Link
                key={idx}
                href={href}
                className={`group flex items-center border-2 border-neutral-950 bg-white font-black uppercase tracking-wider text-neutral-950 shadow-[4px_4px_0px_#000] transition-all duration-200 hover:-translate-y-1 hover:bg-neutral-950 hover:text-white ${
                  isCollapsed ? 'justify-center gap-0 px-2 py-3' : 'gap-4 px-3 py-3'
                }`}
              >
                <div className="flex h-10 w-10 items-center justify-center border-2 border-neutral-950 bg-red-600 text-white transition-colors group-hover:bg-white group-hover:text-neutral-950">
                  {icon}
                </div>
                {!isCollapsed && <span className="text-sm">{label}</span>}
              </Link>
            ))}
          </nav>

          <div className={`mt-auto border-t-4 border-neutral-950 pt-6 text-xs font-black uppercase tracking-widest text-neutral-500 ${isCollapsed ? 'px-2' : ''}`}>
            {!isCollapsed && <p>&copy; {new Date().getFullYear()} The Corner.</p>}
          </div>
        </aside>

        <button
          type="button"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="fixed top-1/2 z-50 -translate-y-1/2 border-4 border-neutral-950 bg-white p-3 text-neutral-950 shadow-[4px_4px_0px_#000] transition-transform duration-300 hover:scale-105"
          style={{ left: isCollapsed ? '4rem' : '17rem' }}
          onClick={() => setIsCollapsed((current) => !current)}
        >
          {isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
        </button>
      </div>

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-y-auto bg-white px-2 py-4 sm:px-4 sm:py-6 lg:px-5">{children}</main>
    </div>
  );
}

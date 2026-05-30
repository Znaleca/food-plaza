"use client";

import { useState } from "react";
import Link from "next/link";
import { FaHome, FaUser, FaUsers } from "react-icons/fa";
import { FaHandHoldingDollar, FaSquarePlus } from "react-icons/fa6";
import { FaChevronRight, FaChevronLeft } from "react-icons/fa";

const adminLinks = [
  { href: "/admin", icon: <FaHome />, label: "Dashboard" },
  { href: "/admin/add", icon: <FaSquarePlus />, label: "Create Stall" },
  { href: "/admin/create-account", icon: <FaUser />, label: "Create Lessee Account" },
  { href: "/admin/accounts", icon: <FaUsers />, label: "All Accounts" },
  { href: "/lease/management", icon: <FaHandHoldingDollar />, label: "Lease Management" },
];

export default function AdminLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const mainOffsetClass = isSidebarOpen ? "md:ml-72" : "md:ml-20";

  return (
    <div className="min-h-screen bg-white text-neutral-950 relative overflow-hidden selection:bg-red-600 selection:text-white">
      <button
        type="button"
        onClick={() => setIsSidebarOpen((prev) => !prev)}
        className="fixed top-[calc(6rem+50%)] z-[60] -translate-y-1/2 border-4 border-neutral-950 bg-white p-3 text-neutral-950 shadow-[4px_4px_0px_#000] transition-transform hover:-translate-y-[calc(50%-2px)]"
        style={{ left: isSidebarOpen ? '17rem' : '4rem' }}
        aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
      >
        {isSidebarOpen ? <FaChevronLeft /> : <FaChevronRight />}
      </button>

      {/* Sidebar */}
      <aside
        style={{ width: isSidebarOpen ? '18rem' : '5rem' }}
        className={`fixed top-24 left-0 z-40 h-[calc(100vh-6rem)] overflow-y-auto border-r-4 border-neutral-950 bg-white py-6 shadow-[8px_0px_0px_#000] transition-all duration-300 ease-in-out
        ${isSidebarOpen ? "translate-x-0 px-5" : "translate-x-0 px-3"}`}
      >
        {/* Header */}
        <div className={`mb-8 border-4 border-neutral-950 bg-white py-4 shadow-[6px_6px_0px_#000] ${isSidebarOpen ? "px-4" : "px-3"}`}>
          <p className={`text-xs font-black tracking-[0.4em] uppercase text-red-600 mb-2 ${isSidebarOpen ? "block" : "hidden"}`}>
            Admin Shell
          </p>
          <h2 className={`font-black tracking-tighter uppercase text-neutral-950 ${isSidebarOpen ? "text-2xl" : "text-sm text-center leading-tight"}`}>
            {isSidebarOpen ? "Control Panel" : "AP"}
          </h2>
          <div className={`mt-3 h-2 bg-red-600 border-2 border-neutral-950 ${isSidebarOpen ? "w-24" : "w-10 mx-auto"}`} />
        </div>

        {/* Navigation */}
        <nav className="space-y-3">
          {adminLinks.map(({ href, icon, label }, idx) => (
            <Link
              key={idx}
              href={href}
              className={`group flex items-center border-2 border-neutral-950 bg-white font-black uppercase tracking-wider text-neutral-950 shadow-[4px_4px_0px_#000] transition-all duration-200 hover:-translate-y-1 hover:bg-neutral-950 hover:text-white ${isSidebarOpen ? "gap-4 px-4 py-3" : "justify-center px-2 py-3"}`}
            >
              <div className="flex h-10 w-10 items-center justify-center border-2 border-neutral-950 bg-red-600 text-white transition-colors group-hover:bg-white group-hover:text-neutral-950">
                {icon}
              </div>
              <span className={`${isSidebarOpen ? "text-sm" : "hidden"}`}>{label}</span>
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className={`mt-auto pt-6 border-t-4 border-neutral-950 text-xs font-black uppercase tracking-widest text-neutral-500 ${isSidebarOpen ? "px-0" : "px-1 text-center"}`}>
          <p>{isSidebarOpen ? `© ${new Date().getFullYear()} Admin Panel.` : `© ${new Date().getFullYear()}`}</p>
        </div>
      </aside>

      {/* Main content */}
      <main className={`min-h-screen min-w-0 px-2 sm:px-4 lg:px-5 py-4 sm:py-6 overflow-y-auto bg-white transition-[margin-left] duration-300 ${mainOffsetClass} md:pt-28`}>
        {children}
      </main>

    </div>
  );
}

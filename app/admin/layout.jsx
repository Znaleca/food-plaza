"use client";

import { useState } from "react";
import Link from "next/link";
import { FaHome, FaUser, FaUsers } from "react-icons/fa";
import { FaHandHoldingDollar, FaSquarePlus } from "react-icons/fa6";
import { FaChevronRight, FaChevronLeft } from "react-icons/fa";

const adminLinks = [
  { href: "/admin", icon: <FaHome />, label: "Dashboard" },
  { href: "/admin/add", icon: <FaSquarePlus />, label: "Create Stall" },
  { href: "/admin/create-account", icon: <FaUser />, label: "Create Account" },
  { href: "/admin/accounts", icon: <FaUsers />, label: "All Accounts" },
  { href: "/lease/management", icon: <FaHandHoldingDollar />, label: "Lease Management" },
];

export default function AdminLayout({ children }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="flex min-h-screen bg-neutral-900 text-neutral-100 relative">
      {/* Sidebar */}
      <aside
        className={`bg-neutral-800 shadow-xl px-6 py-8 w-64 z-50 transition-transform duration-300
        fixed top-0 left-0 h-full overflow-y-auto scrollbar-thin
        md:relative md:translate-x-0 md:flex md:flex-col
        ${isHovered ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-extrabold tracking-widest text-white">Admin Panel</h2>
          <div className="h-1 w-20 bg-gradient-to-r from-yellow-400 to-pink-500 mt-2 rounded-full"></div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {adminLinks.map(({ href, icon, label }, idx) => (
            <Link
              key={idx}
              href={href}
              className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-yellow-500 hover:to-pink-500 hover:text-white transition-all duration-300 ease-in-out group"
            >
              <div className="p-2 rounded-xl bg-white text-black group-hover:text-yellow-500 transition text-lg">
                {icon}
              </div>
              <span className="text-sm font-semibold tracking-wide">{label}</span>
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="mt-auto pt-6 border-t border-neutral-700 text-xs text-yellow-400">
          <p>&copy; {new Date().getFullYear()} Admin Panel | Secure Access.</p>
        </div>
      </aside>

      {/* Floating Arrow Toggle (Mobile only) */}
      <button
        className={`fixed top-1/2 -translate-y-1/2 bg-neutral-700 text-white rounded-full p-2 shadow-lg md:hidden z-50 transition-all duration-300`}
        style={{
          left: isHovered ? "16rem" : "0.5rem", // 16rem = 64 (sidebar width in Tailwind)
        }}
        onClick={() => setIsHovered(!isHovered)}
      >
        {isHovered ? <FaChevronLeft /> : <FaChevronRight />}
      </button>

      {/* Main content */}
      <main className="flex-1 px-6 py-8 overflow-y-auto">{children}</main>
    </div>
  );
}

'use client';

import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import logo from '@/assets/images/logo.svg';
import { FaUser, FaSignInAlt, FaSignOutAlt, FaBuilding, FaBars, FaTimes, FaUserPlus } from 'react-icons/fa';
import { FaGear, FaSquarePlus, FaUserGear, FaCircleUser, FaNewspaper } from "react-icons/fa6";
import { useState } from "react";
import destroySession from "@/app/actions/destroySession";
import { toast } from "react-toastify";
import { useAuth } from '@/context/authContext';


const Header = () => {
  const router = useRouter();
  const { isAuthenticated, setIsAuthenticated, currentUser, roles } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isOfficeDropdownOpen, setOfficeDropdownOpen] = useState(false);
  const [isSuperAdminDropdownOpen, setSuperAdminDropdownOpen] = useState(false);

  const handleLogout = async () => {
    const { success, error } = await destroySession();
    if (success) {
      setIsAuthenticated(false);
      router.push('/login');
    } else {
      toast.error(error || "Logout failed.");
    }
  };

  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);
  const toggleAdminDropdown = () => {
    setIsAdminDropdownOpen((prev) => !prev);
    setOfficeDropdownOpen(false); // Close the office dropdown when admin dropdown opens
  };
  const toggleOfficeDropdown = () => {
    setOfficeDropdownOpen((prev) => !prev);
    setIsAdminDropdownOpen(false); // Close the admin dropdown when office dropdown opens
  };
  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);

  return (
    <header className="bg-white shadow-md">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center">
          <Link href="/home" className="flex items-center">
            <Image src={logo} alt="UniSpaces" className="h-12 w-12" priority />
            <span className="ml-2 text-2xl font-extrabold text-gray-800 tracking-widest">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-pink-500">
                UNI
              </span>
              <span className="text-gray-800">SPACES</span>
            </span>
          </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link href="/home" className="rounded-md px-3 py-2 text-sm font-medium text-gray-800 hover:text-gray-500">
                Home
              </Link>
              <Link href="/" className="rounded-md px-3 py-2 text-sm font-medium text-gray-800 hover:text-gray-500">
                Spaces
              </Link>
              {isAuthenticated && (
                <Link href="/bookings" className="rounded-md px-3 py-2 text-sm font-medium text-gray-800 hover:text-gray-500">
                  My Reservations
                </Link>
              )}
              {roles.isOffice && (
                <Link href="/reservations" className="rounded-md px-3 py-2 text-sm font-medium text-gray-800 hover:text-gray-500">
                  All Reservations
                </Link>
              )}
              {roles.isOffice && (
                <Link href="/calendarView" className="rounded-md px-3 py-2 text-sm font-medium text-gray-800 hover:text-gray-500">
                  Calendar View
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="text-gray-800 focus:outline-none"
            >
              {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>

          {/* Account Controls */}
          <div className="hidden md:block ml-auto">
            <div className="flex items-center">
              {!isAuthenticated ? (
                <>
                  <Link href="/login" className="mr-3 text-gray-800 hover:text-gray-500">
                    <FaSignInAlt className="inline mr-1" /> Login
                  </Link>
                  <Link href="/register" className="mr-3 text-gray-800 hover:text-gray-500">
                    <FaUser className="inline mr-1" /> Register
                  </Link>
                </>
              ) : (
                <>
                  {roles.isAdmin && (
                    <div className="relative">
                      <button
                        onClick={toggleAdminDropdown}
                        className="mx-3 py-2 text-sm font-medium text-gray-800 hover:text-gray-500"
                      >
                        <FaUserGear className="inline mr-1" /> Admin Panel
                      </button>
                      {isAdminDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                          <Link
                            href="/rooms/my"
                            className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100"
                          >
                            <FaBuilding className="inline mr-1" /> My Spaces
                          </Link>
                          <Link
                            href="/rooms/add"
                            className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100"
                          >
                            <FaSquarePlus className="inline mr-1" /> Add Spaces
                          </Link>
                        </div>
                      )}
                    </div>
                  )}

                  {roles.isOffice && (
                    <div className="relative">
                      <button
                        onClick={toggleOfficeDropdown}
                        className="mx-3 py-2 text-sm font-medium text-gray-800 hover:text-gray-500"
                      >
                        <FaUserGear className="inline mr-1" /> Office Panel
                      </button>
                      {isOfficeDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                          <Link
                            href="/office/approval"
                            className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100"
                          >
                            <FaNewspaper className="inline mr-1" /> Approvals
                          </Link>
                        </div>
                      )}
                    </div>
                  )}

                  {roles.isSuperAdmin && (
                    <div className="relative">
                      <button
                        onClick={() => {
                          setSuperAdminDropdownOpen((prev) => !prev);
                          setIsAdminDropdownOpen(false); // Ensure other dropdowns are closed
                          setOfficeDropdownOpen(false);
                        }}
                        className="mx-3 py-2 text-sm font-medium text-gray-800 hover:text-gray-500"
                      >
                        <FaUserGear className="inline mr-1" /> SuperAdmin Panel
                      </button>
                      {isSuperAdminDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                          <Link
                            href="/create-account"
                            className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100"
                          >
                            <FaUserPlus className="inline mr-1" /> Create Account
                          </Link>
                          <Link
                            href="/all-accounts"
                            className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100"
                          >
                            <FaUserPlus className="inline mr-1" /> All Accounts
                          </Link>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="relative">
                    <button
                      onClick={toggleDropdown}
                      className="relative flex items-center px-4 py-2 space-x-2 text-sm font-medium text-gray-800 bg-white border border-gray-300 rounded-full shadow hover:border-gray-500 focus:outline-none"
                    >
                      <FaBars className="text-lg" />
                      <FaCircleUser className="text-lg" />
                    </button>
                    {isDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                        <div className="block px-4 py-2 text-sm text-gray-800 font-semibold border-b border-gray-200">
                          Welcome! {currentUser?.name || "User"}
                        </div>
                        <Link
                          href="/account"
                          className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100"
                        >
                          <FaGear className="inline mr-1 text-xl" /> Account Settings
                        </Link>
                        <Link
                          href="/about"
                          className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100"
                        >
                          <FaNewspaper className="inline mr-1 text-xl" /> About
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-gray-100"
                        >
                          <FaSignOutAlt className="inline mr-1 text-xl" /> Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
              <Link href="/home" className="block rounded-md px-3 py-2 text-base font-medium text-gray-800 hover:bg-gray-700 hover:text-white">
                Home
              </Link>
              <Link href="/" className="block rounded-md px-3 py-2 text-base font-medium text-gray-800 hover:bg-gray-700 hover:text-white">
                Spaces
              </Link>
              {isAuthenticated && (
                <>
                  <Link href="/bookings" className="block rounded-md px-3 py-2 text-base font-medium text-gray-800 hover:bg-gray-700 hover:text-white">
                    My Reservations
                  </Link>
                  {roles.isAdmin && (
                    <>
                      <Link href="/rooms/my" className="block rounded-md px-3 py-2 text-base font-medium text-gray-800 hover:bg-gray-700 hover:text-white">
                        My Spaces
                      </Link>
                      <Link href="/rooms/add" className="block rounded-md px-3 py-2 text-base font-medium text-gray-800 hover:bg-gray-700 hover:text-white">
                        Add Spaces
                      </Link>
                    </>
                  )}
                  {roles.isOffice && (
                    <>
                      <Link href="/office/dashboard" className="block rounded-md px-3 py-2 text-base font-medium text-gray-800 hover:bg-gray-700 hover:text-white">
                        Dashboard
                      </Link>
                      <Link href="/office/reports" className="block rounded-md px-3 py-2 text-base font-medium text-gray-800 hover:bg-gray-700 hover:text-white">
                        Reports
                      </Link>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;

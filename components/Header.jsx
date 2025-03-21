'use client';

import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import logo from '@/assets/images/logo.svg';
import { FaUser, FaSignInAlt, FaSignOutAlt, FaBars, FaTimes, FaUserPlus, FaUserCircle } from 'react-icons/fa';
import { FaGear, FaSquarePlus, FaUserGear, FaCircleUser, FaNewspaper, FaBox, FaStore, FaCartShopping } from "react-icons/fa6";
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
  const [isFoodstallDropdownOpen, setFoodstallDropdownOpen] = useState(false);
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
    setFoodstallDropdownOpen(false); 
  };
  const toggleFoodstallDropdown = () => {
    setFoodstallDropdownOpen((prev) => !prev);
    setIsAdminDropdownOpen(false); // Close admin dropdown when opening foodstall dropdown
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
                <span className="bg-clip-text text-transparent bg-yellow-400">
                  THE
                </span>
                <span className="text-blue-400"> CORNER</span>
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
                Food Stalls
              </Link>

              {roles.isCustomer && (
                <>
                  <Link href="/customer/promos" className="rounded-md px-3 py-2 text-sm font-medium text-gray-800 hover:text-gray-500">
                    Promotions
                  </Link>
                  
                </>
              )}
              {roles.isAdmin && (
                <>
                  <Link href="/calendarView" className="rounded-md px-3 py-2 text-sm font-medium text-gray-800 hover:text-gray-500">
                    Calendar
                  </Link>
                  <Link href="/admin/sales" className="rounded-md px-3 py-2 text-sm font-medium text-gray-800 hover:text-gray-500">
                    Sales
                  </Link>
                </>
              )}
              {roles.isFoodstall && (
                <>
                  <Link href="/calendarView" className="rounded-md px-3 py-2 text-sm font-medium text-gray-800 hover:text-gray-500">
                    Calendar
                  </Link>
                  <Link href="/foodstall/sales" className="rounded-md px-3 py-2 text-sm font-medium text-gray-800 hover:text-gray-500">
                    Sales
                  </Link>
                  <Link href="/foodstall/order-status" className="rounded-md px-3 py-2 text-sm font-medium text-gray-800 hover:text-gray-500">
                    Order Status
                  </Link>
                </>
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
      <div className="relative">
        {/* Cart Icon */}
        <Link href="/order/cart" className="mr-3 text-gray-800 hover:text-gray-500">
          <FaCartShopping className="inline" />
        </Link>

        {/* User Icon with Dropdown */}
        <button
          onClick={toggleDropdown}
          className="mx-3 py-2 text-sm font-medium text-gray-800 hover:text-gray-500"
        >
          <FaBars size={20} className="inline" />
          
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
            <Link href="/login" className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100">
              <FaSignInAlt  className="inline mr-1" /> Login
            </Link>
            <Link href="/register" className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100">
              <FaUserPlus className="inline mr-1" /> Register
            </Link>
          </div>
        )}
      </div>
    ) : (
      <>
       

             

                  <Link href="/order/cart" className="mr-3 text-gray-800 hover:text-gray-500">
                    <FaCartShopping className="inline mr-1" />
                  </Link>
                  
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
                          <Link href="/rooms/my" className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100">
                            <FaStore className="inline mr-1" /> All Food Stall
                          </Link>
                          <Link href="/rooms/add" className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100">
                            <FaSquarePlus className="inline mr-1" /> Add Food Stall
                          </Link>
                          <Link href="/office/approval" className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100">
                            <FaNewspaper className="inline mr-1" /> Lease Status
                          </Link>
                        </div>
                      )}
                    </div>
                  )}

                  {roles.isFoodstall && (
                    <div className="relative">
                      <button
                        onClick={toggleFoodstallDropdown}
                        className="mx-3 py-2 text-sm font-medium text-gray-800 hover:text-gray-500"
                      >
                        <FaUserGear className="inline mr-1" /> Food Stall Panel
                      </button>
                      {isFoodstallDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                          <Link href="/foodstall/my" className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100">
                            <FaStore className="inline mr-1" /> My Food Stall
                          </Link>
                          <Link href="/foodstall/inventory" className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100">
                            <FaBox className="inline mr-1" /> Inventory
                          </Link>
                          <Link href="/foodstall/lease" className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100">
                            <FaNewspaper className="inline mr-1" /> Lease Status
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
        setIsAdminDropdownOpen(false); // Close other dropdowns
        setFoodstallDropdownOpen(false);
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
                        <Link href="/account" className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100">
                          <FaGear className="inline mr-1 text-xl" /> Account Settings
                        </Link>
                        <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-gray-100">
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
      </nav>
    </header>
  );
};

export default Header;

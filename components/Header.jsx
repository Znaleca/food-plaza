'use client';

import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import logo from '@/assets/images/logo.svg';
import { FaSignInAlt, FaSignOutAlt, FaBars, FaTimes, FaUserPlus, FaHome, FaUtensils, FaBoxOpen, FaTools, FaStore } from 'react-icons/fa';
import { FaGear, FaCircleUser, FaCartShopping, FaGift, FaBarsProgress, FaCaretRight } from "react-icons/fa6";
import { useState } from "react";
import destroySession from "@/app/actions/destroySession";
import { toast } from "react-toastify";
import { useAuth } from '@/context/authContext';

const Header = () => {
  const router = useRouter();
  const {
    isAuthenticated,
    setIsAuthenticated,
    currentUser,
    setCurrentUser,
    labels,
    setLabels
  } = useAuth();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isAdmin = labels.includes("admin");
  const isCustomer = labels.includes("customer");
  const isFoodstall = labels.includes("foodstall");

  const handleLogout = async () => {
    const { success, error } = await destroySession();
    if (success) {
      setIsAuthenticated(false);
      setCurrentUser(null);
      setLabels([]);
      router.push('/login');
    } else {
      toast.error(error || "Logout failed.");
    }
  };

  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);
  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);

  return (
    <header className="bg-neutral-800 shadow-md">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center">
            {(isAdmin || isFoodstall || !isAuthenticated) ? (
              <div className="flex items-center cursor-default">
                <Image src={logo} alt="TheCorner" className="h-12 w-12" priority />
                <span className="ml-2 text-2xl font-extrabold text-white tracking-widest">
                  <span className="bg-clip-text text-transparent bg-white tracking-widest">THE</span>
                  <span className="text-white tracking-widest"> CORNER</span>
                </span>
              </div>
            ) : (
              <Link href="/home" className="flex items-center">
                <Image src={logo} alt="TheCorner" className="h-12 w-12" priority />
                <span className="ml-2 text-2xl font-extrabold text-white tracking-widest">
                  <span className="bg-clip-text text-transparent bg-white tracking-widest">THE</span>
                  <span className="text-white tracking-widest"> CORNER</span>
                </span>
              </Link>
            )}
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center gap-6 text-sm font-medium text-white">
              {isAuthenticated && !isAdmin && !isFoodstall && (
                <>
                  <Link href="/home" className="flex items-center gap-2 hover:text-pink-600 transition tracking-wider">
                     Home
                  </Link>
                  <Link href="/" className="flex items-center gap-2 hover:text-pink-600 transition tracking-wider">
                    Browse
                  </Link>
                  <Link href="/customer/order-status" className="flex items-center gap-2 hover:text-pink-600 transition tracking-wider">
                    My Orders
                  </Link>
                </>
              )}

              {isCustomer && (
                <Link href="/customer/promos" className="flex items-center gap-2 hover:text-pink-600 transition tracking-wider">
                   Promotions
                </Link>
              )}

              {isAdmin && (
                <>
                  <span className="text-gray-400">|</span>
                  <Link href="/admin" className="flex items-center gap-2 hover:text-yellow-400 transition">
                    <FaCaretRight className="text-lg" /> Admin Panel
                  </Link>
                </>
              )}

              {isFoodstall && (
                <>
                  <span className="text-gray-400">|</span>
                  <Link href="/foodstall" className="flex items-center gap-2 tracking-widest hover:text-pink-600 transition">
                    <FaCaretRight className="text-lg" /> Stall Panel
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="text-white focus:outline-none"
            >
              {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>

          {/* Account Controls */}
          <div className="hidden md:block ml-auto">
            <div className="flex items-center">
              {!isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={toggleDropdown}
                    className="mx-3 py-2 text-sm font-medium text-white hover:text-gray-500"
                  >
                    <FaBars size={20} className="inline" />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                      <Link href="/login" className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100">
                        <FaSignInAlt className="inline mr-1" /> Login
                      </Link>
                      <Link href="/register" className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100">
                        <FaUserPlus className="inline mr-1" /> Register
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {!isAdmin && !isFoodstall && (
                    <Link href="/order/cart" className="mr-3 text-white hover:text-pink-600">
                      <FaCartShopping className="inline mr-1" />
                    </Link>
                  )}

                  <div className="relative">
                    <button
                      onClick={toggleDropdown}
                      className="relative flex items-center px-4 py-2 space-x-2 text-sm font-medium text-white bg-neutral-800 border-2 border-gray-300 rounded-full shadow hover:border-pink-600 focus:outline-none"
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

        {/* Mobile Menu Content */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 space-y-2 text-white bg-neutral-800 rounded-md p-4 z-50">
            {isAuthenticated && !isAdmin && !isFoodstall && (
              <>
                <Link href="/home" className="flex items-center gap-2 hover:text-pink-600 transition">
                  <FaHome className="text-lg" /> Home
                </Link>
                <Link href="/" className="flex items-center gap-2 hover:text-pink-600 transition">
                  <FaUtensils className="text-lg" /> Browse
                </Link>
                <Link href="/customer/order-status" className="flex items-center gap-2 hover:text-pink-600 transition">
                  <FaBoxOpen className="text-lg" /> My Orders
                </Link>
              </>
            )}

            {isCustomer && (
              <Link href="/customer/promos" className="flex items-center gap-2 hover:text-pink-600 transition">
                <FaGift className="text-lg" /> Promotions
              </Link>
            )}

            {isAdmin && (
              <Link href="/admin" className="flex items-center gap-2 hover:text-pink-600 transition">
                <FaCaretRight className="text-lg" /> Admin Panel
              </Link>
            )}
 {isFoodstall && (
                
                  <Link href="/foodstall" className="flex items-center gap-2 tracking-widest hover:text-pink-600 transition">
                    <FaCaretRight className="text-lg" /> Stall Panel
                  </Link>
                
              )}
            

            <hr className="border-gray-600 my-2" />

            {!isAuthenticated ? (
              <>
                <Link href="/login" className="flex items-center gap-2 hover:text-pink-600 transition">
                  <FaSignInAlt className="text-lg" /> Login
                </Link>
                <Link href="/register" className="flex items-center gap-2 hover:text-pink-600 transition">
                  <FaUserPlus className="text-lg" /> Register
                </Link>
              </>
            ) : (
              <>
                {!isAdmin && !isFoodstall && (
                  <Link href="/order/cart" className="flex items-center gap-2 hover:text-pink-600 transition">
                    <FaCartShopping className="text-lg" /> Cart
                  </Link>
                )}
                <Link href="/account" className="flex items-center gap-2 hover:text-pink-600 transition">
                  <FaGear className="text-lg" /> Account Settings
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-2 text-white hover:text-red-500 transition">
                  <FaSignOutAlt className="text-lg" /> Sign Out
                </button>
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;

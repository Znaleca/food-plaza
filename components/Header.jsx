// Header.js

'use client';

import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import logo from '@/assets/images/logo.svg';
import { FaSignInAlt, FaSignOutAlt, FaBars, FaTimes, FaUserPlus, FaHome, FaBoxOpen, FaGift, FaCaretRight } from 'react-icons/fa';
import { FaGear, FaCircleUser, FaCartShopping } from "react-icons/fa6";
import { useState, useEffect } from "react";
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
    setLabels,
    cartCount,
    setCartCount
  } = useAuth();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isAdmin = labels.includes("admin");
  const isCustomer = labels.includes("customer");
  const isFoodstall = labels.includes("foodstall");

  useEffect(() => {
    const updateCartCount = () => {
      const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
      const count = savedCart.reduce((sum, item) => sum + (item.quantity || 1), 0);
      setCartCount(count);
    };

    updateCartCount();
    window.addEventListener('storage', updateCartCount);

    return () => {
      window.removeEventListener('storage', updateCartCount);
    };
  }, [setCartCount]);

  const handleLogout = async () => {
    const { success, error } = await destroySession();
    if (success) {
      setIsAuthenticated(false);
      setCurrentUser(null);
      setLabels([]);
      setCartCount(0);
      router.push('/login');
    } else {
      toast.error(error || "Logout failed.");
    }
  };

  const toggleDropdown = () => setIsDropdownOpen(prev => !prev);
  const toggleMobileMenu = () => setIsMobileMenuOpen(prev => !prev);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest('.relative')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // NEW: Function to handle smooth scrolling to sections
  const handleScrollToSection = (e, sectionId) => {
    e.preventDefault(); // Prevent default link behavior
    
    // Check if we are on the homepage
    if (window.location.pathname !== '/') {
      // If not, navigate to the homepage and the browser's default hash behavior will take over
      router.push(`/#${sectionId}`);
    } else {
      // If we are already on the homepage, perform the smooth scroll
      const section = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };


  return (
    <header className="bg-neutral-800 shadow-md">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            {(isAdmin || isFoodstall) ? (
              <div className="flex items-center cursor-default">
                <Image src={logo} alt="TheCorner" className="h-12 w-12" priority />
                <span className="ml-2 text-2xl font-extrabold text-white tracking-widest">
                  <span className="bg-clip-text text-transparent bg-white">THE</span>
                  <span className="text-white"> CORNER</span>
                </span>
              </div>
            ) : (
              <Link href="/" className="flex items-center">
                <Image src={logo} alt="TheCorner" className="h-12 w-12" priority />
                <span className="ml-2 text-2xl font-extrabold text-white tracking-widest">
                  <span className="bg-clip-text text-transparent bg-white">THE</span>
                  <span className="text-white"> CORNER</span>
                </span>
              </Link>
            )}
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center gap-6 text-sm font-medium text-white">
            {!isAuthenticated && (
                <>
                  <Link href="/" className="hover:text-pink-600 transition">Home</Link>
                  <Link href="/#browse" onClick={(e) => handleScrollToSection(e, 'browse')} className="hover:text-pink-600 transition">Browse</Link>

                  <Link href="/#about-us" onClick={(e) => handleScrollToSection(e, 'about-us')} className="hover:text-pink-600 transition">About Us</Link>
                  <Link href="/customer/promos" className="hover:text-pink-600 transition">Promotions</Link>

                </>
              )}

              {isCustomer &&(
                <>
                <Link href="/" className="hover:text-pink-600 transition">Home</Link>
                <Link href="/#browse" onClick={(e) => handleScrollToSection(e, 'browse')} className="hover:text-pink-600 transition">Browse</Link>

                <Link href="/customer/order-status" className="hover:text-pink-600 transition">My Orders</Link>
                <Link href="/#about-us" onClick={(e) => handleScrollToSection(e, 'about-us')} className="hover:text-pink-600 transition">About Us</Link>
                <Link href="/customer/promos" className="hover:text-pink-600 transition">Promotions</Link>
                </>
              )}

              {isAdmin && (
                <>
                  <span className="text-gray-400">|</span>
                  <Link href="/admin" className="flex items-center gap-2 hover:text-yellow-400">
                    <FaCaretRight /> Admin Panel
                  </Link>
                </>
              )}

              {isFoodstall && (
                <>
                  <span className="text-gray-400">|</span>
                  <Link href="/foodstall" className="flex items-center gap-2 hover:text-pink-600">
                    <FaCaretRight /> Stall Panel
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <button onClick={toggleMobileMenu} className="text-white focus:outline-none">
              {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>

          {/* Account Controls */}
          <div className="hidden md:block ml-auto">
            <div className="flex items-center">
              {!isAuthenticated ? (
                <>
                  <Link href="/order/cart" className="relative mr-3 text-white hover:text-pink-600">
                    <FaCartShopping className="inline mr-1" />
                    {cartCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-pink-600 text-white text-xs font-bold rounded-full px-1.5">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                  <div className="relative">
                    <button
                      onClick={toggleDropdown}
                      className="mx-3 py-2 text-sm font-medium text-white hover:text-gray-500"
                    >
                      <FaBars size={20} />
                    </button>
                    {isDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-56 rounded-xl shadow-2xl bg-neutral-900 border border-neutral-700 z-10 transition-all duration-300 ease-in-out transform origin-top scale-y-100 opacity-100">
                        <Link href="/login" className="flex items-center px-4 py-2 text-gray-300 hover:text-white hover:bg-neutral-800 rounded-xl transition-colors">
                          <FaSignInAlt className="mr-2 text-pink-500" /> Login
                        </Link>
                        <Link href="/register" className="flex items-center px-4 py-2 text-gray-300 hover:text-white hover:bg-neutral-800 rounded-xl transition-colors">
                          <FaUserPlus className="mr-2 text-pink-500" /> Register
                        </Link>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {!isAdmin && !isFoodstall && (
                    <Link href="/order/cart" className="relative mr-3 text-white hover:text-pink-600">
                      <FaCartShopping className="inline mr-1" />
                      {cartCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-pink-600 text-white text-xs font-bold rounded-full px-1.5">
                          {cartCount}
                        </span>
                      )}
                    </Link>
                  )}
                  <div className="relative">
                    <button
                      onClick={toggleDropdown}
                      className="flex items-center px-4 py-2 space-x-2 text-sm font-medium text-white bg-neutral-800 border-2 border-gray-300 rounded-full hover:border-pink-600"
                    >
                      <FaBars />
                      <FaCircleUser />
                    </button>
                    {isDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-56 rounded-xl shadow-2xl bg-neutral-900 border border-neutral-700 z-10 transition-all duration-300 ease-in-out transform origin-top scale-y-100 opacity-100">
                        <div className="px-4 py-3 font-semibold border-b border-neutral-700 text-white">
                          Welcome, <span className="text-pink-500">{currentUser?.name || "User"}</span>
                        </div>
                        <Link href="/account" className="flex items-center px-4 py-2 text-gray-300 hover:text-white hover:bg-neutral-800 transition-colors">
                          <FaGear className="mr-2 text-pink-500" /> Account Settings
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left flex items-center px-4 py-2 text-gray-300 hover:text-white hover:bg-neutral-800 rounded-xl transition-colors"
                        >
                          <FaSignOutAlt className="mr-2 text-pink-500" /> Sign Out
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
          <div className="md:hidden mt-4 space-y-2 text-white bg-neutral-800 rounded-md p-4">
            {!isAuthenticated &&(
              <>
                <Link href="/" className="flex items-center gap-2 hover:text-pink-600">
                  <FaHome /> Home
                </Link>
                <Link href="/#about-us" onClick={(e) => handleScrollToSection(e, 'about-us')} className="flex items-center gap-2 hover:text-pink-600">
                  <FaHome /> About Us
                </Link>
                <Link href="/order/cart" className="flex items-center gap-2 hover:text-pink-600">
                  <FaCartShopping /> Cart {cartCount > 0 && `(${cartCount})`}
                </Link>
              </>
            )}
            {isAuthenticated && !isAdmin && !isFoodstall && (
              <>
                <Link href="/" className="flex items-center gap-2 hover:text-pink-600">
                  <FaHome /> Home
                </Link>
                <Link href="/customer/order-status" className="flex items-center gap-2 hover:text-pink-600">
                  <FaBoxOpen /> My Orders
                </Link>
                <Link href="/order/cart" className="flex items-center gap-2 hover:text-pink-600">
                  <FaCartShopping /> Cart {cartCount > 0 && `(${cartCount})`}
                </Link>
              </>
            )}
            {isCustomer && (
              <Link href="/customer/promos" className="flex items-center gap-2 hover:text-pink-600">
                <FaGift /> Promotions
              </Link>
            )}
            {isAdmin && (
              <Link href="/admin" className="flex items-center gap-2 hover:text-yellow-400">
                <FaCaretRight /> Admin Panel
              </Link>
            )}
            {isFoodstall && (
              <Link href="/foodstall" className="flex items-center gap-2 hover:text-pink-600">
                <FaCaretRight /> Stall Panel
              </Link>
            )}
            <hr className="border-gray-600 my-2" />
            {!isAuthenticated ? (
              <>
                <Link href="/login" className="flex items-center gap-2 text-gray-300 hover:text-white hover:bg-neutral-800 px-4 py-2 rounded-md transition-colors">
                  <FaSignInAlt className="text-pink-500" /> Login
                </Link>
                <Link href="/register" className="flex items-center gap-2 text-gray-300 hover:text-white hover:bg-neutral-800 px-4 py-2 rounded-md transition-colors">
                  <FaUserPlus className="text-pink-500" /> Register
                </Link>
              </>
            ) : (
              <>
                <Link href="/account" className="flex items-center gap-2 text-gray-300 hover:text-white hover:bg-neutral-800 px-4 py-2 rounded-md transition-colors">
                  <FaGear className="text-pink-500" /> Account Settings
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-2 text-gray-300 hover:text-white hover:bg-neutral-800 px-4 py-2 rounded-md transition-colors">
                  <FaSignOutAlt className="text-red-500" /> Sign Out
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
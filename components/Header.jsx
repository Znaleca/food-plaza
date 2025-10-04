// Header.js

'use client';

import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import logo from '@/assets/images/logo.svg';
import { FaSignInAlt, FaSignOutAlt, FaBars, FaTimes, FaUserPlus, FaHome, FaBoxOpen, FaGift, FaCaretRight, FaUtensils } from 'react-icons/fa';
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
  const [isVisible, setIsVisible] = useState(true);
  const [prevScrollPos, setPrevScrollPos] = useState(0);

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

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;
      const isScrollingUp = prevScrollPos > currentScrollPos;
      const isAtTop = currentScrollPos < 50;

      setIsVisible(isScrollingUp || isAtTop);
      setPrevScrollPos(currentScrollPos);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [prevScrollPos]);

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

  const handleScrollToSection = (e, sectionId) => {
    e.preventDefault();
    if (window.location.pathname !== '/') {
      router.push(`/#${sectionId}`);
    } else {
      const section = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };


  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 transform ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
      <nav className="transition-all duration-300 h-20 bg-neutral-900 shadow-md">
        <div className="flex h-full items-center justify-between mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="flex-shrink-0">
            {(isAdmin || isFoodstall) ? (
              <div className="flex items-center cursor-default transition-all duration-300">
                <Image src={logo} alt="TheCorner" className="h-12 w-12" priority />
                <span className="ml-2 text-2xl font-extrabold text-white tracking-wider">
                  <span className="bg-clip-text text-transparent bg-white">THE</span>
                  <span className="text-white"> CORNER</span>
                </span>
              </div>
            ) : (
              <Link href="/" className="flex items-center group transition-all duration-300">
                <Image src={logo} alt="TheCorner" className="h-12 w-12 transition-transform duration-300 group-hover:scale-110" priority />
                <span className="ml-2 text-2xl font-extrabold text-white tracking-wider transition-colors duration-300">
                  <span className="bg-clip-text text-transparent bg-white transition-colors duration-300">THE</span>
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
                  <Link href="/" className="hover:text-pink-600 transition-colors duration-300">Home</Link>
                  <Link href="/#browse" onClick={(e) => handleScrollToSection(e, 'browse')} className="hover:text-pink-600 transition-colors duration-300">Browse</Link>
                  <Link href="/#about-us" onClick={(e) => handleScrollToSection(e, 'about-us')} className="hover:text-pink-600 transition-colors duration-300">About Us</Link>
                </>
              )}
              {isCustomer && (
  <>
    <Link href="/" className="hover:text-pink-600 transition-colors duration-300">Home</Link>
    <Link href="/#browse" onClick={(e) => handleScrollToSection(e, 'browse')} className="hover:text-pink-600 transition-colors duration-300">Browse</Link>
    <Link href="/customer/order-status" className="hover:text-pink-600 transition-colors duration-300">My Orders</Link>
    <Link href="/#about-us" onClick={(e) => handleScrollToSection(e, 'about-us')} className="hover:text-pink-600 transition-colors duration-300">About Us</Link>
    
    {/* Promotions Dropdown */}
    <div className="relative group">
      <button className="hover:text-pink-600 transition-colors duration-300 flex items-center">
        Promotions <FaCaretRight className="ml-1 group-hover:rotate-90 transition-transform duration-200" />
      </button>
      <div className="absolute left-0 mt-2 w-48 rounded-lg shadow-lg bg-neutral-900 border border-neutral-700 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transform translate-y-2 transition-all duration-200 z-20">
        <Link href="/customer/promos" className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-neutral-800 rounded-t-lg">
          Available Promos
        </Link>
        <Link href="/customer/my-promos" className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-neutral-800 rounded-b-lg">
          My Promos
        </Link>
      </div>
    </div>
  </>
)}
              {isAdmin && (
                <>
                  <span className="text-gray-600">|</span>
                  <Link href="/admin" className="flex items-center gap-2 hover:text-yellow-400 transition-colors duration-300">
                    <FaCaretRight /> Admin Panel
                  </Link>
                </>
              )}
              {isFoodstall && (
                <>
                  <span className="text-gray-600">|</span>
                  <Link href="/foodstall" className="flex items-center gap-2 hover:text-pink-600 transition-colors duration-300">
                    <FaCaretRight /> Stall Panel
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <button onClick={toggleMobileMenu} className="text-white focus:outline-none transition-colors duration-300 hover:text-pink-600">
              {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>

          {/* Account Controls */}
          <div className="hidden md:block ml-auto">
            <div className="flex items-center">
              {!isAuthenticated ? (
                <>
                  <Link href="/order/cart" className="relative mr-5 text-gray-300 hover:text-white transition-colors duration-300">
                    <FaCartShopping size={22} className="inline mr-1" />
                    {cartCount > 0 && (
                      <span className="absolute -top-3 -right-3 bg-pink-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center transition-all duration-300 transform hover:scale-110">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                  <div className="relative">
                    <button
                      onClick={toggleDropdown}
                      className="mx-3 py-2 text-sm font-medium text-white transition-colors duration-300"
                    >
                      <FaBars size={20} />
                    </button>
                    {isDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-56 rounded-xl shadow-2xl bg-neutral-900 border border-neutral-700 z-10 animate-fade-in-scale">
                        <Link href="/login" className="flex items-center px-4 py-2 text-gray-300 hover:text-white hover:bg-neutral-800 rounded-xl transition-colors duration-300">
                          <FaSignInAlt className="mr-2 text-white" /> Login
                        </Link>
                        <Link href="/register" className="flex items-center px-4 py-2 text-gray-300 hover:text-white hover:bg-neutral-800 rounded-xl transition-colors duration-300">
                          <FaUserPlus className="mr-2 text-white" /> Register
                        </Link>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {!isAdmin && !isFoodstall && (
                    <Link href="/order/cart" className="relative mr-5 text-gray-300 hover:text-white transition-colors duration-300">
                      <FaCartShopping size={22} className="inline mr-1" />
                      {cartCount > 0 && (
                        <span className="absolute -top-3 -right-3 bg-pink-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center transition-all duration-300 transform hover:scale-110">
                          {cartCount}
                        </span>
                      )}
                    </Link>
                  )}
                  <div className="relative">
                    <button
                      onClick={toggleDropdown}
                      className="flex items-center px-4 py-2 space-x-2 text-sm font-medium text-white bg-neutral-800 border-2 border-gray-700 rounded-full transition-all duration-300 hover:border-pink-600"
                    >
                      <FaBars />
                      <FaCircleUser />
                    </button>
                    {isDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-56 rounded-xl shadow-2xl bg-neutral-900 border border-neutral-700 z-10 animate-fade-in-scale">
                        <div className="px-4 py-3 font-semibold border-b border-neutral-700 text-white">
                          Welcome, <span className="text-pink-500">{currentUser?.name || "User"}</span>
                        </div>
                        <Link href="/account" className="flex items-center px-4 py-2 text-gray-300 hover:text-white hover:bg-neutral-800 transition-colors duration-300">
                          <FaGear className="mr-2 text-white-500" /> Account Settings
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left flex items-center px-4 py-2 text-gray-300 hover:text-white hover:bg-neutral-800 rounded-xl transition-colors duration-300"
                        >
                          <FaSignOutAlt className="mr-2 text-white" /> Sign Out
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
          <div className="md:hidden mt-4 space-y-2 text-white bg-neutral-800 rounded-md p-4 animate-slide-down">
            {!isAuthenticated && (
              <>
                <Link href="/" className="flex items-center gap-2 hover:text-pink-600 transition-colors duration-300">
                  <FaHome /> Home
                </Link>
                <Link href="/#browse" onClick={(e) => handleScrollToSection(e, 'browse')} className="flex items-center gap-2 hover:text-pink-600 transition-colors duration-300">
                  <FaUtensils /> Browse
                </Link>
                <Link href="/#about-us" onClick={(e) => handleScrollToSection(e, 'about-us')} className="flex items-center gap-2 hover:text-pink-600 transition-colors duration-300">
                  <FaHome /> About Us
                </Link>
                <Link href="/order/cart" className="flex items-center gap-2 hover:text-pink-600 transition-colors duration-300">
                  <FaCartShopping /> Cart {cartCount > 0 && `(${cartCount})`}
                </Link>
              </>
            )}
            {isAuthenticated && !isAdmin && !isFoodstall && (
              <>
                <Link href="/" className="flex items-center gap-2 hover:text-pink-600 transition-colors duration-300">
                  <FaHome /> Home
                </Link>
                <Link href="/#browse" onClick={(e) => handleScrollToSection(e, 'browse')} className="flex items-center gap-2 hover:text-pink-600 transition-colors duration-300">
                  <FaUtensils /> Browse
                </Link>
                <Link href="/customer/order-status" className="flex items-center gap-2 hover:text-pink-600 transition-colors duration-300">
                  <FaBoxOpen /> My Orders
                </Link>
                <Link href="/order/cart" className="flex items-center gap-2 hover:text-pink-600 transition-colors duration-300">
                  <FaCartShopping /> Cart {cartCount > 0 && `(${cartCount})`}
                </Link>
              </>
            )}
            {isCustomer && (
  <div className="space-y-1">
    <button
      onClick={() => setIsDropdownOpen(prev => !prev)}
      className="flex items-center gap-2 hover:text-pink-600 transition-colors duration-300 w-full text-left"
    >
      <FaGift /> Promotions
      <FaCaretRight className={`ml-auto transform transition-transform ${isDropdownOpen ? "rotate-90" : ""}`} />
    </button>
    {isDropdownOpen && (
      <div className="ml-6 space-y-1">
        <Link href="/customer/promos" className="block hover:text-pink-600 transition-colors duration-300">
          Available Promos
        </Link>
        <Link href="/customer/my-promos" className="block hover:text-pink-600 transition-colors duration-300">
          My Promos
        </Link>
      </div>
    )}
  </div>
)}

            {isAdmin && (
              <Link href="/admin" className="flex items-center gap-2 hover:text-yellow-400 transition-colors duration-300">
                <FaCaretRight /> Admin Panel
              </Link>
            )}
            {isFoodstall && (
              <Link href="/foodstall" className="flex items-center gap-2 hover:text-pink-600 transition-colors duration-300">
                <FaCaretRight /> Stall Panel
              </Link>
            )}
            <hr className="border-gray-600 my-2" />
            {!isAuthenticated ? (
              <>
                <Link href="/login" className="flex items-center gap-2 text-gray-300 hover:text-white hover:bg-neutral-800 px-4 py-2 rounded-md transition-colors duration-300">
                  <FaSignInAlt className="text-pink-500" /> Login
                </Link>
                <Link href="/register" className="flex items-center gap-2 text-gray-300 hover:text-white hover:bg-neutral-800 px-4 py-2 rounded-md transition-colors duration-300">
                  <FaUserPlus className="text-pink-500" /> Register
                </Link>
              </>
            ) : (
              <>
                <Link href="/account" className="flex items-center gap-2 text-gray-300 hover:text-white hover:bg-neutral-800 px-4 py-2 rounded-md transition-colors duration-300">
                  <FaGear className="text-white" /> Account Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left flex items-center gap-2 text-gray-300 hover:text-white hover:bg-neutral-800 px-4 py-2 rounded-md transition-colors duration-300"
                >
                  <FaSignOutAlt className="mr-2 text-white" /> Sign Out
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
'use client';

import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import logo from '../assets/images/logo.svg';
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
    <header className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 transform ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
      <nav className="transition-all duration-300 h-24 bg-white border-b-4 border-black">
        <div className="flex h-full items-center justify-between mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          {/* Logo Section */}
          <div className="flex-shrink-0">
            {(isAdmin || isFoodstall) ? (
              <div className="flex items-center cursor-default group">
                <Image src={logo} alt="Blitz Logo" className="h-10 w-10 md:h-12 md:w-12 object-contain invert" priority />
                <div className="ml-3 flex flex-col justify-center">
                  <span className="text-xl md:text-2xl font-black text-black tracking-tighter uppercase leading-none">
                    BLITZ
                  </span>
                  <span className="text-[10px] md:text-[11px] font-black text-white bg-red-600 px-1.5 py-0.5 mt-0.5 tracking-[0.2em] uppercase leading-none border-[1.5px] border-black shadow-[2px_2px_0px_#000] w-max">
                    FOODCOURT
                  </span>
                </div>
              </div>
            ) : (
              <Link href="/" className="flex items-center group">
                <Image src={logo} alt="Blitz Logo" className="h-10 w-10 md:h-12 md:w-12 object-contain invert transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110" priority />
                <div className="ml-3 flex flex-col justify-center transition-transform duration-300 group-hover:translate-x-1">
                  <span className="text-xl md:text-2xl font-black text-black tracking-tighter uppercase leading-none">
                    BLITZ
                  </span>
                  <span className="text-[10px] md:text-[11px] font-black text-white bg-red-600 px-1.5 py-0.5 mt-0.5 tracking-[0.2em] uppercase leading-none border-[1.5px] border-black shadow-[2px_2px_0px_#000] w-max group-hover:bg-black group-hover:shadow-[2px_2px_0px_#dc2626] transition-all duration-300">
                    FOODCOURT
                  </span>
                </div>
              </Link>
            )}
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center gap-8 text-sm font-black tracking-widest uppercase text-black">
              {!isAuthenticated && (
                <>
                  <Link href="/" className="hover:text-red-600 hover:-translate-y-1 transition-all duration-200">Home</Link>
                  <Link href="/#browse" onClick={(e) => handleScrollToSection(e, 'browse')} className="hover:text-red-600 hover:-translate-y-1 transition-all duration-200">Browse</Link>
                  <Link href="/#about-us" onClick={(e) => handleScrollToSection(e, 'about-us')} className="hover:text-red-600 hover:-translate-y-1 transition-all duration-200">About Us</Link>
                </>
              )}
              {isCustomer && (
                <>
                  <Link href="/" className="hover:text-red-600 hover:-translate-y-1 transition-all duration-200">Home</Link>
                  <Link href="/#browse" onClick={(e) => handleScrollToSection(e, 'browse')} className="hover:text-red-600 hover:-translate-y-1 transition-all duration-200">Browse</Link>
                  <Link href="/customer/order-status" className="hover:text-red-600 hover:-translate-y-1 transition-all duration-200">My Orders</Link>
                  <Link href="/#about-us" onClick={(e) => handleScrollToSection(e, 'about-us')} className="hover:text-red-600 hover:-translate-y-1 transition-all duration-200">About Us</Link>

                  {/* Promotions Dropdown */}
                  <div className="relative group">
                    <button className="flex items-center hover:text-red-600 transition-colors duration-200 uppercase font-black tracking-widest">
                      Promos <FaCaretRight className="ml-1 group-hover:rotate-90 transition-transform duration-200" />
                    </button>
                    <div className="absolute left-0 mt-4 w-48 bg-white border-4 border-black shadow-[4px_4px_0px_#000] opacity-0 group-hover:opacity-100 invisible group-hover:visible transform translate-y-2 group-hover:translate-y-0 transition-all duration-200 z-20">
                      <Link href="/customer/promos" className="block px-4 py-3 text-black font-bold uppercase tracking-wider hover:bg-black hover:text-white border-b-2 border-black transition-colors">
                        Available
                      </Link>
                      <Link href="/customer/my-promos" className="block px-4 py-3 text-black font-bold uppercase tracking-wider hover:bg-black hover:text-white transition-colors">
                        My Promos
                      </Link>
                    </div>
                  </div>
                </>
              )}
              {isAdmin && (
                <>
                  <span className="text-gray-300">/</span>
                  <Link href="/admin" className="flex items-center gap-2 hover:text-red-600 hover:-translate-y-1 transition-all duration-200">
                    <FaCaretRight /> Admin Panel
                  </Link>
                </>
              )}
              {isFoodstall && (
                <>
                  <span className="text-gray-300">/</span>
                  <Link href="/foodstall" className="flex items-center gap-2 hover:text-red-600 hover:-translate-y-1 transition-all duration-200">
                    <FaCaretRight /> Stall Panel
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Account Controls */}
          <div className="hidden md:flex items-center ml-auto">
            {!isAuthenticated ? (
              <>
                <Link href="/order/cart" className="relative mr-6 text-black hover:text-red-600 transition-colors duration-300">
                  <FaCartShopping size={24} className="inline mr-1" />
                  {cartCount > 0 && (
                    <span className="absolute -top-3 -right-3 bg-red-600 border-2 border-black text-white text-xs font-black h-6 w-6 flex items-center justify-center transform hover:scale-110 transition-transform">
                      {cartCount}
                    </span>
                  )}
                </Link>
                <div className="relative">
                  <button
                    onClick={toggleDropdown}
                    className="p-3 text-black border-2 border-black hover:bg-black hover:text-white transition-colors shadow-[2px_2px_0px_#000]"
                  >
                    <FaBars size={20} />
                  </button>
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-4 w-56 bg-white border-4 border-black shadow-[6px_6px_0px_#000] z-10">
                      <Link href="/login" className="flex items-center px-4 py-3 text-black font-black uppercase tracking-wider hover:bg-black hover:text-white border-b-2 border-black transition-colors">
                        <FaSignInAlt className="mr-3 text-red-600" /> Login
                      </Link>
                      <Link href="/register" className="flex items-center px-4 py-3 text-black font-black uppercase tracking-wider hover:bg-black hover:text-white transition-colors">
                        <FaUserPlus className="mr-3 text-red-600" /> Register
                      </Link>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {!isAdmin && !isFoodstall && (
                  <Link href="/order/cart" className="relative mr-6 text-black hover:text-red-600 transition-colors duration-300">
                    <FaCartShopping size={24} className="inline mr-1" />
                    {cartCount > 0 && (
                      <span className="absolute -top-3 -right-3 bg-red-600 border-2 border-black text-white text-xs font-black h-6 w-6 flex items-center justify-center transform hover:scale-110 transition-transform">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                )}
                <div className="relative">
                  <button
                    onClick={toggleDropdown}
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-black uppercase tracking-widest text-black bg-white border-4 border-black shadow-[4px_4px_0px_#000] hover:bg-black hover:text-white hover:shadow-[2px_2px_0px_#000] hover:translate-y-[2px] transition-all"
                  >
                    <FaBars />
                    <FaCircleUser size={18} />
                  </button>
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-4 w-64 bg-white border-4 border-black shadow-[6px_6px_0px_#000] z-10">
                      <div className="px-4 py-3 font-black tracking-widest uppercase border-b-4 border-black text-black text-sm">
                        HELLO, <span className="text-red-600">{currentUser?.name || "USER"}</span>
                      </div>
                      <Link href="/account" className="flex items-center px-4 py-3 text-black font-bold uppercase tracking-wider hover:bg-black hover:text-white border-b-2 border-black transition-colors">
                        <FaGear className="mr-3" /> Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center px-4 py-3 text-black font-bold uppercase tracking-wider hover:bg-red-600 hover:text-white transition-colors"
                      >
                        <FaSignOutAlt className="mr-3" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="md:hidden flex items-center">
             {!isAdmin && !isFoodstall && cartCount > 0 && (
              <Link href="/order/cart" className="relative mr-6 text-black hover:text-red-600 transition-colors">
                <FaCartShopping size={24} />
                <span className="absolute -top-2 -right-3 bg-red-600 border-2 border-black text-white text-xs font-black h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              </Link>
            )}
            <button 
              onClick={toggleMobileMenu} 
              className="p-2 text-black border-4 border-black shadow-[4px_4px_0px_#000] bg-white focus:outline-none hover:bg-black hover:text-white transition-colors"
            >
              {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>

        </div>

        {/* Mobile Slide-down Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-24 left-0 w-full bg-white border-b-4 border-black shadow-[0_10px_0px_rgba(0,0,0,1)] z-40">
            <div className="flex flex-col font-black uppercase tracking-widest text-black">
              {!isAuthenticated && (
                <>
                  <Link href="/" className="flex items-center gap-3 p-4 border-b-2 border-black hover:bg-black hover:text-white transition-colors">
                    <FaHome /> Home
                  </Link>
                  <Link href="/#browse" onClick={(e) => { handleScrollToSection(e, 'browse'); toggleMobileMenu(); }} className="flex items-center gap-3 p-4 border-b-2 border-black hover:bg-black hover:text-white transition-colors">
                    <FaUtensils /> Browse
                  </Link>
                  <Link href="/#about-us" onClick={(e) => { handleScrollToSection(e, 'about-us'); toggleMobileMenu(); }} className="flex items-center gap-3 p-4 border-b-2 border-black hover:bg-black hover:text-white transition-colors">
                    <FaHome /> About Us
                  </Link>
                  <Link href="/order/cart" className="flex items-center gap-3 p-4 border-b-2 border-black hover:bg-black hover:text-white transition-colors">
                    <FaCartShopping /> Cart {cartCount > 0 && <span className="text-red-600">({cartCount})</span>}
                  </Link>
                </>
              )}
              {isAuthenticated && !isAdmin && !isFoodstall && (
                <>
                  <Link href="/" className="flex items-center gap-3 p-4 border-b-2 border-black hover:bg-black hover:text-white transition-colors">
                    <FaHome /> Home
                  </Link>
                  <Link href="/#browse" onClick={(e) => { handleScrollToSection(e, 'browse'); toggleMobileMenu(); }} className="flex items-center gap-3 p-4 border-b-2 border-black hover:bg-black hover:text-white transition-colors">
                    <FaUtensils /> Browse
                  </Link>
                  <Link href="/customer/order-status" className="flex items-center gap-3 p-4 border-b-2 border-black hover:bg-black hover:text-white transition-colors">
                    <FaBoxOpen /> My Orders
                  </Link>
                  <Link href="/order/cart" className="flex items-center gap-3 p-4 border-b-2 border-black hover:bg-black hover:text-white transition-colors">
                    <FaCartShopping /> Cart {cartCount > 0 && <span className="text-red-600">({cartCount})</span>}
                  </Link>
                </>
              )}
              {isCustomer && (
                <div className="flex flex-col border-b-2 border-black">
                  <button
                    onClick={() => setIsDropdownOpen(prev => !prev)}
                    className="flex items-center gap-3 p-4 hover:bg-black hover:text-white transition-colors w-full text-left"
                  >
                    <FaGift /> Promotions
                    <FaCaretRight className={`ml-auto transform transition-transform ${isDropdownOpen ? "rotate-90" : ""}`} />
                  </button>
                  {isDropdownOpen && (
                    <div className="flex flex-col bg-gray-100 border-t-2 border-black">
                      <Link href="/customer/promos" className="p-4 pl-12 border-b border-gray-300 hover:bg-black hover:text-white transition-colors">
                        Available Promos
                      </Link>
                      <Link href="/customer/my-promos" className="p-4 pl-12 hover:bg-black hover:text-white transition-colors">
                        My Promos
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {isAdmin && (
                <Link href="/admin" className="flex items-center gap-3 p-4 border-b-2 border-black bg-yellow-400 text-black hover:bg-black hover:text-white transition-colors">
                  <FaCaretRight /> Admin Panel
                </Link>
              )}
              {isFoodstall && (
                <Link href="/foodstall" className="flex items-center gap-3 p-4 border-b-2 border-black hover:bg-black hover:text-white transition-colors">
                  <FaCaretRight /> Stall Panel
                </Link>
              )}

              {/* Mobile Auth Bottom Section */}
              {!isAuthenticated ? (
                <div className="flex bg-neutral-100">
                  <Link href="/login" className="flex-1 flex items-center justify-center gap-2 p-4 border-r-2 border-black hover:bg-black hover:text-white transition-colors">
                    <FaSignInAlt className="text-red-600" /> LOGIN
                  </Link>
                  <Link href="/register" className="flex-1 flex items-center justify-center gap-2 p-4 hover:bg-black hover:text-white transition-colors">
                    <FaUserPlus className="text-red-600" /> REGISTER
                  </Link>
                </div>
              ) : (
                <>
                  <Link href="/account" className="flex items-center gap-3 p-4 border-b-2 border-black hover:bg-black hover:text-white transition-colors">
                    <FaGear /> Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-3 p-4 hover:bg-red-600 hover:text-white transition-colors"
                  >
                    <FaSignOutAlt /> Sign Out
                  </button>
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
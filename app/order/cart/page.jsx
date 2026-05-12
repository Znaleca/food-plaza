'use client';

import { useEffect, useState, useMemo } from 'react';
import { FaTrash, FaTag, FaIdCard, FaHandHoldingDollar, FaXmark } from 'react-icons/fa6';
import { Dialog } from '@headlessui/react';
import VoucherWallet from '@/components/VoucherWallet';
import CheckoutButton from '@/components/CheckoutButton';
import UsedVoucherWallet from '@/components/UsedVoucherWallet';
import SpecialDiscount from '@/components/SpecialDiscount';
import getSingleSpace from '@/app/actions/getSingleSpace';
import useVoucher from '@/app/actions/useVoucher';
import getSpecialDiscount from '@/app/actions/getSpecialDiscount';
import checkAuth from '@/app/actions/checkAuth';
import LoadingSpinner from '@/components/LoadingSpinner';
import Link from 'next/link';

// Array for the options
const DINE_TAKE_OUT_OPTIONS = ['Dine In', 'Take Out'];

const OrderCartPage = () => {
  const [cart, setCart] = useState([]);
  const [groupedCart, setGroupedCart] = useState({});
  const [activeVouchersPerRoom, setActiveVouchersPerRoom] = useState({});
  const [selectedItems, setSelectedItems] = useState({});
  const [activeSpecialDiscountItems, setActiveSpecialDiscountItems] = useState({}); 
  const [selectAll, setSelectAll] = useState(false);
  const [selectAllPerRoom, setSelectAllPerRoom] = useState({});
  const [roomNames, setRoomNames] = useState({});
  const [openVoucherRoom, setOpenVoucherRoom] = useState(null);
  const [usedVoucherStates, setUsedVoucherStates] = useState({});
  const [openSpecialDiscount, setOpenSpecialDiscount] = useState(false);
  const [specialDiscountData, setSpecialDiscountData] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);
  
  // ⭐ NEW STATE: To hold the dine-in or take-out choice per room
  const [dineTakeOutPerRoom, setDineTakeOutPerRoom] = useState({}); 

  useEffect(() => {
    const loadInitialData = async () => {
      const [authRes, specialRes] = await Promise.all([
        checkAuth(),
        getSpecialDiscount(),
      ]);
      setIsAuthenticated(authRes.isAuthenticated);
      setLoadingAuth(false);
      
      if (specialRes.success && specialRes.documents.length > 0) {
        setSpecialDiscountData(specialRes.documents[0]);
      } else {
        setSpecialDiscountData(null);
      }
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    const loadCartAndGroup = async () => {
      const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
      setCartCount(savedCart.reduce((sum, item) => sum + (item.quantity || 1), 0));

      const roomIds = [...new Set(savedCart.map(item => item.room_id))];
      const names = {};
      const initialDineTakeOut = {}; // New object for dine/take out
      
      for (const roomId of roomIds) {
        const room = await getSingleSpace(roomId);
        names[roomId] = room?.name || 'Unknown Room';
        // ⭐ NEW: Default to 'Dine In' for all rooms
        initialDineTakeOut[roomId] = 'Dine In'; 
      }

      const enrichedCart = savedCart.map(item => ({
        ...item,
        room_name: names[item.room_id] || 'Unknown Room',
      }));

      setRoomNames(names);
      setCart(enrichedCart);
      groupItemsByRoom(enrichedCart);
      // ⭐ NEW: Set initial dine/take out state
      setDineTakeOutPerRoom(initialDineTakeOut); 
    };

    if (!loadingAuth) {
      loadCartAndGroup();
    }
  }, [loadingAuth]);

  useEffect(() => {
    const checkMinOrders = async () => {
      const updatedVouchers = { ...activeVouchersPerRoom };
      for (const roomId in updatedVouchers) {
        const voucher = updatedVouchers[roomId];
        if (voucher) {
          const roomSubtotal = Object.values(groupedCart[roomId]?.items || {}).reduce(
            (sum, item) => sum + Number(item.menuPrice) * (item.quantity || 1),
            0
          );
          if (roomSubtotal < voucher.min_orders) {
            // Automatically cancel voucher if min_orders is not met
            await useVoucher(voucher.$id, false); 
            setActiveVouchersPerRoom((prev) => ({ ...prev, [roomId]: null }));
            setUsedVoucherStates((prev) => ({ ...prev, [voucher.$id]: false }));
            alert(`Voucher "${voucher.title}" has been automatically removed from ${roomNames[roomId] || 'this room'} because the minimum order requirement of ₱${voucher.min_orders.toFixed(2)} is no longer met.`);
          }
        }
      }
    };

    if (Object.keys(groupedCart).length > 0) {
      checkMinOrders();
    }
  }, [groupedCart, activeVouchersPerRoom, roomNames, setUsedVoucherStates]);

  const groupItemsByRoom = (cartItems) => {
    const grouped = cartItems.reduce((acc, item) => {
      const roomId = item.room_id;
      if (!acc[roomId]) {
        acc[roomId] = { roomName: item.room_name, items: [] };
      }
      acc[roomId].items.push(item);
      return acc;
    }, {});
    setGroupedCart(grouped);
  };

  const updateCartStorage = (updatedCart) => {
    setCart(updatedCart);
    setCartCount(updatedCart.reduce((sum, item) => sum + (item.quantity || 1), 0));
    groupItemsByRoom(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const updateQuantity = (roomId, menuName, size, delta) => {
    const updatedCart = cart.map((item) => {
      if (item.room_id === roomId && item.menuName === menuName && item.size === size) {
        return { ...item, quantity: Math.max(1, (item.quantity || 1) + delta) };
      }
      return item;
    });
    updateCartStorage(updatedCart);
  };

  const removeItem = (roomId, menuName, size) => {
    const updatedCart = cart.filter(
      (item) => !(item.room_id === roomId && item.menuName === menuName && item.size === size)
    );
    updateCartStorage(updatedCart);
    
    const itemKey = `${roomId}-${menuName}-${size || 'One-size'}`;
    setActiveSpecialDiscountItems(prev => {
      const updated = { ...prev };
      delete updated[itemKey];
      return updated;
    });
  };

  const handleVoucherUsed = (voucher) => {
    if (voucher) {
      setActiveVouchersPerRoom((prev) => ({
        ...prev,
        [openVoucherRoom]: voucher,
      }));
      // When a voucher is applied to a room, remove any item-level special discounts in that room
      setActiveSpecialDiscountItems(prev => {
        const updated = { ...prev };
        (groupedCart[openVoucherRoom]?.items || []).forEach(item => {
            const key = `${openVoucherRoom}-${item.menuName}-${item.size || 'One-size'}`;
            delete updated[key];
        });
        return updated;
      });
    } else {
      setActiveVouchersPerRoom((prev) => ({
        ...prev,
        [openVoucherRoom]: null,
      }));
    }
    setOpenVoucherRoom(null);
  };

  // Handler to cancel an active voucher
  const handleCancelVoucher = async (roomId, voucherId) => {
    try {
        await useVoucher(voucherId, false); // API call to release the voucher
        setActiveVouchersPerRoom(prev => ({ ...prev, [roomId]: null }));
        setUsedVoucherStates(prev => {
            const updated = { ...prev };
            updated[voucherId] = false;
            return updated;
        });
    } catch (error) {
        console.error("Failed to cancel voucher:", error);
        alert("Failed to cancel voucher. Please try again.");
    }
  };


  const handleToggleSpecialDiscountItem = (roomId, menuName, size = 'One-size') => {
    const key = `${roomId}-${menuName}-${size}`;
    
    const voucher = activeVouchersPerRoom[roomId];
    if (voucher) {
        alert("A voucher is already active for this room. Please cancel the voucher to apply a Special Discount.");
        return;
    }

    if (!isAuthenticated || !specialDiscountData) {
        return;
    }
    
    setActiveSpecialDiscountItems((prev) => {
        const updated = { ...prev };
        updated[key] = !updated[key];
        if (!updated[key]) {
            delete updated[key];
        }
        return updated;
    });
  };
  
  // ⭐ NEW HANDLER: To manage the dine-in/take-out choice per room
  const handleDineTakeOutChange = (roomId, value) => {
    setDineTakeOutPerRoom(prev => ({
        ...prev,
        [roomId]: value,
    }));
  };

  const calculateTotal = useMemo(() => {
    let total = 0;
    Object.entries(groupedCart).forEach(([roomId, { items }]) => {
      const voucher = activeVouchersPerRoom[roomId];

      items.forEach(item => {
        const key = `${roomId}-${item.menuName}-${item.size || 'One-size'}`;
        if (selectedItems[key]) {
          let itemPrice = Number(item.menuPrice) * (item.quantity || 1);
          let discount = 0;

          if (voucher) {
            discount = (voucher.discount / 100) * itemPrice;
          } else if (activeSpecialDiscountItems[key]) { 
            discount = 0.2 * itemPrice;
          }

          total += itemPrice - discount;
        }
      });
    });
    return total;
  }, [groupedCart, selectedItems, activeVouchersPerRoom, activeSpecialDiscountItems]);

  const handleCheckboxChange = (roomId, menuName, size = 'One-size') => {
    const key = `${roomId}-${menuName}-${size}`;
    setSelectedItems((prev) => {
      const updated = { ...prev };
      updated[key] ? delete updated[key] : (updated[key] = true);
      
      if (!updated[key] && activeSpecialDiscountItems[key]) {
          setActiveSpecialDiscountItems(prevSpecial => {
              const updatedSpecial = { ...prevSpecial };
              delete updatedSpecial[key];
              return updatedSpecial;
          });
      }
      return updated;
    });
  };

  const handleRoomSelectAllChange = (roomId) => {
    setSelectAllPerRoom((prev) => {
      const isSelected = !prev[roomId];
      const updated = { ...prev, [roomId]: isSelected };

      setSelectedItems((prevSelected) => {
        const updatedItems = { ...prevSelected };
        (groupedCart[roomId]?.items || []).forEach((item) => {
          const key = `${roomId}-${item.menuName}-${item.size || 'One-size'}`;
          isSelected ? (updatedItems[key] = true) : delete updatedItems[key];
          
          if (!isSelected) {
              setActiveSpecialDiscountItems(prevSpecial => {
                  const updatedSpecial = { ...prevSpecial };
                  delete updatedSpecial[key];
                  return updatedSpecial;
              });
          }
        });
        return updatedItems;
      });

      return updated;
    });
  };

  const handleGlobalSelectAllChange = () => {
    const newSelectAll = !selectAll;
    const allItems = {};
    if (newSelectAll) {
      cart.forEach((item) => {
        const key = `${item.room_id}-${item.menuName}-${item.size || 'One-size'}`;
        allItems[key] = true;
      });
    } else {
        setActiveSpecialDiscountItems({});
    }
    setSelectedItems(allItems);
    setSelectAllPerRoom(
      Object.keys(groupedCart).reduce((acc, roomId) => {
        acc[roomId] = newSelectAll;
        return acc;
      }, {})
    );
    setSelectAll(newSelectAll);
  };

  const combinedVoucherMap = useMemo(() => {
    const map = {};
    Object.keys(groupedCart).forEach(roomId => {
      const voucher = activeVouchersPerRoom[roomId];
      
      const hasActiveSpecialDiscountItem = groupedCart[roomId].items.some(item => {
        const key = `${roomId}-${item.menuName}-${item.size || 'One-size'}`;
        return selectedItems[key] && activeSpecialDiscountItems[key];
      });

      if (voucher) {
        map[roomId] = voucher;
      } else if (hasActiveSpecialDiscountItem) {
        map[roomId] = {
          title: 'PWD / Senior Discount Applied',
          discount: 20,
          roomName: roomNames[roomId] || groupedCart[roomId].roomName,
          isSpecial: true,
        };
      }
    });
    return map;
  }, [groupedCart, activeVouchersPerRoom, activeSpecialDiscountItems, selectedItems, roomNames]);
  
  const promos = Object.entries(combinedVoucherMap).map(([roomId, voucher]) => {
    return {
      roomName: roomNames[roomId] || groupedCart[roomId].roomName,
      name: voucher.title,
      discount: voucher.discount,
      isSpecial: voucher.isSpecial || false,
    };
  });
  
  const getRoomSubtotals = (roomId, items) => {
    const voucher = activeVouchersPerRoom[roomId];
    let roomSubtotal = 0;
    let roomDiscount = 0;

    items.forEach(item => {
      const key = `${roomId}-${item.menuName}-${item.size || 'One-size'}`;
      if (selectedItems[key]) {
        let itemPrice = Number(item.menuPrice) * (item.quantity || 1);
        roomSubtotal += itemPrice;
        
        let itemDiscount = 0;
        if (voucher) {
          itemDiscount = (voucher.discount / 100) * itemPrice;
        } else if (activeSpecialDiscountItems[key]) {
          itemDiscount = 0.2 * itemPrice;
        }
        roomDiscount += itemDiscount;
      }
    });

    const discountedSubtotal = roomSubtotal - roomDiscount;
    let discountLabel = null;

    if (voucher) {
      discountLabel = `${voucher.discount}% off with "${voucher.title}"`;
    } else if (roomDiscount > 0) {
      discountLabel = `Discount applied to ${promos.find(p => p.roomName === (roomNames[roomId] || groupedCart[roomId].roomName) && p.isSpecial)?.name || 'selected items'}`;
    }

    return { discountedSubtotal, discountLabel, voucher };
  };

  const handleSubmissionSuccess = () => {
    setOpenSpecialDiscount(false);
    window.location.reload(); 
  };
  
  // =========================================================================
  // ⭐ UPDATED LOGIC: Prepare the cart for checkout with per-item discounts AND Dine/Take Out choice
  // =========================================================================
  const checkoutCart = useMemo(() => {
    const finalCart = [];
    
    cart.forEach(item => {
      const itemKey = `${item.room_id}-${item.menuName}-${item.size || 'One-size'}`;
      
      // 1. Only include selected items
      if (selectedItems[itemKey]) {
        const voucher = activeVouchersPerRoom[item.room_id];
        const isSpecialDiscountActiveForItem = activeSpecialDiscountItems[itemKey];
        // ⭐ Get the selected Dine/Take Out status for this room
        const dineTakeOut = dineTakeOutPerRoom[item.room_id] || 'Dine In';
        
        const itemPrice = Number(item.menuPrice) * (item.quantity || 1);
        let discountAmount = 0;

        // 2. Determine the discount
        if (voucher) {
          // Voucher has priority
          discountAmount = (voucher.discount / 100) * itemPrice;
        } else if (isSpecialDiscountActiveForItem) { 
          // Special Discount (20% off)
          discountAmount = 0.2 * itemPrice;
        }

        // 3. Add the enriched item to the final cart
        finalCart.push({
          ...item,
          discountAmount: discountAmount,
          // ⭐ CRUCIAL NEW PROPERTY: Dine/Take Out status
          dineTakeOut: dineTakeOut, 
        });
      }
    });

    return finalCart;
  }, [cart, selectedItems, activeVouchersPerRoom, activeSpecialDiscountItems, dineTakeOutPerRoom]);
  // =========================================================================
  // ⭐ END UPDATED LOGIC
  // =========================================================================


  if (loadingAuth) {
    return (
      <div className="w-full min-h-screen bg-white text-neutral-950 flex items-center justify-center selection:bg-red-600 selection:text-white">
        <LoadingSpinner message="Loading your cart..." />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-white text-neutral-950 font-sans selection:bg-red-600 selection:text-white">

      {/* ── HEADER ── */}
      <div className="w-full border-b-[8px] border-neutral-950 pt-12 pb-16 px-6 md:px-20">
        <span className="text-xs font-black tracking-[0.4em] text-red-600 uppercase block mb-4">
          YOUR ORDER — {cartCount} {cartCount === 1 ? 'ITEM' : 'ITEMS'}
        </span>
        <h1 className="text-5xl sm:text-7xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85] text-neutral-950">
          YOUR<br />
          <span className="text-transparent" style={{ WebkitTextStroke: '3px #0a0a0a' }}>CART.</span>
        </h1>
        <div className="h-3 w-32 bg-neutral-950 mt-8" />
      </div>

      <div className="w-full px-6 md:px-20 py-12">
        {cart.length > 0 ? (
          <>
            {/* SELECT ALL */}
            <div className="flex items-center gap-3 mb-10 border-b-4 border-neutral-950 pb-6">
              <input type="checkbox" id="select-all" checked={selectAll} onChange={handleGlobalSelectAllChange}
                className="w-5 h-5 border-2 border-neutral-950 cursor-pointer accent-neutral-950" />
              <label htmlFor="select-all" className="text-xs font-black tracking-[0.3em] uppercase cursor-pointer">SELECT ALL ITEMS</label>
            </div>

          {/* CART ITEMS */}
          {Object.entries(groupedCart).length > 0 && (
            <div className="max-w-7xl mx-auto space-y-12">
              {Object.entries(groupedCart).map(([roomId, { roomName, items }]) => {
                const isRoomSelected = selectAllPerRoom[roomId] || false;
                const hasSelectedItems = items.some(item => selectedItems[`${roomId}-${item.menuName}-${item.size || 'One-size'}`]);
                
                const { discountedSubtotal, discountLabel, voucher } = getRoomSubtotals(roomId, items);
                const currentDineTakeOut = dineTakeOutPerRoom[roomId] || 'Dine In'; // ⭐ Get current selection

                return (
                  <div key={roomId} className="border-4 border-neutral-950">
                    {/* Room Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-950 text-white px-6 py-4">
                      <div className="flex items-center gap-4 flex-wrap">
                        <input type="checkbox" checked={isRoomSelected} onChange={() => handleRoomSelectAllChange(roomId)}
                          className="w-4 h-4 cursor-pointer accent-red-600" />
                        <h2 className="text-lg font-black uppercase tracking-tighter">{roomNames[roomId] || roomName}</h2>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold tracking-widest uppercase text-neutral-400">TYPE:</span>
                          <select id={`dine-takeout-${roomId}`} value={currentDineTakeOut} onChange={(e) => handleDineTakeOutChange(roomId, e.target.value)}
                            className="bg-white text-neutral-950 text-xs font-black uppercase border-2 border-white px-2 py-1 cursor-pointer">
                            {DINE_TAKE_OUT_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 flex-wrap">
                        {hasSelectedItems && isAuthenticated && (
                          voucher ? (
                            <button onClick={() => handleCancelVoucher(roomId, voucher.$id)}
                              className="text-xs font-black uppercase tracking-widest text-red-400 hover:text-white flex items-center gap-1 transition-colors">
                              <FaXmark /> CANCEL VOUCHER
                            </button>
                          ) : (
                            <button onClick={() => setOpenVoucherRoom(roomId)}
                              className="text-xs font-black uppercase tracking-widest text-neutral-300 hover:text-white flex items-center gap-1 transition-colors">
                              <FaTag /> APPLY VOUCHER
                            </button>
                          )
                        )}
                        <div className="text-xs font-black uppercase tracking-widest text-neutral-400">
                          SUBTOTAL: <span className="text-white">₱{discountedSubtotal.toFixed(2)}</span>
                          {discountLabel && <span className="ml-2 text-red-400 normal-case tracking-normal font-bold">({discountLabel})</span>}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {items.map((item) => {
                        const itemKey = `${roomId}-${item.menuName}-${item.size || 'One-size'}`;
                        const isItemSelected = selectedItems[itemKey];
                        const isSpecialDiscountActiveForItem = activeSpecialDiscountItems[itemKey];

                        let itemPrice = Number(item.menuPrice) * (item.quantity || 1);
                        let finalPrice = itemPrice;
                        let discounted = false;

                        if (isItemSelected && voucher) {
                          finalPrice = itemPrice - (voucher.discount / 100) * itemPrice;
                          discounted = true;
                        } else if (isItemSelected && isSpecialDiscountActiveForItem) {
                          finalPrice = itemPrice * 0.8;
                          discounted = true;
                        }

                        return (
                           <div key={itemKey}
                             className={`flex flex-col items-center text-center p-6 border-t-4 border-neutral-950 border-r-4
                               ${isSpecialDiscountActiveForItem && !voucher ? 'bg-red-50' : 'bg-white'}
                               ${isItemSelected ? '' : 'opacity-60'}`}>
                             <div className="flex items-center justify-between w-full mb-4">
                               {specialDiscountData && isAuthenticated && isItemSelected && !voucher ? (
                                 <button onClick={() => handleToggleSpecialDiscountItem(roomId, item.menuName, item.size)}
                                   className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1 ${
                                     isSpecialDiscountActiveForItem ? 'text-red-600' : 'text-neutral-400 hover:text-neutral-950'}`}>
                                   <FaIdCard size={12} />{isSpecialDiscountActiveForItem ? 'PWD APPLIED' : 'PWD/SENIOR'}
                                 </button>
                               ) : <span />}
                               <input type="checkbox" checked={isItemSelected || false}
                                 onChange={() => handleCheckboxChange(roomId, item.menuName, item.size)}
                                 className="w-4 h-4 cursor-pointer accent-neutral-950" />
                             </div>
                             {item.menuImage && (
                               <img src={item.menuImage} alt={item.menuName}
                                 className="w-20 h-20 object-cover border-4 border-neutral-950 mb-4" />
                             )}
                             <h3 className="text-sm font-black uppercase tracking-tighter leading-tight">{item.menuName}</h3>
                             {item.size && (
                               <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 mt-1">
                                 {item.size === 'One-size' ? 'ONE SIZE' : item.size.toUpperCase()}
                               </p>
                             )}
                             <div className="flex items-center my-4 border-2 border-neutral-950 overflow-hidden shadow-sm">
                               <button
                                 onClick={() => updateQuantity(roomId, item.menuName, item.size, -1)}
                                 className="w-9 h-9 flex items-center justify-center bg-white text-neutral-950 font-black text-lg hover:bg-neutral-950 hover:text-white transition-colors duration-150 select-none"
                               >
                                 −
                               </button>
                               <span className="min-w-[2.5rem] text-center font-black text-base px-2 bg-neutral-950 text-white h-9 flex items-center justify-center tabular-nums">
                                 {item.quantity || 1}
                               </span>
                               <button
                                 onClick={() => updateQuantity(roomId, item.menuName, item.size, 1)}
                                 className="w-9 h-9 flex items-center justify-center bg-white text-neutral-950 font-black text-lg hover:bg-neutral-950 hover:text-white transition-colors duration-150 select-none"
                               >
                                 +
                               </button>
                             </div>
                             <div className="flex flex-col items-center">
                               {discounted && <span className="text-xs text-neutral-400 line-through font-bold">₱{itemPrice.toFixed(2)}</span>}
                               <span className="text-2xl font-black tracking-tighter">₱{finalPrice.toFixed(2)}</span>
                               {isSpecialDiscountActiveForItem && !voucher && (
                                 <span className="text-[10px] font-black uppercase tracking-widest text-red-600 mt-1">20% PWD/SENIOR</span>
                               )}
                             </div>
                             <button onClick={() => removeItem(roomId, item.menuName, item.size)}
                               className="mt-4 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-red-600 transition-colors">
                               <FaTrash size={11} /> REMOVE
                             </button>
                           </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

            {cart.length > 0 && (
              <div className="mt-16 border-[8px] border-neutral-950 bg-white p-8 sm:p-12 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-4 h-full bg-red-600"></div>
                <div className="pl-4">
                  <span className="text-xs font-black tracking-[0.4em] uppercase text-red-600 block mb-2">SUMMARY</span>
                  <span className="text-xl sm:text-3xl font-black uppercase tracking-tighter text-neutral-950">ORDER TOTAL</span>
                </div>
                <span className="text-6xl sm:text-8xl font-black tracking-tighter leading-none text-neutral-950">
                  ₱{calculateTotal.toFixed(2)}
                </span>
              </div>
            )}

            {/* CHECKOUT */}
            {isAuthenticated ? (
              <div className="mt-12 space-y-6">
                {Object.keys(combinedVoucherMap).length > 0 && (
                  <UsedVoucherWallet activeVouchersPerRoom={combinedVoucherMap} roomNames={roomNames} />
                )}
                <CheckoutButton
                  cart={checkoutCart} total={calculateTotal} selectedItems={selectedItems}
                  groupedCart={groupedCart} activeVouchersPerRoom={combinedVoucherMap}
                  roomNames={roomNames} promos={promos}
                  onCheckoutSuccess={() => {
                    setCart([]); setGroupedCart({}); setActiveVouchersPerRoom({});
                    setActiveSpecialDiscountItems({}); setSelectedItems({});
                    setSelectAll(false); setSelectAllPerRoom({}); setCartCount(0);
                    localStorage.removeItem('cart');
                  }}
                />
                <button onClick={() => setOpenSpecialDiscount(true)}
                  className={`w-full flex items-center justify-center gap-3 py-4 border-4 border-neutral-950 font-black text-xs uppercase tracking-[0.3em] transition-all duration-200
                    ${specialDiscountData ? 'bg-white text-neutral-950 hover:bg-neutral-950 hover:text-white' : 'bg-neutral-950 text-white hover:bg-red-600 hover:border-red-600'}`}>
                  <FaIdCard />{specialDiscountData ? 'EDIT PWD / SENIOR CARD' : 'APPLY PWD / SENIOR CARD'}
                </button>
              </div>
            ) : (
              <div className="mt-16 border-4 border-neutral-950 p-12 text-center">
                <p className="text-xs font-black tracking-[0.4em] uppercase text-red-600 mb-4">LOGIN REQUIRED</p>
                <p className="text-3xl font-black uppercase tracking-tighter mb-2">Ready to checkout?</p>
                <p className="text-sm font-bold uppercase tracking-widest text-neutral-500 mb-10">Log in to finalize your order.</p>
                <Link href="/login" passHref>
                  <button className="inline-flex items-center gap-4 px-10 py-5 bg-neutral-950 text-white font-black uppercase tracking-[0.2em] text-xs hover:bg-red-600 transition-all duration-300 border-4 border-neutral-950">
                    GO TO LOGIN →
                  </button>
                </Link>
              </div>
            )}
          </>
        ) : (
          <div className="border-4 border-neutral-950 p-20 text-center">
            <p className="text-xs font-black tracking-[0.4em] uppercase text-red-600 mb-4">NOTHING HERE</p>
            <p className="text-5xl font-black uppercase tracking-tighter">YOUR CART<br />IS EMPTY.</p>
            <div className="h-2 w-24 bg-neutral-950 mx-auto mt-8" />
          </div>
        )}
      </div>

      {/* SPECIAL DISCOUNT MODAL */}
      <Dialog open={openSpecialDiscount} onClose={() => setOpenSpecialDiscount(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/80" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-6">
          <Dialog.Panel className="w-full max-w-4xl bg-white border-4 border-neutral-950 overflow-y-auto max-h-[90vh]">
            <SpecialDiscount initialData={specialDiscountData} onSubmissionSuccess={handleSubmissionSuccess} />
            <div className="text-center py-4 border-t-4 border-neutral-950">
              <button onClick={() => setOpenSpecialDiscount(false)}
                className="text-xs font-black uppercase tracking-[0.3em] text-neutral-400 hover:text-neutral-950 transition-colors">
                CLOSE
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* VOUCHER MODAL */}
      <Dialog open={!!openVoucherRoom} onClose={() => setOpenVoucherRoom(null)} className="relative z-50">
        <div className="fixed inset-0 bg-black/80" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-3xl bg-white border-4 border-neutral-950 overflow-y-auto max-h-[90vh]">
            <VoucherWallet
              roomIdFilter={openVoucherRoom} onVoucherUsed={handleVoucherUsed}
              usedVoucherStates={usedVoucherStates} setUsedVoucherStates={setUsedVoucherStates}
              roomSubtotal={Object.values(groupedCart[openVoucherRoom]?.items || {}).reduce(
                (sum, item) => sum + Number(item.menuPrice) * (item.quantity || 1), 0
              )}
            />
            <div className="text-center py-4 border-t-4 border-neutral-950">
              <button onClick={() => setOpenVoucherRoom(null)}
                className="text-xs font-black uppercase tracking-[0.3em] text-neutral-400 hover:text-neutral-950 transition-colors">
                CLOSE
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

export default OrderCartPage;
'use client';

import { useEffect, useState } from 'react';
import { FaTrash, FaTag, FaIdCard } from 'react-icons/fa6';
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

const OrderCartPage = () => {
  const [cart, setCart] = useState([]);
  const [groupedCart, setGroupedCart] = useState({});
  const [activeVouchersPerRoom, setActiveVouchersPerRoom] = useState({});
  const [activeSpecialDiscountPerRoom, setActiveSpecialDiscountPerRoom] = useState({});
  const [selectedItems, setSelectedItems] = useState({});
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
      for (const roomId of roomIds) {
        const room = await getSingleSpace(roomId);
        names[roomId] = room?.name || 'Unknown Room';
      }

      const enrichedCart = savedCart.map(item => ({
        ...item,
        room_name: names[item.room_id] || 'Unknown Room',
      }));

      setRoomNames(names);
      setCart(enrichedCart);
      groupItemsByRoom(enrichedCart);
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
            await useVoucher(voucher.$id, false);
            setActiveVouchersPerRoom((prev) => ({ ...prev, [roomId]: null }));
            setUsedVoucherStates((prev) => ({ ...prev, [voucher.$id]: false }));
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
  };

  const handleVoucherUsed = (voucher) => {
    if (voucher) {
      setActiveVouchersPerRoom((prev) => ({
        ...prev,
        [openVoucherRoom]: voucher,
      }));
      setActiveSpecialDiscountPerRoom((prev) => ({
        ...prev,
        [openVoucherRoom]: false,
      }));
    } else {
      setActiveVouchersPerRoom((prev) => ({
        ...prev,
        [openVoucherRoom]: null,
      }));
    }
    setOpenVoucherRoom(null);
  };

  const handleToggleSpecialCardForRoom = (roomId) => {
    setActiveSpecialDiscountPerRoom((prev) => {
      const newActive = { ...prev };
      const isCurrentlyActive = newActive[roomId];
      newActive[roomId] = !isCurrentlyActive;

      if (!isCurrentlyActive) {
        setActiveVouchersPerRoom((prevVouchers) => {
          const newVouchers = { ...prevVouchers };
          newVouchers[roomId] = null;
          return newVouchers;
        });
      }
      return newActive;
    });
  };

  const calculateTotal = () => {
    let total = 0;
    Object.entries(groupedCart).forEach(([roomId, { items }]) => {
      const voucher = activeVouchersPerRoom[roomId];
      const isSpecialDiscountActive = activeSpecialDiscountPerRoom[roomId];

      items.forEach(item => {
        const key = `${roomId}-${item.menuName}-${item.size || 'One-size'}`;
        if (selectedItems[key]) {
          let itemPrice = Number(item.menuPrice) * (item.quantity || 1);
          let discount = 0;

          if (voucher) {
            discount = (voucher.discount / 100) * itemPrice;
          } else if (isSpecialDiscountActive) {
            discount = 0.2 * itemPrice;
          }

          total += itemPrice - discount;
        }
      });
    });
    return total;
  };

  const handleCheckboxChange = (roomId, menuName, size = 'One-size') => {
    const key = `${roomId}-${menuName}-${size}`;
    setSelectedItems((prev) => {
      const updated = { ...prev };
      updated[key] ? delete updated[key] : (updated[key] = true);
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

  const combinedVoucherMap = {};
  Object.keys(groupedCart).forEach(roomId => {
    const voucher = activeVouchersPerRoom[roomId];
    const isSpecialDiscountActive = activeSpecialDiscountPerRoom[roomId];
    const roomSubtotal = groupedCart[roomId].items.reduce((sum, item) => {
      const key = `${roomId}-${item.menuName}-${item.size || 'One-size'}`;
      if (selectedItems[key]) {
        return sum + Number(item.menuPrice) * (item.quantity || 1);
      }
      return sum;
    }, 0);

    if (voucher) {
      combinedVoucherMap[roomId] = voucher;
    } else if (isSpecialDiscountActive && roomSubtotal > 0) {
      combinedVoucherMap[roomId] = {
        title: 'Special Discount',
        discount: 20,
        roomName: roomNames[roomId] || groupedCart[roomId].roomName,
        isSpecial: true,
      };
    }
  });

  const promos = Object.entries(combinedVoucherMap).map(([roomId, voucher]) => {
    return {
      roomName: roomNames[roomId] || groupedCart[roomId].roomName,
      name: voucher.title,
      discount: voucher.discount,
    };
  });

  const handleSubmissionSuccess = () => {
    setOpenSpecialDiscount(false);
    window.location.reload();
  };
  
  if (loadingAuth) {
    return (
      <div className="w-full min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        <LoadingSpinner message="Loading your cart..." />
      </div>
    );
  }

  return (
    <div className="w-full -mt-20 min-h-screen bg-neutral-950 text-white py-20 px-4 sm:px-6 lg:px-8">
      {/* HEADER */}
      <div className="text-center mb-28 mt-12 sm:mt-16">
        <h2 className="text-base sm:text-lg font-light tracking-[0.3em] bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-fuchsia-500">
        YOUR CART ({cartCount})
        </h2>
        <p className="mt-3 text-3xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
        Get ready to indulge in <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-fuchsia-500">every bite.</span>
        </p>
      </div>

      {cart.length > 0 ? (
        <>
          {/* SELECT ALL */}
          <div className="max-w-7xl mx-auto flex items-center mb-6">
            <input
              type="checkbox"
              checked={selectAll}
              onChange={handleGlobalSelectAllChange}
              className="form-checkbox h-4 w-4 bg-transparent border-gray-600 rounded-sm cursor-pointer focus:ring-1 focus:ring-cyan-400 checked:bg-pink-600 checked:border-transparent"
            />
            <span className="ml-2 text-sm text-gray-300">Select All Items</span>
          </div>

          {/* CART ITEMS */}
          {Object.entries(groupedCart).length > 0 && (
            <div className="max-w-7xl mx-auto space-y-12">
              {Object.entries(groupedCart).map(([roomId, { roomName, items }]) => {
                const isRoomSelected = selectAllPerRoom[roomId] || false;
                const isSpecialDiscountActive = activeSpecialDiscountPerRoom[roomId];
                const voucher = activeVouchersPerRoom[roomId];
                
                const hasSelectedItems = items.some(item => selectedItems[`${roomId}-${item.menuName}-${item.size || 'One-size'}`]);
                
                const roomSubtotal = items.reduce((sum, item) => {
                  const key = `${roomId}-${item.menuName}-${item.size || 'One-size'}`;
                  if (selectedItems[key]) {
                    return sum + Number(item.menuPrice) * (item.quantity || 1);
                  }
                  return sum;
                }, 0);

                let discountedSubtotal = 0;
                let discountLabel = null;

                if (voucher) {
                  discountedSubtotal = roomSubtotal - (voucher.discount / 100) * roomSubtotal;
                  discountLabel = `${voucher.discount}% off with "${voucher.title}"`;
                } else if (isSpecialDiscountActive) {
                  discountedSubtotal = roomSubtotal * 0.8;
                  discountLabel = `20% off (Special Discount)`;
                } else {
                  discountedSubtotal = roomSubtotal;
                }

                return (
                  <div key={roomId} className="p-6 rounded-xl bg-neutral-900 border border-neutral-800 shadow-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                      <div className="flex items-center mb-2 sm:mb-0">
                        <input
                          type="checkbox"
                          checked={isRoomSelected}
                          onChange={() => handleRoomSelectAllChange(roomId)}
                          className="form-checkbox h-4 w-4 bg-transparent border-gray-600 rounded-sm cursor-pointer focus:ring-1 focus:ring-cyan-400 checked:bg-pink-600 checked:border-transparent"
                        />
                        <h2 className="ml-2 text-xl font-semibold text-white tracking-wide">{roomNames[roomId] || roomName}</h2>
                      </div>
                      <div className="flex items-center space-x-4">
                        {hasSelectedItems && isAuthenticated && (
                          <>
                            <button
                              onClick={() => setOpenVoucherRoom(roomId)}
                              className="text-sm font-medium text-cyan-400 hover:text-fuchsia-500 transition-colors duration-200 flex items-center"
                            >
                              <FaTag className="mr-2" /> Apply Voucher
                            </button>
                            {specialDiscountData && (
                              <button
                                onClick={() => handleToggleSpecialCardForRoom(roomId)}
                                className={`text-sm font-medium transition-colors duration-200 flex items-center ${activeSpecialDiscountPerRoom[roomId] ? 'text-fuchsia-500' : 'text-pink-600 hover:text-fuchsia-500'}`}
                              >
                                <FaIdCard className="mr-2" />
                                {activeSpecialDiscountPerRoom[roomId] ? 'Cancel Special' : 'Apply Special'}
                              </button>
                            )}
                          </>
                        )}
                        <div className="text-sm text-gray-400 whitespace-nowrap">
                          Subtotal: <span className="text-cyan-400 font-bold">₱{discountedSubtotal.toFixed(2)}</span>
                          {discountLabel && (
                            <span className="ml-2 text-green-500 font-light">({discountLabel})</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {items.map((item) => {
                        const itemKey = `${roomId}-${item.menuName}-${item.size || 'One-size'}`;
                        const isItemSelected = selectedItems[itemKey];

                        let itemPrice = Number(item.menuPrice) * (item.quantity || 1);
                        let finalPrice = itemPrice;
                        let discounted = false;

                        if (isItemSelected && voucher) {
                          finalPrice = itemPrice - (voucher.discount / 100) * itemPrice;
                          discounted = true;
                        } else if (isItemSelected && isSpecialDiscountActive) {
                          finalPrice = itemPrice * 0.8;
                          discounted = true;
                        }

                        return (
                          <div
                            key={itemKey}
                            className="bg-neutral-800 rounded-lg p-4 flex flex-col items-center text-center shadow-inner"
                          >
                            <label className="flex items-center w-full justify-end mb-2">
                              <input
                                type="checkbox"
                                checked={isItemSelected || false}
                                onChange={() => handleCheckboxChange(roomId, item.menuName, item.size)}
                                className="form-checkbox h-4 w-4 bg-transparent border-gray-600 rounded-sm cursor-pointer focus:ring-1 focus:ring-cyan-400 checked:bg-pink-600 checked:border-transparent"
                              />
                            </label>
                            {item.menuImage && (
                              <img
                                src={item.menuImage}
                                alt={item.menuName}
                                className="w-20 h-20 object-cover rounded-full border-2 border-neutral-700 mb-2"
                              />
                            )}
                            <h3 className="font-semibold text-lg text-white tracking-wide">{item.menuName}</h3>
                            {item.size && (
                              <p className="text-sm text-neutral-400 italic mt-0.5">
                                {item.size === 'One-size' ? 'One-size' : `Size: ${item.size}`}
                              </p>
                            )}
                            <div className="flex items-center space-x-3 my-3">
                              <button
                                onClick={() => updateQuantity(roomId, item.menuName, item.size, -1)}
                                className="w-8 h-8 flex items-center justify-center bg-neutral-700 text-white rounded-full hover:bg-neutral-600 transition-colors"
                              >
                                −
                              </button>
                              <span className="font-bold text-lg">{item.quantity || 1}</span>
                              <button
                                onClick={() => updateQuantity(roomId, item.menuName, item.size, 1)}
                                className="w-8 h-8 flex items-center justify-center bg-neutral-700 text-white rounded-full hover:bg-neutral-600 transition-colors"
                              >
                                +
                              </button>
                            </div>
                            <div className="flex flex-col items-center">
                              {discounted && (
                                <span className="text-xs text-neutral-400 line-through">
                                  ₱{itemPrice.toFixed(2)}
                                </span>
                              )}
                              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-fuchsia-500">
                                ₱{finalPrice.toFixed(2)}
                              </span>
                            </div>
                            <button
                              onClick={() => removeItem(roomId, item.menuName, item.size)}
                              className="mt-2 text-red-500 hover:text-red-400 transition-colors"
                            >
                              <FaTrash size={16} />
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
            <div className="max-w-7xl mx-auto mt-12 text-center text-3xl font-extrabold tracking-tight">
              Total: <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-fuchsia-500">₱{calculateTotal().toFixed(2)}</span>
            </div>
          )}

          {/* CHECKOUT */}
          {isAuthenticated ? (
            <div className="max-w-7xl mx-auto">
              {Object.keys(combinedVoucherMap).length > 0 && (
                <div className="mt-8">
                  <UsedVoucherWallet
                    activeVouchersPerRoom={combinedVoucherMap}
                    roomNames={roomNames}
                  />
                </div>
              )}

              <div className="mt-8">
                <CheckoutButton
                  cart={cart.filter(item =>
                    selectedItems[`${item.room_id}-${item.menuName}-${item.size || 'One-size'}`]
                  )}
                  total={calculateTotal()}
                  selectedItems={selectedItems}
                  groupedCart={groupedCart}
                  activeVouchersPerRoom={combinedVoucherMap}
                  roomNames={roomNames}
                  promos={promos}
                  onCheckoutSuccess={() => {
                    setCart([]);
                    setGroupedCart({});
                    setActiveVouchersPerRoom({});
                    setActiveSpecialDiscountPerRoom({});
                    setSelectedItems({});
                    setSelectAll(false);
                    setSelectAllPerRoom({});
                    setCartCount(0);
                  }}
                />
              </div>

              <div className="mt-6 flex flex-col items-center gap-4">
                {specialDiscountData ? (
                  <button
                    onClick={() => setOpenSpecialDiscount(true)}
                    className="px-8 py-3 rounded-xl flex items-center justify-center bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 text-white font-medium transition-colors duration-200"
                  >
                    <FaIdCard className="mr-2" /> Edit PWD / Senior Card
                  </button>
                ) : (
                  <button
                    onClick={() => setOpenSpecialDiscount(true)}
                    className="px-8 py-3 rounded-xl flex items-center justify-center bg-gradient-to-r from-cyan-400 to-fuchsia-500 hover:from-cyan-500 hover:to-fuchsia-600 text-white font-bold transition-colors duration-200 shadow-lg"
                  >
                    <FaIdCard className="mr-2" /> Apply PWD / Senior Card
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="max-w-xl mx-auto mt-8 text-center p-10 bg-neutral-900 rounded-lg">
              <p className="text-lg text-white font-semibold mb-4">
                You need to be logged in to proceed with checkout.
              </p>
              <p className="text-sm text-neutral-400 mb-6">
                Please log in or create an account to finalize your order.
              </p>
              <Link href="/login" passHref>
                <button className="bg-gradient-to-r from-cyan-400 to-fuchsia-500 hover:from-cyan-500 hover:to-fuchsia-600 transition duration-300 text-white font-bold py-3 px-6 rounded-lg text-base shadow-lg">
                  Go to Login
                </button>
              </Link>
            </div>
          )}
        </>
      ) : (
        <p className="text-gray-500 text-lg text-center mt-20">Your cart is empty.</p>
      )}

      {/* SPECIAL DISCOUNT MODAL */}
      <Dialog
        open={openSpecialDiscount}
        onClose={() => setOpenSpecialDiscount(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-6">
          <Dialog.Panel className="w-full max-w-4xl bg-neutral-900 text-white rounded-xl shadow-xl border border-neutral-800 overflow-y-auto max-h-[90vh]">
            <SpecialDiscount
              initialData={specialDiscountData}
              onSubmissionSuccess={handleSubmissionSuccess}
            />
            <div className="text-center mt-6">
              <button
                onClick={() => setOpenSpecialDiscount(false)}
                className="text-sm text-gray-400 hover:text-white underline transition-colors"
              >
                Close
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* VOUCHER MODAL */}
      <Dialog
        open={!!openVoucherRoom}
        onClose={() => setOpenVoucherRoom(null)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/70" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-3xl bg-neutral-900 rounded-xl p-6 shadow-xl border border-neutral-800">
            <VoucherWallet
              roomIdFilter={openVoucherRoom}
              onVoucherUsed={handleVoucherUsed}
              usedVoucherStates={usedVoucherStates}
              setUsedVoucherStates={setUsedVoucherStates}
              roomSubtotal={
                Object.values(groupedCart[openVoucherRoom]?.items || {}).reduce(
                  (sum, item) => sum + Number(item.menuPrice) * (item.quantity || 1),
                  0
                )
              }
            />
            <div className="text-center mt-4">
              <button
                onClick={() => setOpenVoucherRoom(null)}
                className="text-sm text-gray-400 hover:text-white underline transition-colors"
              >
                Close
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

export default OrderCartPage;
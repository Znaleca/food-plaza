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
import checkAuth from '@/app/actions/checkAuth'; // Import the server action

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
  const [isAuthenticated, setIsAuthenticated] = useState(false); // New state for auth
  const [loadingAuth, setLoadingAuth] = useState(true); // New state for loading

  // Check if user has special discount and authentication status on mount
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

    loadCartAndGroup();
  }, []);

  // Cancel vouchers if subtotal < min order
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
      const roomTotal = items.reduce((sum, item) => {
        const key = `${roomId}-${item.menuName}-${item.size || 'One-size'}`;
        if (selectedItems[key]) {
          return sum + Number(item.menuPrice) * (item.quantity || 1);
        }
        return sum;
      }, 0);

      let discount = 0;
      const voucher = activeVouchersPerRoom[roomId];
      const isSpecialDiscountActive = activeSpecialDiscountPerRoom[roomId];

      if (voucher) {
        discount = (voucher.discount / 100) * roomTotal;
      } else if (isSpecialDiscountActive) {
        discount = 0.2 * roomTotal;
      }

      total += roomTotal - discount;
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
    const roomSubtotal = groupedCart[roomId].items.reduce((sum, item) => {
      const key = `${roomId}-${item.menuName}-${item.size || 'One-size'}`;
      if (selectedItems[key]) {
        return sum + Number(item.menuPrice) * (item.quantity || 1);
      }
      return sum;
    }, 0);

    const voucher = activeVouchersPerRoom[roomId];
    const isSpecialDiscountActive = activeSpecialDiscountPerRoom[roomId];

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
  
  // Display a loading state while fetching auth status
  if (loadingAuth) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-64 bg-neutral-900 text-white text-center">
        <p className="text-xl text-pink-600">Loading your cart...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-64 bg-neutral-900 text-white">
      {/* HEADER */}
      <div className="text-center mb-40 -mt-52 px-4">
        <h2 className="text-lg sm:text-1xl text-pink-600 font-light tracking-widest">YOUR CART ({cartCount})</h2>
        <p className="mt-4 text-xl sm:text-5xl font-bold text-white tracking-widest">
          Get ready to indulge in every bite.
        </p>
      </div>

      {/* SELECT ALL */}
      <div className="flex items-center mb-6">
        <input
          type="checkbox"
          checked={selectAll}
          onChange={handleGlobalSelectAllChange}
          className="form-checkbox h-4 w-4 text-pink-600 bg-neutral-700 border-gray-600 mr-2"
        />
        <span className="text-sm">Select All Items</span>
      </div>

      {/* CART ITEMS */}
      {Object.entries(groupedCart).length > 0 ? (
        Object.entries(groupedCart).map(([roomId, { roomName, items }]) => {
          const isRoomSelected = selectAllPerRoom[roomId] || false;
          const roomSubtotal = items
            .filter((item) => selectedItems[`${roomId}-${item.menuName}-${item.size || 'One-size'}`])
            .reduce((sum, item) => sum + Number(item.menuPrice) * (item.quantity || 1), 0);

          let discountLabel = null;
          let discountedSubtotal = roomSubtotal;

          const voucher = activeVouchersPerRoom[roomId];
          const isSpecialDiscountActive = activeSpecialDiscountPerRoom[roomId];

          if (voucher) {
            discountLabel = `${voucher.discount}% off with "${voucher.title}"`;
            discountedSubtotal = roomSubtotal - (voucher.discount / 100) * roomSubtotal;
          } else if (isSpecialDiscountActive) {
            discountLabel = `20% off (Special Discount)`;
            discountedSubtotal = roomSubtotal * 0.8;
          }

          const hasSelectedItems = items.some(item => selectedItems[`${roomId}-${item.menuName}-${item.size || 'One-size'}`]);

          return (
            <div key={roomId} className="mb-10">
              <h2 className="text-xl font-semibold text-white mb-2 flex items-center">
                <input
                  type="checkbox"
                  checked={isRoomSelected}
                  onChange={() => handleRoomSelectAllChange(roomId)}
                  className="form-checkbox h-4 w-4 text-pink-600 bg-neutral-700 border-gray-600 mr-2"
                />
                {roomNames[roomId] || roomName}
                {hasSelectedItems && isAuthenticated && ( // Conditionally render these buttons
                  <div className="flex items-center ml-4 space-x-2">
                    <button
                      onClick={() => setOpenVoucherRoom(roomId)}
                      className="text-sm text-pink-400 hover:underline flex items-center"
                    >
                      <FaTag className="mr-1" /> Apply Voucher
                    </button>
                    {specialDiscountData && (
                      <button
                        onClick={() => handleToggleSpecialCardForRoom(roomId)}
                        className={`text-sm flex items-center ${activeSpecialDiscountPerRoom[roomId] ? 'text-green-400' : 'text-pink-400'} hover:underline`}
                      >
                        <FaIdCard className="mr-1" />
                        {activeSpecialDiscountPerRoom[roomId] ? 'Cancel Special' : 'Apply Special'}
                      </button>
                    )}
                  </div>
                )}
              </h2>

              <div className="text-sm text-pink-400 mb-3 ml-6">
                Subtotal: ₱{discountedSubtotal.toFixed(2)}
                {discountLabel && (
                  <span className="text-green-400 ml-2">({discountLabel})</span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {items.map((item) => {
                  const itemKey = `${roomId}-${item.menuName}-${item.size || 'One-size'}`;
                  return (
                    <div
                      key={itemKey}
                      className="bg-neutral-800 rounded-md p-3 flex flex-col items-center text-sm border-2 border-pink-600"
                    >
                      {item.menuImage && (
                        <img
                          src={item.menuImage}
                          alt={item.menuName}
                          className="w-16 h-16 object-cover rounded-full mb-2"
                        />
                      )}
                      <h3 className="font-medium text-center">{item.menuName}</h3>
                      {item.size && (
                        <p className="text-xs text-neutral-400 italic mt-0.5">
                          {item.size === 'One-size' ? 'One-size' : `Size: ${item.size}`}
                        </p>
                      )}
                      <div className="flex items-center space-x-2 mt-2">
                        <button
                          onClick={() => updateQuantity(roomId, item.menuName, item.size, -1)}
                          className="px-2 py-0.5 bg-neutral-700 rounded hover:bg-neutral-600"
                        >
                          −
                        </button>
                        <span className="font-semibold">{item.quantity || 1}</span>
                        <button
                          onClick={() => updateQuantity(roomId, item.menuName, item.size, 1)}
                          className="px-2 py-0.5 bg-neutral-700 rounded hover:bg-neutral-600"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-pink-600 font-semibold mt-1">
                        ₱{(Number(item.menuPrice) * Number(item.quantity || 1)).toFixed(2)}
                      </span>
                      <button
                        onClick={() => removeItem(roomId, item.menuName, item.size)}
                        className="mt-1 text-red-500 hover:text-red-600"
                      >
                        <FaTrash size={14} />
                      </button>
                      <label className="mt-2 flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedItems[itemKey] || false}
                          onChange={() => handleCheckboxChange(roomId, item.menuName, item.size)}
                          className="form-checkbox h-4 w-4 text-pink-600 bg-neutral-700 border-gray-600 mr-1"
                        />
                        Select
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      ) : (
        <p className="text-gray-400 text-lg text-center mt-4">Cart is empty</p>
      )}

      {cart.length > 0 && (
        <div className="mt-6 text-center text-xl font-semibold">
          Total: ₱{calculateTotal().toFixed(2)}
        </div>
      )}

      {/* CHECKOUT */}
      {cart.length > 0 && isAuthenticated ? (
        <>
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
                className="px-6 py-2 rounded-lg flex items-center justify-center bg-neutral-700 hover:bg-neutral-600 text-white transition-colors duration-200"
              >
                <FaIdCard className="mr-2" /> Edit PWD / Senior Card
              </button>
            ) : (
              <button
                onClick={() => setOpenSpecialDiscount(true)}
                className="px-6 py-2 rounded-lg flex items-center justify-center bg-pink-600 hover:bg-pink-700 text-white transition-colors duration-200"
              >
                <FaIdCard className="mr-2" /> Apply PWD / Senior Card
              </button>
            )}
          </div>
        </>
      ) : cart.length > 0 && (
        <div className="mt-8 text-center">
          <p className="text-pink-600 text-lg font-semibold">
            You need to be logged in to proceed with checkout.
          </p>
          <p className="text-sm text-neutral-400 mt-2">
            Please log in or create an account to finalize your order.
          </p>
        </div>
      )}

      {/* SPECIAL CARD MODAL */}
      <Dialog
        open={openSpecialDiscount}
        onClose={() => setOpenSpecialDiscount(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-6">
          <Dialog.Panel className="w-full max-w-4xl bg-neutral-900 rounded-2xl p-10 shadow-2xl border-2 border-pink-600">
            <SpecialDiscount
              initialData={specialDiscountData}
              onSubmissionSuccess={handleSubmissionSuccess}
            />
            <div className="text-center mt-6">
              <button
                onClick={() => setOpenSpecialDiscount(false)}
                className="text-sm text-gray-300 hover:text-white underline"
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
        <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-3xl bg-neutral-900 rounded-lg p-6 shadow-xl">
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
                className="text-sm text-gray-300 hover:text-white underline"
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
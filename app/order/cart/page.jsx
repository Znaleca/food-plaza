'use client';

import { useEffect, useState } from 'react';
import { FaTrash, FaTag } from 'react-icons/fa6';
import { Dialog } from '@headlessui/react';
import VoucherWallet from '@/components/VoucherWallet';
import CheckoutButton from '@/components/CheckoutButton';
import UsedVoucherWallet from '@/components/UsedVoucherWallet';
import getSingleSpace from '@/app/actions/getSingleSpace';

const OrderCartPage = () => {
  const [cart, setCart] = useState([]);
  const [groupedCart, setGroupedCart] = useState({});
  const [activeVouchersPerRoom, setActiveVouchersPerRoom] = useState({});
  const [selectedItems, setSelectedItems] = useState({});
  const [selectAll, setSelectAll] = useState(false);
  const [selectAllPerRoom, setSelectAllPerRoom] = useState({});
  const [roomNames, setRoomNames] = useState({});
  const [openVoucherRoom, setOpenVoucherRoom] = useState(null);
  const [usedVoucherStates, setUsedVoucherStates] = useState({});
  const [cartCount, setCartCount] = useState(0); // NEW — cart item count

  useEffect(() => {
    const loadCartAndGroup = async () => {
      const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
      setCartCount(savedCart.reduce((sum, item) => sum + (item.quantity || 1), 0)); // update count

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
    setCartCount(updatedCart.reduce((sum, item) => sum + (item.quantity || 1), 0)); // update count
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
    setActiveVouchersPerRoom((prev) => ({
      ...prev,
      [openVoucherRoom]: voucher ?? null,
    }));
    setOpenVoucherRoom(null);
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

      const voucher = activeVouchersPerRoom[roomId];
      const discount = voucher?.discount ? (voucher.discount / 100) * roomTotal : 0;
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

  const promos = Object.entries(activeVouchersPerRoom).map(([roomId, voucher]) => ({
    roomName: roomNames[roomId] || 'Unknown Room',
    name: voucher?.title,
    discount: voucher?.discount,
  }));

  return (
    <div className="max-w-7xl mx-auto px-6 py-64 bg-neutral-900 text-white">
      <div className="text-center mb-40 -mt-52 px-4">
        <h2 className="text-lg sm:text-1xl text-pink-600 font-light tracking-widest">YOUR CART ({cartCount})</h2>
        <p className="mt-4 text-xl sm:text-5xl font-bold text-white tracking-widest">
          Get ready to indulge in every bite.
        </p>
      </div>

      <div className="flex items-center mb-6">
        <input
          type="checkbox"
          checked={selectAll}
          onChange={handleGlobalSelectAllChange}
          className="form-checkbox h-4 w-4 text-pink-600 bg-neutral-700 border-gray-600 mr-2"
        />
        <span className="text-sm">Select All Items</span>
      </div>

      {Object.entries(groupedCart).length > 0 ? (
        Object.entries(groupedCart).map(([roomId, { roomName, items }]) => {
          const isRoomSelected = selectAllPerRoom[roomId] || false;
          const roomSubtotal = items
            .filter((item) => selectedItems[`${roomId}-${item.menuName}-${item.size || 'One-size'}`])
            .reduce((sum, item) => sum + Number(item.menuPrice) * (item.quantity || 1), 0);

          const roomVoucher = activeVouchersPerRoom[roomId];
          const discountedSubtotal = roomVoucher?.discount
            ? roomSubtotal - (roomVoucher.discount / 100) * roomSubtotal
            : roomSubtotal;

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
                {items.some(item => selectedItems[`${roomId}-${item.menuName}-${item.size || 'One-size'}`]) && (
                  <button
                    onClick={() => setOpenVoucherRoom(roomId)}
                    className="ml-4 text-sm text-pink-400 hover:underline flex items-center"
                  >
                    <FaTag className="mr-1" /> Apply Voucher
                  </button>
                )}
              </h2>

              <div className="text-sm text-pink-400 mb-3 ml-6">
                Subtotal: ₱{discountedSubtotal.toFixed(2)}
                {roomVoucher && (
                  <span className="text-green-400 ml-2">
                    ({roomVoucher.discount}% off with "{roomVoucher.title}")
                  </span>
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

      {cart.length > 0 && (
        <>
          {Object.keys(activeVouchersPerRoom).length > 0 && (
            <div className="mt-8">
              <UsedVoucherWallet
                activeVouchersPerRoom={activeVouchersPerRoom}
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
              activeVouchersPerRoom={activeVouchersPerRoom}
              roomNames={roomNames}
              promos={promos} 
              onCheckoutSuccess={() => {
                setCart([]);
                setGroupedCart({});
                setActiveVouchersPerRoom({});
                setSelectedItems({});
                setSelectAll(false);
                setSelectAllPerRoom({});
                setCartCount(0); // reset counter
              }}
            />
          </div>
        </>
      )}

      <Dialog open={!!openVoucherRoom} onClose={() => setOpenVoucherRoom(null)} className="relative z-50">
        <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-3xl bg-neutral-900 rounded-lg p-6 shadow-xl">
            <VoucherWallet
              roomIdFilter={openVoucherRoom}
              onVoucherUsed={handleVoucherUsed}
              usedVoucherStates={usedVoucherStates}
              setUsedVoucherStates={setUsedVoucherStates}
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

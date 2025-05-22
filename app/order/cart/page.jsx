'use client';

import { useEffect, useState } from 'react';
import { FaTrash } from 'react-icons/fa6';
import VoucherWallet from '@/components/VoucherWallet';
import CheckoutButton from '@/components/CheckoutButton';

const OrderCartPage = () => {
  const [cart, setCart] = useState([]);
  const [groupedCart, setGroupedCart] = useState({});
  const [activeVoucher, setActiveVoucher] = useState(null);
  const [selectedItems, setSelectedItems] = useState({});
  const [selectAll, setSelectAll] = useState(false);
  const [selectAllPerRoom, setSelectAllPerRoom] = useState({});

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
    setCart(savedCart);
    groupItemsByRoom(savedCart);
  }, []);

  const groupItemsByRoom = (cartItems) => {
    const grouped = cartItems.reduce((acc, item) => {
      if (!acc[item.room_name]) {
        acc[item.room_name] = [];
      }
      acc[item.room_name].push(item);
      return acc;
    }, {});
    setGroupedCart(grouped);
  };

  const updateQuantity = (roomName, menuName, delta) => {
    const updatedCart = cart.map((item) => {
      if (item.room_name === roomName && item.menuName === menuName) {
        return { ...item, quantity: Math.max(1, (item.quantity || 1) + delta) };
      }
      return item;
    });
    setCart(updatedCart);
    groupItemsByRoom(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const removeItem = (roomName, menuName) => {
    const updatedCart = cart.filter(
      (item) => !(item.room_name === roomName && item.menuName === menuName)
    );
    setCart(updatedCart);
    groupItemsByRoom(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const calculateTotal = () => {
    const baseTotal = cart.reduce((total, item) => {
      const itemKey = `${item.room_name}-${item.menuName}`;
      if (selectedItems[itemKey]) {
        return total + Number(item.menuPrice) * Number(item.quantity || 1);
      }
      return total;
    }, 0);

    if (activeVoucher && activeVoucher.discount) {
      const discount = (activeVoucher.discount / 100) * baseTotal;
      return baseTotal - discount;
    }

    return baseTotal;
  };

  const handleVoucherUsed = (voucher) => {
    if (!voucher || (activeVoucher && activeVoucher.id === voucher.id)) {
      setActiveVoucher(null);
    } else {
      setActiveVoucher(voucher);
    }
  };

  const handleVoucherCancelled = () => {
    setActiveVoucher(null);
  };

  const handleCheckboxChange = (roomName, menuName) => {
    setSelectedItems((prev) => {
      const key = `${roomName}-${menuName}`;
      const updated = { ...prev };
      updated[key] ? delete updated[key] : (updated[key] = true);
      return updated;
    });
  };

  const handleRoomSelectAllChange = (roomName) => {
    setSelectAllPerRoom((prev) => {
      const isSelected = !prev[roomName];
      const updated = { ...prev, [roomName]: isSelected };

      setSelectedItems((prevSelected) => {
        const updatedItems = { ...prevSelected };
        (groupedCart[roomName] || []).forEach((item) => {
          const key = `${roomName}-${item.menuName}`;
          isSelected ? (updatedItems[key] = true) : delete updatedItems[key];
        });
        return updatedItems;
      });

      return updated;
    });
  };

  const handleGlobalSelectAllChange = () => {
    setSelectAll((prev) => {
      const newSelectAll = !prev;

      const allItems = {};
      if (newSelectAll) {
        cart.forEach((item) => {
          const key = `${item.room_name}-${item.menuName}`;
          allItems[key] = true;
        });
      }

      setSelectedItems(allItems);
      setSelectAllPerRoom(
        Object.keys(groupedCart).reduce((acc, roomName) => {
          acc[roomName] = newSelectAll;
          return acc;
        }, {})
      );

      return newSelectAll;
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-64 bg-neutral-900 text-white">
      <div className="text-center mb-40 -mt-52 px-4">
        <h2 className="text-lg sm:text-1xl text-pink-600 font-light tracking-widest">YOUR CART</h2>
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

      {Object.keys(groupedCart).length > 0 ? (
        Object.entries(groupedCart).map(([roomName, items]) => {
          const isRoomSelected = selectAllPerRoom[roomName] || false;
          return (
            <div key={roomName} className="mb-10">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <input
                  type="checkbox"
                  checked={isRoomSelected}
                  onChange={() => handleRoomSelectAllChange(roomName)}
                  className="form-checkbox h-4 w-4 text-pink-600 bg-neutral-700 border-gray-600 mr-2"
                />
                {roomName}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {items.map((item) => {
                  const itemKey = `${roomName}-${item.menuName}`;
                  return (
                    <div
  key={item.menuName}
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
  <div className="flex items-center space-x-2 mt-1">
    <button
      onClick={() => updateQuantity(roomName, item.menuName, -1)}
      className="px-2 py-0.5 bg-neutral-700 rounded hover:bg-neutral-600"
    >
      −
    </button>
    <span className="font-semibold">{item.quantity || 1}</span>
    <button
      onClick={() => updateQuantity(roomName, item.menuName, 1)}
      className="px-2 py-0.5 bg-neutral-700 rounded hover:bg-neutral-600"
    >
      +
    </button>
  </div>
  <span className="text-pink-600 font-semibold mt-1">
    ₱{(Number(item.menuPrice) * Number(item.quantity || 1)).toFixed(2)}
  </span>
  <button
    onClick={() => removeItem(roomName, item.menuName)}
    className="mt-1 text-red-500 hover:text-red-600"
  >
    <FaTrash size={14} />
  </button>
  <label className="mt-2 flex items-center">
    <input
      type="checkbox"
      checked={selectedItems[itemKey] || false}
      onChange={() => handleCheckboxChange(roomName, item.menuName)}
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
          {activeVoucher && (
            <div className="text-sm text-green-500 mt-1">
              ({activeVoucher.discount}% off with "{activeVoucher.title}")
            </div>
          )}
        </div>
      )}

      <div className="mt-10">
        <VoucherWallet
          onVoucherUsed={handleVoucherUsed}
          onVoucherCancelled={handleVoucherCancelled}
        />
      </div>

      {cart.length > 0 && (
        <div className="mt-8">
          <CheckoutButton
            cart={cart}
            voucher={activeVoucher}
            total={calculateTotal()}
            onCheckoutSuccess={() => {
              setCart([]);
              setGroupedCart({});
              setActiveVoucher(null);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default OrderCartPage;

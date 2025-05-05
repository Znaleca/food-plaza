'use client';

import { useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa6";
import VoucherWallet from "@/components/VoucherWallet";
import CheckoutButton from "@/components/CheckoutButton";
import Heading from "@/components/Heading";

const OrderCartPage = () => {
  const [cart, setCart] = useState([]);
  const [groupedCart, setGroupedCart] = useState({});
  const [activeVoucher, setActiveVoucher] = useState(null);
  const [selectedItems, setSelectedItems] = useState({});
  const [selectAll, setSelectAll] = useState(false);
  const [selectAllPerRoom, setSelectAllPerRoom] = useState({});

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
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
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const removeItem = (roomName, menuName) => {
    const updatedCart = cart.filter(
      (item) => !(item.room_name === roomName && item.menuName === menuName)
    );
    setCart(updatedCart);
    groupItemsByRoom(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
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
    if (!voucher) {
      setActiveVoucher(null);
      return;
    }
  
    if (activeVoucher && activeVoucher.id === voucher.id) {
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
      const newItems = { ...prev };
      const key = `${roomName}-${menuName}`;
      newItems[key] ? delete newItems[key] : (newItems[key] = true);
      return newItems;
    });
  };

  const handleRoomSelectAllChange = (roomName) => {
    setSelectAllPerRoom((prev) => {
      const newSelectAll = { ...prev };
      const isSelected = !newSelectAll[roomName];
      newSelectAll[roomName] = isSelected;

      setSelectedItems((prevSelected) => {
        const updated = { ...prevSelected };
        (groupedCart[roomName] || []).forEach((item) => {
          const key = `${roomName}-${item.menuName}`;
          isSelected ? (updated[key] = true) : delete updated[key];
        });
        return updated;
      });

      return newSelectAll;
    });
  };

  const handleGlobalSelectAllChange = () => {
    setSelectAll((prev) => {
      const newSelectAll = !prev;

      setSelectedItems(() => {
        const allItems = {};
        if (newSelectAll) {
          cart.forEach((item) => {
            const key = `${item.room_name}-${item.menuName}`;
            allItems[key] = true;
          });
        }
        return allItems;
      });

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
    <div className="max-w-4xl mx-auto p-6 bg-white min-h-screen">
      <Heading title="Your Cart" />

      <div className="flex items-center mb-6">
        <input
          type="checkbox"
          checked={selectAll}
          onChange={handleGlobalSelectAllChange}
          className="form-checkbox h-4 w-4 text-blue-600 mr-2"
        />
        <span className="text-sm text-gray-700">Select All Items</span>
      </div>

      {Object.keys(groupedCart).length > 0 ? (
        Object.entries(groupedCart).map(([roomName, items]) => {
          const isRoomSelected = selectAllPerRoom[roomName] || false;
          return (
            <div key={roomName} className="w-full mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <input
                  type="checkbox"
                  checked={isRoomSelected}
                  onChange={() => handleRoomSelectAllChange(roomName)}
                  className="form-checkbox h-4 w-4 text-blue-600 mr-2"
                />
                {roomName}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {items.map((item) => {
                  const itemKey = `${roomName}-${item.menuName}`;
                  return (
                    <div
                      key={item.menuName}
                      className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex flex-col items-center shadow-sm hover:shadow transition"
                    >
                      {item.menuImage && (
                        <img
                          src={item.menuImage}
                          alt={item.menuName}
                          className="w-20 h-20 object-cover rounded-full mb-3"
                        />
                      )}

                      <h3 className="text-base font-medium text-gray-700 text-center">{item.menuName}</h3>

                      <div className="flex items-center space-x-3 mt-2">
                        <button
                          onClick={() => updateQuantity(roomName, item.menuName, -1)}
                          className="px-2 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
                        >−</button>

                        <span className="text-lg font-semibold">{item.quantity || 1}</span>

                        <button
                          onClick={() => updateQuantity(roomName, item.menuName, 1)}
                          className="px-2 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
                        >+</button>
                      </div>

                      <span className="text-sm text-pink-600 font-semibold mt-2">
                        ₱{(Number(item.menuPrice) * Number(item.quantity || 1)).toFixed(2)}
                      </span>

                      <button
                        onClick={() => removeItem(roomName, item.menuName)}
                        className="mt-2 text-red-500 hover:text-red-700"
                      >
                        <FaTrash size={16} />
                      </button>

                      <label className="mt-3 flex items-center text-sm text-gray-600">
                        <input
                          type="checkbox"
                          checked={selectedItems[itemKey] || false}
                          onChange={() => handleCheckboxChange(roomName, item.menuName)}
                          className="form-checkbox h-4 w-4 text-blue-500 mr-2"
                        />
                        Select item
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      ) : (
        <p className="text-gray-600 text-lg text-center mt-4">Cart is empty</p>
      )}

      {cart.length > 0 && (
        <div className="mt-6 text-center text-xl font-semibold text-gray-900">
          Total: ₱{calculateTotal().toFixed(2)}
          {activeVoucher && (
            <div className="text-sm text-green-600 font-normal mt-1">
              ({activeVoucher.discount}% off with "{activeVoucher.title}")
            </div>
          )}
        </div>
      )}

      <div className="w-full mt-8">
        <VoucherWallet
          onVoucherUsed={handleVoucherUsed}
          onVoucherCancelled={handleVoucherCancelled}
        />
      </div>

      {cart.length > 0 && (
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
      )}
    </div>
  );
};

export default OrderCartPage;

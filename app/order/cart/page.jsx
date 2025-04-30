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
    if (activeVoucher && activeVoucher.id === voucher.id) {
      setActiveVoucher(null); // Remove voucher if clicked again
    } else {
      setActiveVoucher(voucher); // Apply new voucher
    }
  };

  const handleVoucherCancelled = () => {
    setActiveVoucher(null); // Reset active voucher
  };

  const handleCheckboxChange = (roomName, menuName) => {
    setSelectedItems((prevSelectedItems) => {
      const newSelectedItems = { ...prevSelectedItems };
      const key = `${roomName}-${menuName}`;

      // Toggle the item selection
      if (newSelectedItems[key]) {
        delete newSelectedItems[key]; // Unselect item
      } else {
        newSelectedItems[key] = true; // Select item
      }

      return newSelectedItems;
    });
  };

  const handleRoomSelectAllChange = (roomName) => {
    setSelectAllPerRoom((prevSelectAllPerRoom) => {
      const newSelectAllPerRoom = { ...prevSelectAllPerRoom };
      const isSelected = !newSelectAllPerRoom[roomName];

      // Update select all state for the room
      newSelectAllPerRoom[roomName] = isSelected;

      // Select or deselect all items in the room
      setSelectedItems((prevSelectedItems) => {
        const newSelectedItems = { ...prevSelectedItems };
        const itemsInRoom = groupedCart[roomName] || [];
        itemsInRoom.forEach((item) => {
          const key = `${roomName}-${item.menuName}`;
          if (isSelected) {
            newSelectedItems[key] = true; // Select item
          } else {
            delete newSelectedItems[key]; // Deselect item
          }
        });
        return newSelectedItems;
      });

      return newSelectAllPerRoom;
    });
  };

  const handleGlobalSelectAllChange = () => {
    setSelectAll((prevSelectAll) => {
      const newSelectAll = !prevSelectAll;

      // Select or deselect all items across all rooms
      setSelectedItems((prevSelectedItems) => {
        const newSelectedItems = {};
        if (newSelectAll) {
          cart.forEach((item) => {
            const key = `${item.room_name}-${item.menuName}`;
            newSelectedItems[key] = true;
          });
        }
        return newSelectedItems;
      });

      // Set select all per room state to match global select all
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
    <div className="max-w-3xl mx-auto p-8 bg-gray-100 min-h-screen flex flex-col items-center">
        <Heading title="Your Cart" />

      {/* Global Select All Checkbox */}
      <div className="flex items-center mb-6">
        <input
          type="checkbox"
          checked={selectAll}
          onChange={handleGlobalSelectAllChange}
          className="mr-2"
        />
        <span>Select All Items</span>
      </div>

      {Object.keys(groupedCart).length > 0 ? (
        Object.entries(groupedCart).map(([roomName, items]) => {
          const isRoomSelected = selectAllPerRoom[roomName] || false;
          return (
            <div key={roomName} className="w-full mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
                {/* Room Select All Checkbox */}
                <input
                  type="checkbox"
                  checked={isRoomSelected}
                  onChange={() => handleRoomSelectAllChange(roomName)}
                  className="mr-2"
                />
                <span>{roomName}</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                {items.map((item) => {
                  const itemKey = `${roomName}-${item.menuName}`;
                  return (
                    <div
                      key={item.menuName}
                      className="bg-white shadow-md rounded-xl p-6 border border-gray-300 flex flex-col items-center space-y-4 transform hover:scale-105 transition"
                    >
                      {item.menuImage && (
                        <img
                          src={item.menuImage}
                          alt={item.menuName}
                          className="w-24 h-24 object-cover rounded-full shadow-md"
                        />
                      )}

                      <h2 className="text-lg font-semibold text-gray-800 text-center">{item.menuName}</h2>
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => updateQuantity(roomName, item.menuName, -1)}
                          className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
                        >
                          -
                        </button>
                        <span className="font-bold text-xl">{item.quantity || 1}</span>
                        <button
                          onClick={() => updateQuantity(roomName, item.menuName, 1)}
                          className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
                        >
                          +
                        </button>
                      </div>
                      <span className="font-bold text-green-700 text-xl">
                        ₱{(Number(item.menuPrice) * Number(item.quantity || 1)).toFixed(2)}
                      </span>
                      <button
                        onClick={() => removeItem(roomName, item.menuName)}
                        className="text-red-600 p-2 hover:text-red-800 transition"
                      >
                        <FaTrash size={18} />
                      </button>

                      {/* Item Checkbox */}
                      <div className="mt-4 flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedItems[itemKey] || false}
                          onChange={() => handleCheckboxChange(roomName, item.menuName)}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">Select this item</span>
                      </div>
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
        <div className="mt-6 text-center text-2xl font-bold text-gray-900">
          Total: ₱{calculateTotal().toFixed(2)}{" "}
          {activeVoucher && (
            <span className="block text-sm text-green-600 font-medium mt-1">
              ({activeVoucher.discount}% off with "{activeVoucher.title}")
            </span>
          )}
        </div>
      )}

      <div className="w-full mt-8">
        <VoucherWallet
          onVoucherUsed={handleVoucherUsed}
          onVoucherCancelled={handleVoucherCancelled} // Handle cancel voucher action
        />
      </div>

      {cart.length > 0 && (
        <CheckoutButton
          cart={cart}
          voucher={activeVoucher}
          total={calculateTotal()} // Recalculate total when the voucher is applied or canceled
          onCheckoutSuccess={() => {
            setCart([]);
            setGroupedCart({});
            setActiveVoucher(null); // Reset voucher after successful checkout
          }}
        />
      )}
    </div>
  );
};

export default OrderCartPage;

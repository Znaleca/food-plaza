"use client";

import { useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa6";

const OrderCartPage = () => {
  const [cart, setCart] = useState([]);
  const [groupedCart, setGroupedCart] = useState({});

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
    return cart.reduce(
      (total, item) => total + Number(item.menuPrice) * Number(item.quantity || 1),
      0
    );
  };

  return (
    <div className="max-w-3xl mx-auto p-8 bg-gray-100 min-h-screen flex flex-col items-center">
      <h1 className="text-3xl font-bold text-center text-gray-900 mb-6">Order Cart</h1>

      {Object.keys(groupedCart).length > 0 ? (
        Object.entries(groupedCart).map(([roomName, items]) => (
          <div key={roomName} className="w-full mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">{roomName}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
              {items.map((item) => (
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
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-600 text-lg text-center mt-4">Cart is empty</p>
      )}

      {cart.length > 0 && (
        <div className="mt-6 text-center text-2xl font-bold text-gray-900">
          Total: ₱{calculateTotal().toFixed(2)}
        </div>
      )}
    </div>
  );
};

export default OrderCartPage;

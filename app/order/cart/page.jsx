"use client";

import { useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa6";

const OrderCartPage = () => {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(savedCart);
  }, []);

  const updateQuantity = (index, delta) => {
    const updatedCart = [...cart];
    updatedCart[index].quantity = Math.max(1, (updatedCart[index].quantity || 1) + delta);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const removeItem = (index) => {
    const updatedCart = [...cart];
    updatedCart.splice(index, 1);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart");
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + Number(item.menuPrice) * Number(item.quantity || 1), 0);
  };

  const totalPrice = calculateTotal();

  return (
    <div className="max-w-xl mx-auto p-8 bg-white shadow-lg rounded-lg mt-12 border border-gray-200">
      <h1 className="text-3xl font-bold text-center text-gray-900 mb-6">Order Cart</h1>

      {cart.length > 0 ? (
        <ul className="mt-4 divide-y divide-gray-300 border border-gray-300 rounded-lg overflow-hidden">
          {cart.map((item, index) => (
            <li
              key={index}
              className="flex justify-between items-center py-4 px-6 text-gray-800 text-lg font-medium gap-4 bg-gray-50 hover:bg-gray-100 transition"
            >
              <span className="flex-1 text-left">{item.menuName}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(index, -1)}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
                >
                  -
                </button>
                <span className="font-bold text-xl">{item.quantity || 1}</span>
                <button
                  onClick={() => updateQuantity(index, 1)}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
                >
                  +
                </button>
              </div>
              <span className="font-bold text-green-700 text-xl">
                ₱{(Number(item.menuPrice) * Number(item.quantity || 1)).toFixed(2)}
              </span>
              <button
                onClick={() => removeItem(index)}
                className="text-red-600 p-2 hover:text-red-800 transition"
              >
                <FaTrash size={18} />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600 text-lg text-center mt-4">Cart is empty</p>
      )}

      {cart.length > 0 && (
        <div className="mt-6 text-center text-2xl font-bold text-gray-900">
          Total: ₱{totalPrice.toFixed(2)}
        </div>
      )}

      
    </div>
  );
};

export default OrderCartPage;
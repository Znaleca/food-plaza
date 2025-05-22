import React, { useState } from "react";
import { FaPlus, FaMinus } from "react-icons/fa6";

const MenuPopUp = ({ item, price, menuImage, roomName, onClose, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const totalPrice = (price * quantity).toFixed(2);

  const handleAddToCart = () => {
    onAddToCart(item, price, quantity, menuImage, roomName);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
      <div className="bg-neutral-900 p-6 rounded-xl shadow-xl w-96 text-center border border-neutral-700">
        {menuImage && (
          <img
            src={menuImage}
            alt={item}
            className="w-40 h-40 object-cover rounded-full mx-auto mb-4 shadow-md"
          />
        )}
        <h2 className="text-2xl font-semibold text-white mb-2">{item}</h2>
        <p className="text-2xl font-bold text-pink-500 mb-4">₱{price}</p>

        <div className="flex items-center justify-center space-x-4 mb-4">
          <label className="text-neutral-300 font-medium">Quantity:</label>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setQuantity(quantity > 1 ? quantity - 1 : 1)}
              className="bg-neutral-800 text-white font-bold p-2 rounded-lg transition hover:bg-neutral-700"
            >
              <FaMinus size={16} />
            </button>
            <span className="text-xl font-semibold w-8 text-center text-white">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="bg-neutral-800 text-white font-bold p-2 rounded-lg transition hover:bg-neutral-700"
            >
              <FaPlus size={16} />
            </button>
          </div>
        </div>

        <hr className="border-t border-neutral-700 my-4" />

        <p className="text-sm font-semibold text-neutral-400">
          Total: <span className="text-neutral-200 font-normal">₱{totalPrice}</span>
        </p>

        <div className="space-y-3 mt-4">
          <button
            onClick={handleAddToCart}
            className="w-full bg-pink-600 hover:bg-pink-700 text-white font-semibold py-3 rounded-lg shadow-md transition duration-300"
          >
            Add to Cart
          </button>
          <button
            onClick={onClose}
            className="w-full bg-neutral-800 hover:bg-neutral-700 text-white font-medium py-3 rounded-lg transition duration-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuPopUp;

import React, { useState } from "react";
import { FaPlus, FaMinus } from "react-icons/fa6";

const MenuPopUp = ({ item, price, menuImage, roomName, onClose, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const totalPrice = (price * quantity).toFixed(2);

  const handleAddToCart = () => {
    onAddToCart(item, price, quantity, menuImage, roomName); // Ensure roomName is passed
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white p-6 rounded-lg shadow-xl w-96 text-center">
        {menuImage && (
          <img
            src={menuImage}
            alt={item}
            className="w-40 h-40 object-cover rounded-full mx-auto mb-4 shadow-md"
          />
        )}
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">{item}</h2>
        <p className="text-2xl font-bold text-green-900 mb-4">₱{price}</p>

        <div className="flex items-center justify-center space-x-4 mb-4">
          <label className="text-gray-700 font-medium">Quantity:</label>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setQuantity(quantity > 1 ? quantity - 1 : 1)}
              className="bg-black text-white font-bold p-2 rounded-lg transition"
            >
              <FaMinus size={16} />
            </button>
            <span className="text-xl font-semibold w-8 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="bg-black text-white font-bold p-2 rounded-lg transition"
            >
              <FaPlus size={16} />
            </button>
          </div>
        </div>

        <hr className="border-t border-gray-300 my-4" />

        <p className="text-sm font-semibold text-gray-400">
          Total: <span className="text-gray-400 font-normal">₱{totalPrice}</span>
        </p>

        <div className="space-y-3 mt-4">
          <button
            onClick={handleAddToCart}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-white font-semibold py-3 rounded-lg shadow-md transition duration-300"
          >
            Add to Cart
          </button>
          <button
            onClick={onClose}
            className="w-full bg-black hover:bg-gray-900 text-white font-medium py-3 rounded-lg transition duration-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuPopUp;

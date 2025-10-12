// components/MenuInventory.jsx

import React from 'react';
import { FaToggleOff, FaToggleOn, FaMinus, FaPlus } from 'react-icons/fa6';

/**
 * Component for managing the stock and availability of final menu products.
 *
 * @param {Object} props
 * @param {Array<Object>} props.menuData - List of menu items with their current state (name, image, quantity, isAvailable, index).
 * @param {Function} props.handleUpdateMenuQuantity - Handler to change the quantity of a menu item.
 * @param {Function} props.toggleMenuAvailability - Handler to toggle the availability of a menu item.
 */
const MenuInventory = ({
  menuData,
  handleUpdateMenuQuantity,
  toggleMenuAvailability,
}) => {
  return (
    <>
      <h3 className="text-2xl font-bold text-yellow-400 mb-6 border-b border-neutral-700 pb-2">
        Final Product Stock
      </h3>
      <p className="text-neutral-400 mb-6">
        Quickly adjust stock and availability for menu items.
      </p>

      {menuData.length === 0 ? (
        <div className="text-center p-8 border-2 border-dashed border-neutral-700 rounded-xl text-neutral-400 mb-10">
          <p className="font-semibold">No menu items defined.</p>
        </div>
      ) : (
        <div className="space-y-4 mb-16">
          {menuData.map((item) => (
            <div
              key={item.index}
              className="bg-neutral-800 p-4 rounded-xl flex items-center justify-between"
            >
              <div className="flex items-center space-x-4 flex-1">
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-10 h-10 rounded-full object-cover shadow-sm"
                  />
                )}
                <div>
                  <p className="font-semibold">{item.name}</p>
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <button
                  onClick={() => toggleMenuAvailability(item.index)}
                  className="text-xl transition-transform hover:scale-105"
                  title={item.isAvailable ? 'Set Unavailable' : 'Set Available'}
                >
                  {item.isAvailable ? (
                    <FaToggleOn className="text-green-500" />
                  ) : (
                    <FaToggleOff className="text-red-500" />
                  )}
                </button>

                <div className="flex items-center border border-neutral-700 rounded-lg">
                  <button
                    onClick={() => handleUpdateMenuQuantity(item.index, -1)}
                    className="p-2 bg-neutral-700 rounded-l-lg hover:bg-neutral-600 transition"
                  >
                    <FaMinus className="w-4 h-4 text-pink-400" />
                  </button>
                  <span
                    className={`px-3 py-2 font-bold w-12 text-center ${
                      item.quantity === 0 ? 'text-red-400' : 'text-white'
                    }`}
                  >
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => handleUpdateMenuQuantity(item.index, 1)}
                    className="p-2 bg-neutral-700 rounded-r-lg hover:bg-neutral-600 transition"
                  >
                    <FaPlus className="w-4 h-4 text-pink-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default MenuInventory;
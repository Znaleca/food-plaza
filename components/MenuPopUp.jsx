'use client';

import { useState, useMemo, useEffect } from 'react';
import { FaPlus, FaMinus } from 'react-icons/fa6';
import { useAuth } from '@/context/authContext';

export default function MenuPopUp({
  item,
  price,
  smallFee = 0,
  mediumFee = 0,
  largeFee = 0,
  menuImage,
  roomName,
  roomId,
  description = '',
  onClose,
  onAddToCart,
  recommendedMenus = [],
  onSelectMenu,
}) {
  const { setCartCount } = useAuth();

  const sizeDefs = useMemo(
    () => [
      { key: 'S', fee: Number(smallFee) || 0 },
      { key: 'M', fee: Number(mediumFee) || 0 },
      { key: 'L', fee: Number(largeFee) || 0 },
    ],
    [smallFee, mediumFee, largeFee]
  );

  const availableSizes = sizeDefs.filter((s) => s.fee !== 0);
  const isOneSize = availableSizes.length === 0;

  const [size, setSize] = useState(isOneSize ? 'ONE' : availableSizes[0]?.key || '');
  const [qty, setQty] = useState(1);

  const fee = isOneSize ? 0 : availableSizes.find((s) => s.key === size)?.fee ?? 0;
  const unitPrice = Number(price) + fee;
  const total = (unitPrice * qty).toFixed(2);

  const adjustQty = (d) => setQty((q) => Math.max(1, q + d));

  const handleAdd = () => {
    const newItem = {
      menuId: `${roomId}_${item}`,
      menuName: item,
      size: isOneSize ? 'One-size' : size,
      quantity: qty,
      basePrice: Number(price),
      extraFee: fee,
      menuPrice: unitPrice,
      menuImage,
      room_id: roomId,
      room_name: roomName,
    };

    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    const existingIndex = cart.findIndex(
      (i) =>
        i.menuName === newItem.menuName &&
        i.size === newItem.size &&
        i.room_id === newItem.room_id
    );

    if (existingIndex !== -1) {
      cart[existingIndex].quantity += newItem.quantity;
    } else {
      cart.push(newItem);
    }

    localStorage.setItem('cart', JSON.stringify(cart));

    const newCount = cart.reduce((sum, i) => sum + (i.quantity || 1), 0);
    setCartCount(newCount);

    onAddToCart();
  };

  // 🔒 Lock background scroll when popup is open
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 font-sans">
      <div
        className="
          bg-neutral-950 w-full max-w-4xl max-h-[90vh] rounded-lg shadow-xl relative 
          flex flex-col md:flex-row overflow-auto my-4
        "
      >
        {/* Left Section (Image) */}
        <div className="w-full md:w-1/2 bg-black flex items-center justify-center p-4">
          {menuImage ? (
            <div className="w-full h-[250px] md:h-[420px] flex items-center justify-center">
              <img
                src={menuImage}
                alt={item}
                className="w-full h-full object-cover rounded-lg shadow-lg"
              />
            </div>
          ) : (
            <div className="w-full h-[250px] md:h-[420px] bg-neutral-700 rounded-lg flex items-center justify-center text-xs text-neutral-400">
              No Image
            </div>
          )}
        </div>

        {/* Right Section */}
        <div className="w-full md:w-1/2 p-6 md:p-8 text-neutral-200 relative flex flex-col">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-neutral-400 hover:text-white transition-colors text-2xl"
            aria-label="Close"
          >
            ×
          </button>

          {/* Scrollable content */}
          <div className="flex-grow overflow-y-auto pr-1 md:pr-2 -mr-1 md:-mr-2 max-h-[70vh]">
            <p className="text-xs text-pink-500 font-semibold mb-1 uppercase">{roomName}</p>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">{item}</h1>
            <p className="text-xs italic text-neutral-400 mb-4">{description}</p>

            {/* Conditional Price or Size Options */}
            {isOneSize ? (
              <p className="text-lg md:text-xl font-semibold text-neutral-300 mb-6">₱{price}</p>
            ) : (
              <div className="mb-6">
                <h3 className="text-sm font-semibold mb-2">Choose Size</h3>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map(({ key, fee: sizeFee }) => (
                    <button
                      key={key}
                      onClick={() => setSize(key)}
                      className={`px-3 py-2 rounded-lg font-semibold border-2 transition-colors text-sm md:text-base ${
                        size === key
                          ? 'bg-pink-600 border-pink-600'
                          : 'bg-transparent border-neutral-700 hover:bg-neutral-800'
                      }`}
                    >
                      {key}{' '}
                      <span className="text-xs text-neutral-400">
                        ({sizeFee > 0 ? `+₱${sizeFee}` : 'Included'})
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended Section */}
            {recommendedMenus.length > 0 && (
              <div className="mb-6">
                <h3 className="text-base md:text-lg font-semibold mb-3 text-neutral-200">
                  Recommended
                </h3>
                <ul className="space-y-3">
                  {recommendedMenus.map((rec) => (
                    <li
                      key={rec.menuId || rec.name}
                      className="flex items-center justify-between cursor-pointer hover:bg-neutral-800 rounded-md p-2 transition-colors"
                      onClick={() => onSelectMenu && onSelectMenu(rec)}
                    >
                      <div className="flex items-center">
                        {rec.image ? (
                          <img
                            src={rec.image}
                            alt={rec.name}
                            className="w-12 h-12 md:w-14 md:h-14 rounded-md object-cover mr-3 md:mr-4 shadow-sm"
                          />
                        ) : (
                          <div className="w-12 h-12 md:w-14 md:h-14 bg-neutral-700 rounded-md mr-3 md:mr-4 flex items-center justify-center text-xs text-neutral-400">
                            No Image
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium">{rec.name}</p>
                          {rec.description && (
                            <p className="text-xs text-neutral-400 line-clamp-2">
                              {rec.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Add to Order Footer */}
          <div
            className="
              border-t border-neutral-800 flex items-center justify-between gap-4 pt-4 md:pt-6 
              md:static md:mt-auto 
              fixed bottom-0 left-0 right-0 bg-neutral-950 p-4 md:p-0
            "
          >
            <div className="flex items-center space-x-3">
              <button
                onClick={() => adjustQty(-1)}
                className="bg-neutral-800 p-2 rounded-full hover:bg-neutral-700 transition-colors"
                aria-label="Decrease quantity"
              >
                <FaMinus size={14} className="text-neutral-300" />
              </button>
              <span className="text-lg md:text-xl font-semibold w-6 text-center text-neutral-200">
                {qty}
              </span>
              <button
                onClick={() => adjustQty(1)}
                className="bg-neutral-800 p-2 rounded-full hover:bg-neutral-700 transition-colors"
                aria-label="Increase quantity"
              >
                <FaPlus size={14} className="text-neutral-300" />
              </button>
            </div>
            <button
              onClick={handleAdd}
              className="w-full md:w-auto bg-white hover:bg-gray-400 text-black py-3 px-6 rounded-full font-semibold shadow-lg transition-colors text-base md:text-lg"
            >
              Add {qty} to order ₱{total}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
'use client';

import { useState, useMemo } from 'react';
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
}) {
  const { setCartCount } = useAuth(); // ✅ access cart count updater

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

  const [size, setSize] = useState(isOneSize ? 'ONE' : availableSizes[0].key);
  const [qty, setQty] = useState(1);

  const fee = isOneSize ? 0 : availableSizes.find((s) => s.key === size)?.fee ?? 0;
  const unitPrice = Number(price) + fee;
  const total = (unitPrice * qty).toFixed(2);

  const adjustQty = (d) => setQty((q) => Math.max(1, q + d));

  const handleAdd = () => {
    const newItem = {
      name: item,
      menuName: item,
      size: isOneSize ? 'One-size' : size,
      quantity: qty,
      basePrice: Number(price),
      extraFee: fee,
      menuPrice: unitPrice,
      image: menuImage,
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

    // ✅ Update cart count globally
    const newCount = cart.reduce((sum, i) => sum + (i.quantity || 1), 0);
    setCartCount(newCount);

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-neutral-900 w-96 p-6 rounded-xl border border-neutral-700 text-center relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-2xl hover:text-pink-500"
        >
          ×
        </button>

        {menuImage && (
          <img
            src={menuImage}
            alt={item}
            className="w-40 h-40 rounded-full object-cover mx-auto mb-4 shadow-md"
          />
        )}

        <h2 className="text-2xl font-semibold mb-1">{item}</h2>
        {description && (
          <p className="text-xs italic text-neutral-400 mb-1">{description}</p>
        )}
        <p className="text-xs text-neutral-500 mb-4">{roomName}</p>

        {isOneSize ? (
          <p className="text-sm font-medium text-neutral-300 mb-4">One-size</p>
        ) : (
          <div className="flex justify-center space-x-4 mb-4">
            {availableSizes.map(({ key }) => (
              <button
                key={key}
                onClick={() => setSize(key)}
                className={`w-10 h-10 rounded-full border font-semibold ${
                  size === key
                    ? 'bg-pink-600'
                    : 'bg-neutral-800 hover:bg-pink-500'
                }`}
              >
                {key}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center justify-center space-x-3 mb-4">
          <button
            onClick={() => adjustQty(-1)}
            className="bg-neutral-800 p-2 rounded-lg hover:bg-neutral-700"
          >
            <FaMinus size={16} />
          </button>
          <span className="text-xl font-semibold w-8 text-center">{qty}</span>
          <button
            onClick={() => adjustQty(1)}
            className="bg-neutral-800 p-2 rounded-lg hover:bg-neutral-700"
          >
            <FaPlus size={16} />
          </button>
        </div>

        <p className="text-sm font-semibold text-neutral-400 mb-4">
          Total: <span className="text-neutral-200 font-normal">₱{total}</span>
        </p>

        <button
          onClick={handleAdd}
          className="w-full bg-pink-600 hover:bg-pink-700 py-3 rounded-lg font-semibold shadow-md"
        >
          Add to Cart
        </button>
        <button
          onClick={onClose}
          className="w-full mt-3 bg-neutral-800 hover:bg-neutral-700 py-3 rounded-lg"
        >
          Close
        </button>
      </div>
    </div>
  );
}

'use client';

import { useState, useMemo, useEffect } from 'react';
import { FaPlus, FaMinus, FaXmark } from 'react-icons/fa6';
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

  const autoPickSize = (sizes) => {
    const keys = sizes.map((s) => s.key);
    if (keys.includes('S') && keys.includes('M') && keys.includes('L')) return 'S';
    if (keys.length === 1) return keys[0];
    if (keys.includes('M') && keys.includes('L') && !keys.includes('S')) return 'M';
    return '';
  };

  const [size, setSize] = useState(isOneSize ? 'ONE' : autoPickSize(availableSizes));
  const [qty, setQty] = useState(1);

  const fee = isOneSize ? 0 : availableSizes.find((s) => s.key === size)?.fee ?? 0;
  const unitPrice = Number(price) + fee;
  const total = (unitPrice * qty).toFixed(2);

  const adjustQty = (d) => setQty((q) => Math.max(1, q + d));

  const handleAdd = () => {
    if (!size) return;

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
      (i) => i.menuName === newItem.menuName && i.size === newItem.size && i.room_id === newItem.room_id
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

  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = originalStyle; };
  }, []);

  const handleSelectMenu = (rec) => {
    if (!rec) return;
    const recSizes = [
      { key: 'S', fee: Number(rec.smallFee) || 0 },
      { key: 'M', fee: Number(rec.mediumFee) || 0 },
      { key: 'L', fee: Number(rec.largeFee) || 0 },
    ].filter((s) => s.fee !== 0);
    const isRecOneSize = recSizes.length === 0;
    setSize(isRecOneSize ? 'ONE' : autoPickSize(recSizes));
    setQty(1);
    if (onSelectMenu) onSelectMenu(rec);
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end md:items-center justify-center z-[150] font-sans selection:bg-red-600 selection:text-white p-0 md:p-6"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-5xl border-[6px] border-neutral-950 flex flex-col md:flex-row overflow-hidden max-h-[92vh] md:max-h-[85vh] shadow-[16px_16px_0px_0px_rgba(220,38,38,1)] transform transition-transform"
      >
        {/* ── LEFT: IMAGE ── */}
        <div className="w-full md:w-1/2 bg-neutral-100 flex-shrink-0 relative overflow-hidden border-b-[6px] md:border-b-0 md:border-r-[6px] border-neutral-950">
          {menuImage ? (
            <img
              src={menuImage}
              alt={item}
              className="w-full h-48 md:h-full object-cover"
            />
          ) : (
            <div className="w-full h-48 md:h-full flex items-center justify-center bg-neutral-200">
              <span className="text-[12px] font-black uppercase tracking-[0.4em] text-neutral-400">NO VISUAL</span>
            </div>
          )}
          {/* Stall badge */}
          <div className="absolute top-0 left-0 bg-red-600 text-white px-4 py-2 border-r-[6px] border-b-[6px] border-neutral-950">
            <p className="text-[10px] font-black uppercase tracking-[0.3em]">{roomName}</p>
          </div>
        </div>

        {/* ── RIGHT: DETAILS ── */}
        <div className="flex flex-col flex-1 w-full md:w-1/2 overflow-hidden bg-neutral-50">

          {/* Header */}
          <div className="flex items-start justify-between gap-4 p-6 border-b-[6px] border-neutral-950 bg-white">
            <div className="flex-1 pr-4">
              <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none mb-2">{item}</h1>
              {description && (
                <p className="text-sm text-neutral-500 font-bold leading-snug border-l-4 border-red-600 pl-3">{description}</p>
              )}
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="flex-shrink-0 w-12 h-12 border-4 border-neutral-950 flex items-center justify-center bg-white text-neutral-950 hover:bg-red-600 hover:border-red-600 hover:text-white transition-colors"
            >
              <FaXmark size={24} />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8">

            {/* Price / Size Selection */}
            {isOneSize ? (
              <div className="border-4 border-neutral-950 bg-white p-6 flex justify-between items-center">
                <span className="text-xs font-black uppercase tracking-[0.4em] text-neutral-400">PRICE</span>
                <span className="text-5xl font-black tracking-tighter text-red-600">₱{Number(price).toFixed(2)}</span>
              </div>
            ) : (
              <div>
                <p className="text-[10px] font-black tracking-[0.4em] uppercase text-neutral-400 mb-3 border-b-2 border-neutral-200 pb-2">SIZE SELECTION</p>
                <div className="grid grid-cols-3 gap-3">
                  {availableSizes.map(({ key, fee: sizeFee }) => (
                    <button
                      key={key}
                      onClick={() => setSize(key)}
                      className={`flex flex-col items-center justify-center py-4 border-4 font-black transition-all duration-150 ${
                        size === key
                          ? 'bg-neutral-950 text-white border-neutral-950 shadow-[4px_4px_0px_0px_rgba(220,38,38,1)] translate-y-[-2px]'
                          : 'bg-white text-neutral-950 border-neutral-950 hover:bg-neutral-100 hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                      }`}
                    >
                      <span className="text-2xl leading-none mb-1">{key}</span>
                      <span className="text-[10px] font-black opacity-80 uppercase tracking-widest text-red-400">
                        ₱{(Number(price) + sizeFee).toFixed(2)}
                      </span>
                    </button>
                  ))}
                </div>
                {size && (
                  <div className="mt-4 flex justify-between items-center bg-neutral-950 text-white px-4 py-3 font-black text-sm uppercase tracking-widest">
                    <span>UNIT PRICE</span>
                    <span className="text-red-400">₱{unitPrice.toFixed(2)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Recommended */}
            {recommendedMenus.length > 0 && (
              <div>
                <p className="text-[10px] font-black tracking-[0.4em] uppercase text-neutral-400 mb-4 border-b-2 border-neutral-200 pb-2">SIMILAR ITEMS</p>
                <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
                  {recommendedMenus.map((rec) => (
                    <button
                      key={rec.menuId || rec.name}
                      onClick={() => handleSelectMenu(rec)}
                      className="snap-start flex-shrink-0 flex flex-col items-center border-4 border-neutral-950 bg-white w-28 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(220,38,38,1)] transition-all group"
                    >
                      <div className="w-full aspect-square border-b-4 border-neutral-950 overflow-hidden bg-neutral-100">
                        {rec.image ? (
                          <img src={rec.image} alt={rec.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-neutral-400 font-black uppercase tracking-widest">NO IMG</div>
                        )}
                      </div>
                      <div className="p-2 w-full text-center">
                        <p className="text-[10px] font-black uppercase tracking-tight leading-tight line-clamp-2 text-neutral-950 group-hover:text-red-600">{rec.name}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── FOOTER: QTY + ADD ── */}
          <div className="border-t-[6px] border-neutral-950 bg-white p-4 sm:p-6 flex flex-col sm:flex-row gap-4">
            {/* Quantity stepper */}
            <div className="flex items-center border-4 border-neutral-950 bg-white flex-shrink-0">
              <button
                onClick={() => adjustQty(-1)}
                className="w-12 h-12 flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors text-neutral-950"
                aria-label="Decrease"
              >
                <FaMinus size={16} />
              </button>
              <span className="w-12 h-12 flex items-center justify-center bg-neutral-950 text-white font-black text-xl tabular-nums border-x-4 border-neutral-950">
                {qty}
              </span>
              <button
                onClick={() => adjustQty(1)}
                className="w-12 h-12 flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors text-neutral-950"
                aria-label="Increase"
              >
                <FaPlus size={16} />
              </button>
            </div>

            {/* Add to order */}
            <button
              onClick={handleAdd}
              disabled={!size}
              className={`flex-1 h-12 sm:h-auto font-black uppercase tracking-[0.2em] text-sm sm:text-base border-4 transition-all duration-200 ${
                size
                  ? 'bg-neutral-950 text-white border-neutral-950 hover:bg-red-600 hover:border-red-600 active:translate-y-1'
                  : 'bg-neutral-200 text-neutral-400 border-neutral-300 cursor-not-allowed'
              }`}
            >
              {size ? `ADD TO ORDER — ₱${total}` : 'SELECT SIZE'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { FaTag } from 'react-icons/fa6';
import getSingleSpace from '@/app/actions/getSingleSpace';

const CheckoutPage = () => {
  const [groupedCart, setGroupedCart] = useState({});
  const [roomNames, setRoomNames] = useState({});
  const [voucher, setVoucher] = useState({});
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const loadCheckoutData = async () => {
      const cart = JSON.parse(localStorage.getItem('checkout-cart')) || [];
      const vouchers = JSON.parse(localStorage.getItem('checkout-vouchers')) || {};
      setVoucher(vouchers);

      const roomIds = [...new Set(cart.map(item => item.room_id))];
      const names = {};
      for (const roomId of roomIds) {
        const room = await getSingleSpace(roomId);
        names[roomId] = room?.name || 'Unknown Room';
      }
      setRoomNames(names);

      const grouped = cart.reduce((acc, item) => {
        if (!acc[item.room_id]) acc[item.room_id] = [];
        acc[item.room_id].push(item);
        return acc;
      }, {});
      setGroupedCart(grouped);

      let computedTotal = 0;
      for (const [roomId, items] of Object.entries(grouped)) {
        const subtotal = items.reduce((sum, i) => sum + i.menuPrice * (i.quantity || 1), 0);
        const discount = vouchers[roomId]?.discount
          ? (vouchers[roomId].discount / 100) * subtotal
          : 0;
        computedTotal += subtotal - discount;
      }
      setTotal(computedTotal);
    };

    loadCheckoutData();
  }, []);

  const handleConfirmOrder = () => {
    alert('Order confirmed!');
    localStorage.removeItem('checkout-cart');
    localStorage.removeItem('checkout-vouchers');
    // 👉 you can add navigation or Appwrite logic here
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-28 text-white bg-neutral-900">
      <h2 className="text-3xl font-bold mb-8 text-center text-pink-500">Checkout Summary</h2>

      {Object.entries(groupedCart).map(([roomId, items]) => {
        const subtotal = items.reduce((sum, i) => sum + i.menuPrice * (i.quantity || 1), 0);
        const discount = voucher[roomId]?.discount
          ? (voucher[roomId].discount / 100) * subtotal
          : 0;
        const discountedTotal = subtotal - discount;

        return (
          <div key={roomId} className="mb-10 border-b border-neutral-700 pb-6">
            <h3 className="text-xl font-semibold mb-2">
              {roomNames[roomId] || 'Unknown Stall'}
            </h3>
            <ul className="text-sm mb-2">
              {items.map((item, i) => (
                <li key={i} className="flex justify-between py-1">
                  <span>{item.menuName} x{item.quantity || 1}</span>
                  <span>₱{(item.menuPrice * item.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <p className="text-pink-400 text-sm">Subtotal: ₱{subtotal.toFixed(2)}</p>
            {voucher[roomId] && (
              <p className="text-green-400 text-sm">
                <FaTag className="inline mr-1" />
                {voucher[roomId].discount}% off with "{voucher[roomId].title}"
              </p>
            )}
            <p className="text-white font-semibold mt-1">
              Total after discount: ₱{discountedTotal.toFixed(2)}
            </p>
          </div>
        );
      })}

      <div className="text-center mt-12">
        <h3 className="text-xl font-bold mb-4">Grand Total: ₱{total.toFixed(2)}</h3>
        <button
          onClick={handleConfirmOrder}
          className="px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-lg transition"
        >
          Confirm Order
        </button>
      </div>
    </div>
  );
};

export default CheckoutPage;

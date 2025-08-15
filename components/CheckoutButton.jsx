'use client';

import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { FaPhone } from 'react-icons/fa';

const CheckoutButton = ({
  cart,
  total,
  selectedItems,
  groupedCart = {},
  activeVouchersPerRoom = {},
  roomNames = {},
  onCheckoutSuccess,
  promos = [],
}) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [phoneDigits, setPhoneDigits] = useState(''); // store only the 10 digits after +63
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const isValidPhone = (digits) => /^\d{10}$/.test(digits);

  const handleCheckout = () => {
    if (!isValidPhone(phoneDigits)) {
      setMessage('Invalid phone number. Must be 10 digits after +63.');
      return;
    }
    setMessage('');
    setIsPopupOpen(true);
  };

  const handleConfirmPayment = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user')) || {};
      const voucherMap = Object.fromEntries(
        Object.entries(activeVouchersPerRoom).map(([roomId, voucher]) => [
          roomId,
          {
            title: voucher?.title,
            discount: voucher?.discount,
            roomName: roomNames[roomId] || 'Unknown Room',
          },
        ])
      );

      const response = await fetch('/api/xendit/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          user,
          totalAmount: total,
          voucherMap,
        }),
      });

      const result = await response.json();

      if (result.success) {
        await fetch('/api/twilio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: `+63${phoneDigits}`,
            name: user.name || 'Customer',
          }),
        });

        localStorage.removeItem('cart');
        onCheckoutSuccess?.();

        setTimeout(() => {
          window.location.href = result.redirect_url;
        }, 1000);
      } else {
        setMessage(result.message || 'Checkout failed.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setMessage('An error occurred. Please try again.');
    } finally {
      setLoading(false);
      setIsPopupOpen(false);
      setTimeout(() => setMessage(''), 4000);
    }
  };

  const getRoomSubtotal = (roomId) => {
    const items = groupedCart[roomId]?.items || [];
    return items
      .filter((item) => selectedItems[`${roomId}-${item.menuName}-${item.size || 'One-size'}`])
      .reduce((sum, item) => sum + Number(item.menuPrice) * (item.quantity || 1), 0);
  };

  const getDiscountedSubtotal = (roomId, subtotal) => {
    const voucher = activeVouchersPerRoom[roomId];
    const discount = voucher?.discount || 0;
    return subtotal - (discount / 100) * subtotal;
  };

  return (
    <div className="bg-neutral-900 text-white px-6 py-12 rounded-xl shadow-md max-w-2xl mx-auto mt-12 w-full">
      <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6 shadow-inner space-y-6">
        {/* PHONE INPUT */}
        <div>
          <label className="block text-sm font-semibold mb-2">Phone Number</label>
          <div className="flex items-center border border-neutral-600 rounded-lg overflow-hidden bg-neutral-900">
            <span className="flex items-center gap-2 px-3 text-gray-400 border-r border-neutral-700">
              <FaPhone className="text-pink-500" />
              +63
            </span>
            <input
              type="tel"
              inputMode="numeric"
              pattern="\d*"
              placeholder="9123456789"
              value={phoneDigits}
              onChange={(e) => {
                const cleaned = e.target.value.replace(/\D/g, '').slice(0, 10);
                setPhoneDigits(cleaned);
              }}
              className="flex-1 bg-neutral-900 text-white py-3 px-4 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
        </div>

        {message && <p className="text-sm text-red-400">{message}</p>}

        <button
          onClick={handleCheckout}
          disabled={loading || !isValidPhone(phoneDigits)}
          className={`w-full py-3 rounded-xl font-bold tracking-widest text-lg transition-all ${
            loading || !isValidPhone(phoneDigits)
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-pink-600 text-white hover:bg-pink-700'
          }`}
        >
          {loading ? 'Processing...' : 'Checkout Order'}
        </button>
      </div>

      {/* POPUP */}
      <Dialog open={isPopupOpen} onClose={() => setIsPopupOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-4xl bg-neutral-950 border border-neutral-800 rounded-2xl p-8 text-white shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="text-center mb-6">
              <h2 className="text-base text-pink-500 tracking-widest uppercase font-semibold">Summary</h2>
              <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-white">Your Order</p>
            </div>

            <div className="space-y-8">
              {Object.entries(groupedCart).map(([roomId, { roomName, items }]) => {
                const filteredItems = items.filter(
                  (item) => selectedItems[`${roomId}-${item.menuName}-${item.size || 'One-size'}`]
                );
                if (filteredItems.length === 0) return null;

                const subtotal = getRoomSubtotal(roomId);
                const discountedSubtotal = getDiscountedSubtotal(roomId, subtotal);
                const voucher = activeVouchersPerRoom[roomId];

                return (
                  <div key={roomId} className="border-b border-neutral-700 pb-4">
                    <h3 className="text-lg font-bold text-white mb-2">
                      {roomNames[roomId] || roomName}
                    </h3>

                    <ul className="text-sm space-y-2">
                      {filteredItems.map((item, idx) => (
                        <li key={`${item.menuName}-${item.size}-${idx}`} className="flex justify-between">
                          <span>
                            {item.menuName} {item.size && `(${item.size})`} × {item.quantity || 1}
                          </span>
                          <span>₱{(item.menuPrice * (item.quantity || 1)).toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-3 text-sm space-y-1">
                      <p className="text-gray-400">Subtotal: ₱{subtotal.toFixed(2)}</p>
                      {voucher && (
                        <p className="text-green-400">
                          Discount ({voucher.discount}%): −₱{(subtotal - discountedSubtotal).toFixed(2)} ({voucher.title})
                        </p>
                      )}
                      <p className="font-semibold text-pink-400">
                        Stall Total: ₱{discountedSubtotal.toFixed(2)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-center mt-8 text-2xl font-bold">
              Total: <span className="text-pink-500">₱{total.toFixed(2)}</span>
            </div>

            <div className="text-center mt-8 text-sm text-gray-400">
              <p>Applied Promos:</p>
              <ul className="space-y-2">
                {promos.map((promo, idx) => (
                  <li key={idx} className="flex justify-between">
                    <span>{promo.roomName}: {promo.name}</span>
                    <span>{promo.discount}% off</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-center gap-4 mt-8">
              <button
                onClick={() => setIsPopupOpen(false)}
                className="px-6 py-3 rounded-xl border border-gray-600 text-gray-300 hover:text-white hover:border-white transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPayment}
                disabled={loading}
                className={`px-6 py-3 rounded-xl font-semibold text-lg tracking-wide transition ${
                  loading
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-pink-600 text-white hover:bg-pink-700'
                }`}
              >
                {loading ? 'Processing...' : 'Confirm & Pay'}
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

export default CheckoutButton;

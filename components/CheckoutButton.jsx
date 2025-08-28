'use client';

import { useEffect, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { FaPhone } from 'react-icons/fa';
import checkAuth from '@/app/actions/checkAuth';

// Format PHP currency
const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  }).format(amount);

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
  const [phone, setPhone] = useState('');
  const [user, setUser] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // ✅ load user from checkAuth
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const authResult = await checkAuth();
        if (authResult.isAuthenticated) {
          setUser(authResult.user);
          if (authResult.user?.phone) {
            setPhone(authResult.user.phone);
          }
        }
      } catch (err) {
        console.error('Error fetching user:', err);
      }
    };
    fetchUser();
  }, []);

  const handleCheckout = () => {
    if (!phone) {
      setMessage('No phone number found in your account.');
      return;
    }
    setMessage('');
    setIsPopupOpen(true);
  };

  const handleConfirmPayment = async () => {
    setLoading(true);
    try {
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
    <div className="bg-neutral-900 text-white px-6 py-12 max-w-2xl mx-auto mt-12 w-full">
      <div className="text-center mb-8">
        {message && <p className="text-sm text-red-400">{message}</p>}

        <button
          onClick={handleCheckout}
          disabled={loading || !phone}
          className={`w-full py-3 rounded-xl font-bold tracking-widest text-lg transition-all ${
            loading || !phone
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

            {/* PHONE DISPLAY */}
            <div className="flex items-center justify-center gap-3 bg-neutral-800 border border-neutral-700 rounded-xl px-5 py-3 mb-8">
              <div className="p-2 bg-pink-600 rounded-full shadow-md">
                <FaPhone className="text-white w-4 h-4" />
              </div>
              <span className="font-medium text-lg">
                {phone || 'No phone on file'}
              </span>
            </div>

            {/* ITEMS PER ROOM */}
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
                          <span>{formatCurrency(item.menuPrice * (item.quantity || 1))}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-3 text-sm space-y-1 text-right">
                      <p className="text-gray-400">
                        <span className="font-normal text-left float-left">Subtotal:</span>
                        {formatCurrency(subtotal)}
                      </p>
                      {voucher && (
                        <p className="text-green-400">
                          <span className="font-normal text-left float-left">
                            Discount ({voucher.discount}%):
                          </span>
                          −{formatCurrency(subtotal - discountedSubtotal)} ({voucher.title})
                        </p>
                      )}
                      <p className="font-semibold text-pink-400">
                        <span className="font-normal text-left float-left">Stall Total:</span>
                        {formatCurrency(discountedSubtotal)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-center mt-8 text-2xl font-bold">
              Total: <span className="text-pink-500">{formatCurrency(total)}</span>
            </div>

            <hr className="my-8 border-neutral-700" />

            <div className="mt-8">
              <p className="text-xl font-bold text-white mb-4">Applied Promos</p>
              <ul className="space-y-3 text-sm">
                {promos.map((promo, idx) => (
                  <li key={idx} className="flex justify-between items-center text-neutral-300">
                    <span className="font-medium">{promo.roomName}: {promo.name}</span>
                    <span className="text-pink-400 font-semibold">{promo.discount}% off</span>
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

'use client';

import { useEffect, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { FaPhone, FaExclamationTriangle } from 'react-icons/fa'; 
import { FaUtensils, FaBagShopping } from 'react-icons/fa6';

import checkAuth from '@/app/actions/checkAuth';

// Format PHP currency
const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  }).format(amount);

const CheckoutButton = ({
  cart, // This now contains the 'dineTakeOut' property per item
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

  // ✅ check if at least one item is selected
  const hasSelectedItems = Object.values(selectedItems || {}).some((isSelected) => isSelected);

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
      // Prepare voucher map for the API
      const voucherMap = Object.fromEntries(
        Object.entries(activeVouchersPerRoom).map(([roomId, voucher]) => [
          roomId,
          {
            // Note: combinedVoucherMap from OrderCartPage handles the title/discount logic
            title: voucher?.title,
            discount: voucher?.discount,
            isSpecial: voucher?.isSpecial, // Include this flag for backend verification
            roomName: roomNames[roomId] || 'Unknown Room',
          },
        ])
      );
      
      // Since discount is already calculated per item, the specialDiscount object 
      // primarily serves as a flag for the backend if a PWD/Senior card was used.
      // We check if any special discount promo was active across any room.
      const isAnySpecialDiscountActive = Object.values(voucherMap).some(v => v.isSpecial);

      const response = await fetch('/api/xendit/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart, // This now includes discountAmount and dineTakeOut per item
          user,
          totalAmount: total,
          voucherMap,
          specialDiscount: {
            active: isAnySpecialDiscountActive,
            title: 'PWD/Senior Discount',
            // No need to pass percent, as item discounts are calculated
          },
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

  // --- LOGIC FOR POPUP SUMMARY ---
  const getRoomSummary = (roomId) => {
    // Filter the enriched `cart` (passed as prop) for items belonging to this room
    const roomItems = cart.filter(item => item.room_id === roomId);
    
    let subtotalBeforeDiscount = 0;
    let totalDiscount = 0;
    
    roomItems.forEach(item => {
      // Calculate item price before any discount
      const itemPrice = Number(item.menuPrice) * (item.quantity || 1);
      
      subtotalBeforeDiscount += itemPrice;
      totalDiscount += item.discountAmount || 0;
    });

    const discountedSubtotal = subtotalBeforeDiscount - totalDiscount;
    const roomPromo = activeVouchersPerRoom[roomId];
    
    // ⭐ NEW: Extract the dineTakeOut status. Since it's per room, all items in roomItems will have the same value.
    const dineTakeOut = roomItems[0]?.dineTakeOut || 'Dine In';

    return { 
      items: roomItems, 
      subtotal: subtotalBeforeDiscount, 
      discountedSubtotal, 
      totalDiscount,
      promo: roomPromo,
      // ⭐ NEW: Include order type in the summary
      dineTakeOut: dineTakeOut, 
    };
  };

  // Group the enriched cart by room ID for the popup summary
  const groupedCheckoutCart = cart.reduce((acc, item) => {
    if (!acc[item.room_id]) {
        acc[item.room_id] = [];
    }
    acc[item.room_id].push(item);
    return acc;
  }, {});
  // --- END LOGIC ---

  // --- LOGIC FOR PROMOS DISPLAY ---
  const getGroupedPromos = () => {
    const grouped = {};
    const itemDiscountCount = {};

    // 1. Count items with discount for each room
    cart.forEach(item => {
      const roomId = item.room_id;
      if (!itemDiscountCount[roomId]) {
        itemDiscountCount[roomId] = 0;
      }
      if ((item.discountAmount || 0) > 0) {
        itemDiscountCount[roomId] += 1;
      }
    });

    // 2. Group the 'promos' array by room name
    promos.forEach(promo => {
      const roomName = promo.roomName || 'Unknown Stall';
      const roomId = Object.keys(roomNames).find(id => roomNames[id] === roomName);
      
      if (!grouped[roomName]) {
        grouped[roomName] = {
          details: [],
          itemCount: itemDiscountCount[roomId] || 0, // Get the count of discounted items in the room
        };
      }
      
      // Combine discount details into a single descriptive string
      let detailString = `${promo.discount}% off (${promo.name})`;
      if (promo.isSpecial) {
        detailString = `${promo.discount}% off (PWD/Senior Discount)`;
      }

      grouped[roomName].details.push(detailString);
    });

    return grouped;
  };

  const groupedPromos = getGroupedPromos();
  // --- END LOGIC FOR PROMOS DISPLAY ---


  return (
    <div className="bg-white w-full max-w-7xl mx-auto py-12">
      <div className="mb-8">
        {message && <p className="mb-4 text-sm font-black text-red-600 uppercase tracking-widest">{message}</p>}

        <button
          onClick={handleCheckout}
          disabled={loading || !phone || !hasSelectedItems}
          className={`w-full py-5 font-black uppercase tracking-[0.3em] text-sm border-4 transition-all duration-200 ${
            loading || !phone || !hasSelectedItems
              ? 'bg-neutral-200 text-neutral-400 border-neutral-300 cursor-not-allowed'
              : 'bg-neutral-950 text-white border-neutral-950 hover:bg-red-600 hover:border-red-600 active:scale-95'
          }`}
        >
          {loading ? 'PROCESSING...' : 'CHECKOUT ORDER →'}
        </button>
      </div>

      <Dialog open={isPopupOpen} onClose={() => setIsPopupOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-4xl bg-white border-4 border-black p-10 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-y-auto max-h-[90vh]">
            <h2 className="text-5xl font-black uppercase mb-10 border-b-4 border-black pb-4 tracking-tighter">ORDER SUMMARY</h2>

            <div className="bg-black text-white p-4 mb-8 font-mono font-bold text-lg">
              CONTACT: {phone || 'N/A'}
            </div>

            <div className="space-y-10">
              {Object.entries(groupedCheckoutCart).map(([roomId, items]) => {
                const { subtotal, discountedSubtotal, totalDiscount, promo, dineTakeOut } = getRoomSummary(roomId);
                const Icon = dineTakeOut === 'Dine In' ? FaUtensils : FaBagShopping;

                return (
                  <div key={roomId} className="border-b-2 border-dashed border-gray-400 pb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-2xl font-black uppercase">{roomNames[roomId] || 'Unknown Room'}</h3>
                        <span className="flex items-center font-bold uppercase border-2 border-black px-3 py-1">
                            <Icon className="mr-2" />
                            {dineTakeOut}
                        </span>
                    </div>

                    <ul className="font-mono space-y-2 mb-4">
                      {items.map((item, idx) => (
                        <li key={`${item.menuName}-${idx}`} className="flex justify-between border-b border-gray-100 pb-1">
                          <span>{item.quantity}x {item.menuName}</span>
                          <span className="font-bold">{formatCurrency(Number(item.menuPrice) * item.quantity)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>

            <hr className="my-8 border-gray-200" />

            {/* REVISED APPLIED PROMOS SECTION */}
            {(Object.keys(groupedPromos).length > 0) && (
              <div className="mt-8 text-sm text-left mx-auto max-w-full text-gray-600">
                <p className="text-xl font-bold text-black mb-4">Applied Promos</p>
                <ul className="space-y-4">
                  {Object.entries(groupedPromos).map(([roomName, { details, itemCount }], idx) => (
                    <li key={idx}>
                      <p className="font-bold text-black border-b border-gray-200 pb-1">{roomName}</p>
                      <ul className="ml-2 mt-2 space-y-1">
                        {details.map((detail, detailIdx) => (
                          <li key={detailIdx} className="text-sm">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-fuchsia-500 font-semibold">
                              &bull; {itemCount} Item{itemCount !== 1 ? 's' : ''} applied with 
                            </span> 
                            <span className="italic ml-1 text-gray-600">{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {/* END REVISED APPLIED PROMOS SECTION */}

            {/* --- NEW NON-REFUNDABLE WARNING --- */}
            <div className="mt-8 flex items-start gap-3 text-red-500 bg-red-50 border border-red-200 p-4 rounded-lg shadow-md">
              <FaExclamationTriangle className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
              <p className="text-sm leading-relaxed">
                <span className="font-semibold">Important:</span> Your confirmation signifies
                acceptance of the order as displayed. <br />
                <span className="italic text-red-300">
                All completed transactions are considered final and cannot be refunded.
                </span>
              </p>
            </div>
            
            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setIsPopupOpen(false)}
                className="flex-1 py-4 border-4 border-neutral-950 font-black text-xs uppercase tracking-[0.3em] hover:bg-neutral-950 hover:text-white transition-all duration-200"
              >
                CANCEL
              </button>
              <button
                onClick={handleConfirmPayment}
                disabled={loading}
                className={`flex-1 py-4 border-4 font-black text-xs uppercase tracking-[0.3em] transition-all duration-200 ${
                  loading
                    ? 'bg-neutral-200 text-neutral-400 border-neutral-300 cursor-not-allowed'
                    : 'bg-neutral-950 text-white border-neutral-950 hover:bg-red-600 hover:border-red-600'
                }`}
              >
                {loading ? 'PROCESSING...' : 'CONFIRM & PAY →'}
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

export default CheckoutButton;
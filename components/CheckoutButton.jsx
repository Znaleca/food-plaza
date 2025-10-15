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
    <div className="bg-neutral-950 text-white w-full max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        {message && <p className="text-sm text-red-400">{message}</p>}

        <button
          onClick={handleCheckout}
          disabled={loading || !phone || !hasSelectedItems}
          className={`w-full py-3 rounded-xl font-bold tracking-widest text-lg transition-all ${
            loading || !phone || !hasSelectedItems
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-cyan-400 to-fuchsia-500 hover:from-cyan-500 hover:to-fuchsia-600 text-white'
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
            <h2 className="text-base sm:text-lg font-light tracking-[0.3em] bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-fuchsia-500">
            Summary
              </h2>
              <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-white">Your Order</p>
            </div>

            {/* PHONE DISPLAY */}
            <div className="flex items-center justify-center gap-3 bg-neutral-800 border border-neutral-700 rounded-xl px-5 py-3 mb-8">
              <div className="p-2 bg-gradient-to-r from-cyan-400 to-fuchsia-500 rounded-full shadow-md">
                <FaPhone className="text-white w-4 h-4" />
              </div>
              <span className="font-medium text-lg text-white">
                {phone || 'No phone on file'}
              </span>
            </div>

            {/* ITEMS PER ROOM */}
            <div className="space-y-8">
              {Object.entries(groupedCheckoutCart).map(([roomId, items]) => {
                const { subtotal, discountedSubtotal, totalDiscount, promo, dineTakeOut } = getRoomSummary(roomId); // ⭐ dineTakeOut is extracted here
                
                // Determine the discount label based on the active promo for the room
                let discountLabel = '';
                if (promo?.isSpecial) {
                    discountLabel = `(${promo.discount}% - PWD / Senior Discount)`;
                } else if (promo) {
                    discountLabel = `(${promo.discount}% - ${promo.title})`;
                } else if (totalDiscount > 0) {
                    // This handles scenarios where only some items in a room got a special discount
                    discountLabel = '(Item Discounts Applied)';
                }
                
                // ⭐ Helper for icon
                const Icon = dineTakeOut === 'Dine In' ? FaUtensils : FaBagShopping;
                const iconColor = dineTakeOut === 'Dine In' ? 'text-cyan-400' : 'text-fuchsia-400';

                return (
                  <div key={roomId} className="border-b border-neutral-700 pb-4">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold text-white">
                        {roomNames[roomId] || groupedCart[roomId]?.roomName || 'Unknown Room'}
                        </h3>
                        {/* ⭐ NEW: Display Dine/Take Out Status */}
                        <span className={`flex items-center text-sm font-semibold ${iconColor}`}>
                            <Icon className="mr-1 w-4 h-4" />
                            {dineTakeOut}
                        </span>
                        {/* ⭐ END NEW DISPLAY */}
                    </div>

                    <ul className="text-sm space-y-2">
                      {items.map((item, idx) => (
                        <li key={`${item.menuName}-${item.size}-${idx}`} className="flex justify-between">
                          <span>
                            {item.menuName} {item.size && `(${item.size})`} × {item.quantity || 1}
                          </span>
                          <span className="flex flex-col items-end">
                            {item.discountAmount > 0 ? (
                                <>
                                    <span className="line-through text-xs text-neutral-400">
                                        {formatCurrency(Number(item.menuPrice) * (item.quantity || 1))}
                                    </span>
                                    <span className="font-semibold">
                                        {formatCurrency(Number(item.menuPrice) * (item.quantity || 1) - item.discountAmount)}
                                    </span>
                                </>
                            ) : (
                                <span>{formatCurrency(Number(item.menuPrice) * (item.quantity || 1))}</span>
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-3 text-sm space-y-1 text-right">
                      <p className="text-gray-400">
                        <span className="font-normal text-left float-left">Subtotal:</span>
                        {formatCurrency(subtotal)}
                      </p>
                      {totalDiscount > 0 && (
                        <p className="text-green-400">
                          <span className="font-normal text-left float-left">
                            Discount {discountLabel}:
                          </span>
                          −{formatCurrency(totalDiscount)}
                        </p>
                      )}
                      <p className="font-semibold text-cyan-400">
                        <span className="font-normal text-left float-left">Stall Total:</span>
                        {formatCurrency(discountedSubtotal)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-center mt-8 text-2xl font-bold">
              Total:{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-fuchsia-500">
                {formatCurrency(total)}
              </span>
            </div>

            <hr className="my-8 border-neutral-700" />

            {/* REVISED APPLIED PROMOS SECTION */}
            {(Object.keys(groupedPromos).length > 0) && (
              <div className="mt-8 text-sm text-left mx-auto max-w-full text-neutral-300">
                <p className="text-xl font-bold text-white mb-4">Applied Promos</p>
                <ul className="space-y-4">
                  {Object.entries(groupedPromos).map(([roomName, { details, itemCount }], idx) => (
                    <li key={idx}>
                      <p className="font-bold text-white border-b border-neutral-700 pb-1">{roomName}</p>
                      <ul className="ml-2 mt-2 space-y-1">
                        {details.map((detail, detailIdx) => (
                          <li key={detailIdx} className="text-sm">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-fuchsia-500 font-semibold">
                              &bull; {itemCount} Item{itemCount !== 1 ? 's' : ''} applied with 
                            </span> 
                            <span className="italic ml-1 text-neutral-300">{detail}</span>
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
            <div className="mt-8 flex items-start gap-3 text-red-400 bg-neutral-900 border border-red-500/50 p-4 rounded-lg shadow-md">
              <FaExclamationTriangle className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
              <p className="text-sm leading-relaxed">
                <span className="font-semibold">Important:</span> Your confirmation signifies
                acceptance of the order as displayed. <br />
                <span className="italic text-red-300">
                All completed transactions are considered final and cannot be refunded.
                </span>
              </p>
            </div>
            
            <div className="flex justify-center gap-4 mt-8">
              <button
                onClick={() => setIsPopupOpen(false)}
                className="px-6 py-3 rounded-xl border border-gray-600 text-gray-300 hover:text-white hover:border-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPayment}
                disabled={loading}
                className={`px-6 py-3 rounded-xl font-semibold text-lg tracking-wide transition-all ${
                  loading
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-cyan-400 to-fuchsia-500 hover:from-cyan-500 hover:to-fuchsia-600 text-white'
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
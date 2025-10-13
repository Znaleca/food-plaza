'use client';

// Component for rendering a read-only order receipt.
// ADDED: serviceTypeGroups prop
const OrderReceipt = ({ order, serviceTypeGroups }) => {

  // --- START: Extract Totals from Order Object ---
  const baseTotal = (order.total && typeof order.total[0] === 'number' ? order.total[0] : 0) || 0;
  const discountAmount = Math.abs((order.total && typeof order.total[1] === 'number' ? order.total[1] : 0) || 0); 
  const finalTotal = (order.total && typeof order.total[2] === 'number' ? order.total[2] : 0) || 0;
  // --- END: Extract Totals from Order Object ---

  const parseItemsGroupedByRoom = () => {
    const grouped = {};
    (order.items || []).forEach((itemStr, index) => {
      try {
        const item = JSON.parse(itemStr);
        const roomId = item.room_id || 'unknown';
        const roomName = item.room_name || 'Unknown Stall';

        if (!grouped[roomId]) {
          grouped[roomId] = {
            roomName,
            items: [],
          };
        }

        // Add the index and original item data for correct item total calculation
        grouped[roomId].items.push({ 
          ...item, 
          index,
          itemTotal: (Number(item.menuPrice) * (item.quantity || 1)) - (Number(item.discountAmount) || 0) // Item final total
        });
      } catch {
        // skip broken item
      }
    });
    return grouped;
  };

  const getRoomSubtotal = (items) =>
    items.reduce((sum, item) => sum + Number(item.menuPrice) * (item.quantity || 1), 0);

  const getRoomDiscount = (items) =>
    items.reduce((sum, item) => sum + Number(item.discountAmount || 0), 0);

  const getRoomFinalTotal = (items) =>
    items.reduce((sum, item) => sum + item.itemTotal, 0);

  const groupedItems = parseItemsGroupedByRoom();

  /**
   * Helper function to count discounted items for a specific room.
   */
  const getDiscountedItemCount = (roomName) => {
    const roomEntry = Object.values(groupedItems).find(group => group.roomName === roomName);
    if (!roomEntry) return 0;

    // Count how many individual item entries have a non-zero discountAmount
    const count = roomEntry.items.filter(item => (Number(item.discountAmount) || 0) > 0).length;
    return count;
  };

  /**
   * Parses promo strings to display them clearly on the receipt.
   */
  const parsePromos = () => {
    const roomPromos = {};
    (order.promos || []).forEach(promoStr => {
      // Assuming promo strings are like: 'Room Name - Discount Details (Promo Title)'
      const parts = promoStr.split(' - ');
      if (parts.length >= 2) {
        const roomName = parts[0].trim();
        const details = parts.slice(1).join(' - ').trim(); // Full descriptive part

        if (!roomPromos[roomName]) {
          roomPromos[roomName] = [];
        }

        // Store the details part (e.g., "20% off (Launch Discount)")
        roomPromos[roomName].push(details);
      }
    });
    return roomPromos;
  };

  const roomPromos = parsePromos();
  
  // --- NEW: Helper for Service Type Tag in Receipt ---
  const renderReceiptServiceTypeTag = (serviceType) => {
    if (!serviceType) return null;

    // Mapping service types to receipt-appropriate styles
    const serviceMap = {
      'Dine In': { color: 'text-blue-700', bg: 'bg-blue-100', border: 'border-blue-300' },
      'Take Out': { color: 'text-purple-700', bg: 'bg-purple-100', border: 'border-purple-300' },
    };

    const s = serviceMap[serviceType];

    if (!s) return null;

    return (
      <span className={`inline-flex items-center ml-2 px-2 py-0.5 text-xs font-semibold rounded ${s.color} ${s.bg} border ${s.border}`}>
        {serviceType}
      </span>
    );
  };
  // ----------------------------------------------------
  
  return (
    <div> 
      {/* FIX: Reduced padding from p-6 to pt-1 pb-6 px-6 to leave room for the absolute close button */}
      <div className="bg-white text-black max-w-xl mx-auto rounded-lg shadow-lg pt-1 pb-6 px-6 font-mono border border-pink-600">
        
        <div className="text-center border-b border-dashed border-gray-400 pt-4 pb-4 mb-4">
          <h2 className="text-xl font-bold text-pink-600">ORDER RECEIPT</h2>
          <p className="text-sm">Order ID: **#{order.$id.slice(-8)}**</p>
          <p className="text-xs text-gray-500 mt-1">{new Date(order.created_at).toLocaleString()}</p>
        </div>

        <div className="text-sm mb-4">
          <p className="mb-1">Customer: <strong>{order.name || 'Unknown'}</strong></p>
          <p className="mb-1">Email: {order.email}</p>
          <p className="mb-1">Table: **{order.tableNumber?.[0] || 'N/A'}**</p>
        </div>

        <div className="mb-4 border-t border-b border-gray-300 py-4 space-y-6">
          {Object.entries(groupedItems).map(([roomId, { roomName, items }]) => {
            const subtotal = getRoomSubtotal(items); 
            const roomDiscount = getRoomDiscount(items); 
            const roomFinalTotal = getRoomFinalTotal(items); 
            // NEW: Get the display service type for the current stall
            const displayServiceType = serviceTypeGroups?.[roomId]?.displayServiceType || null;


            return (
              <div key={roomId} className="border-b border-gray-200 pb-4">
                <h3 className="text-base font-bold text-pink-500 mb-2 flex items-center">
                    {roomName}
                    {/* NEW: Render Service Type Tag */}
                    {renderReceiptServiceTypeTag(displayServiceType)}
                </h3>
                <ul className="space-y-1 text-sm">
                  {items.map((item) => {
                    const itemPrice = Number(item.menuPrice);
                    const itemQuantity = item.quantity;
                    const itemBasePrice = itemPrice * itemQuantity;
                    const itemDiscount = Number(item.discountAmount) || 0;

                    return (
                      <li key={item.index} className="pb-1">
                        <div className="flex justify-between">
                          <span>{item.menuName} {item.size && `(${item.size})`} × {itemQuantity}</span>
                          <span>₱{itemBasePrice.toFixed(2)}</span>
                        </div>
                        {itemDiscount > 0 && (
                          <div className="flex justify-between text-xs text-red-500 italic">
                            <span>Item Discount:</span>
                            <span>-₱{itemDiscount.toFixed(2)}</span>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>

                <div className="mt-2 text-sm pt-2 border-t border-dashed border-gray-300">
                  <div className="flex justify-between">
                      <p>Base Subtotal:</p>
                      <p>₱{subtotal.toFixed(2)}</p>
                  </div>
                  {roomDiscount > 0 && (
                      <div className="flex justify-between text-red-500">
                          <p>Total Item Discount:</p>
                          <p>-₱{roomDiscount.toFixed(2)}</p>
                      </div>
                  )}
                  <div className="flex justify-between font-semibold text-pink-500 pt-1 border-t border-gray-300 mt-1">
                      <p>Stall Final Total:</p>
                      <p>₱{roomFinalTotal.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-6">
          <div className="flex justify-between items-center text-sm border-t border-gray-400 pt-4">
            <p className="text-gray-500">Subtotal (before promos):</p>
            <p className="font-bold text-gray-800">₱{baseTotal.toFixed(2)}</p>
          </div>

          {/* Displaying the total discount amount */}
          {discountAmount > 0 && (
            <div className="flex justify-between items-center mt-2">
              <p className="text-gray-500">Total Promo Discount:</p>
              <p className="font-bold text-red-500">-₱{discountAmount.toFixed(2)}</p>
            </div>
          )}

          {(Object.keys(roomPromos).length > 0) && (
            <div className="mt-4 text-sm text-left mx-auto text-gray-700">
              <p className="font-semibold text-center text-pink-500 mb-2">Applied Promotions:</p>
              <ul className="space-y-3">
                {Object.entries(roomPromos).map(([roomName, promoDetails], idx) => {
                  const discountedItemCount = getDiscountedItemCount(roomName);

                  return (
                    <li key={idx} className="p-2 border border-dashed border-pink-200 rounded-md bg-pink-50">
                      <p className="font-bold text-black border-b border-gray-300 pb-1">{roomName}</p>
                      <ul className="ml-2 mt-1 space-y-0.5">
                        {promoDetails.map((detail, detailIdx) => (
                          <li key={detailIdx} className="text-pink-600 italic text-xs">
                            &bull; **{discountedItemCount} Item{discountedItemCount !== 1 ? 's' : ''}** applied with {detail}
                          </li>
                        ))}
                      </ul>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <div className="mt-6 border-t border-gray-400 pt-4 flex justify-between items-center">
            <p className="text-lg font-bold text-gray-500">FINAL TOTAL:</p>
            <p className="text-2xl font-extrabold text-pink-600">₱{finalTotal.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderReceipt;
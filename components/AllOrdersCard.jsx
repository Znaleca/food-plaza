'use client';

const ORDER_STATUS = {
  PENDING: 'pending',
  PREPARING: 'preparing',
  READY: 'ready',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

const AllOrdersCard = ({ order }) => {
  const renderStatusBadge = (status) => {
    const normalized = String(status || '').toLowerCase();
    const badgeMap = {
      [ORDER_STATUS.PENDING]: 'bg-blue-100 text-blue-700',
      [ORDER_STATUS.PREPARING]: 'bg-yellow-100 text-yellow-700',
      [ORDER_STATUS.READY]: 'bg-purple-100 text-purple-700',
      [ORDER_STATUS.COMPLETED]: 'bg-green-100 text-green-700',
      [ORDER_STATUS.CANCELLED]: 'bg-red-100 text-red-700',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${badgeMap[normalized] || 'bg-gray-100 text-gray-700'}`}>
        {normalized}
      </span>
    );
  };

  const totalAmount = Array.isArray(order.total)
    ? order.total[3] || order.total.at(-1) || 0
    : +order.total || 0;

  const tableNumbers = Array.isArray(order.tableNumber)
    ? order.tableNumber.join(', ')
    : order.tableNumber || 'N/A';

  return (
    <div className="border rounded-xl p-6 bg-white shadow-lg transition hover:shadow-xl space-y-6">
      {/* Order Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Order #{order.$id}</h2>
        <p className="text-sm text-gray-500">User: {order.name || 'Unknown'} ({order.email || 'N/A'})</p>
        <p className="text-sm text-gray-400 mt-1">Created: {new Date(order.created_at).toLocaleString()}</p>
        <p className="text-sm text-gray-500 mt-2">Table(s): {tableNumbers}</p>
      </div>

      {/* Item List */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {order.items.map((itemString, index) => {
          let item;
          try {
            item = JSON.parse(itemString);
          } catch {
            item = { menuName: 'Invalid Item', status: ORDER_STATUS.PENDING };
          }

          const itemStatus = item.status || ORDER_STATUS.PENDING;

          return (
            <div
              key={index}
              className="p-5 rounded-xl border-2 border-pink-600 bg-white shadow-md flex flex-col items-center text-center gap-3"
            >
              {item.menuImage ? (
                <img
                  src={item.menuImage}
                  alt={item.menuName}
                  className="w-28 h-28 object-cover rounded-full border-2 border-gray-200 shadow-sm"
                />
              ) : (
                <div className="w-28 h-28 flex items-center justify-center rounded-full border text-xs text-gray-400">
                  No Image
                </div>
              )}

              <p className="font-semibold text-gray-800 text-lg">{item.menuName}</p>
              <p className="text-sm text-gray-600">
                ₱{(Number(item.menuPrice) * (item.quantity || 1)).toFixed(2)} — Qty: {item.quantity || 1}
              </p>
              <div className="text-sm text-gray-500">
                Food Stall: {item.room_name || 'Unknown'}
              </div>

              <div>{renderStatusBadge(itemStatus)}</div>
            </div>
          );
        })}
      </div>

      {/* Total Amount */}
      <div className="text-right border-t pt-4">
        <p className="text-lg font-semibold text-pink-600">Total: ₱ {totalAmount.toFixed(2)}</p>
      </div>
    </div>
  );
};

export default AllOrdersCard;

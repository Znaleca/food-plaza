'use client';

import { useEffect, useState } from 'react';
import getAllOrders from '@/app/actions/getAllOrders';
import updateTableNumber from '@/app/actions/updateTableNumber';

const AllOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingTable, setEditingTable] = useState({});
  const [updatingTableId, setUpdatingTableId] = useState(null);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await getAllOrders();
        if (Array.isArray(data.orders)) {
          setOrders(data.orders);
        } else {
          throw new Error('Unexpected response format');
        }
      } catch (error) {
        console.error('Could not load orders:', error);
        setError('Could not load orders');
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  const handleUpdateTable = async (orderId, newTableNumber) => {
    try {
      setUpdatingTableId(orderId);
      await updateTableNumber(orderId, newTableNumber);
      setEditingTable((prev) => ({ ...prev, [orderId]: '' }));
      const data = await getAllOrders();
      setOrders(data.orders || []);
    } catch (error) {
      console.error("Failed to update table number", error);
      alert("Failed to update table number");
    } finally {
      setUpdatingTableId(null);
    }
  };

  const renderStatusBadge = (status) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-semibold";
    const normalized = status?.toLowerCase() || 'pending';

    switch (normalized) {
      case 'pending':
        return <span className={`${baseClasses} bg-blue-100 text-blue-800`}>Pending</span>;
      case 'preparing':
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>Preparing</span>;
      case 'ready':
        return <span className={`${baseClasses} bg-indigo-100 text-indigo-800`}>Ready</span>;
      case 'completed':
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>Completed</span>;
      case 'cancelled':
        return <span className={`${baseClasses} bg-red-100 text-red-800`}>Cancelled</span>;
      default:
        return <span className={`${baseClasses} bg-blue-100 text-blue-800`}>Pending</span>;
    }
  };

  const renderPaymentStatusBadge = (paymentStatus) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-semibold";
    const normalized = paymentStatus?.toUpperCase() || 'PENDING';

    switch (normalized) {
      case 'PAID':
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>Paid</span>;
      case 'PENDING':
        return <span className={`${baseClasses} bg-blue-100 text-blue-800`}>Pending</span>;
      case 'EXPIRED':
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>Expired</span>;
      case 'FAILED':
        return <span className={`${baseClasses} bg-red-100 text-red-800`}>Failed</span>;
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>Unknown</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-6xl mx-auto bg-white shadow-md rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">All Orders</h1>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : orders.length === 0 ? (
          <p className="text-gray-600">No orders found.</p>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const totalAmount = Array.isArray(order.total)
                ? order.total[3] || order.total.at(-1) || 0
                : Number(order.total || 0);

              const paidAmount = Array.isArray(order.pay_amount)
                ? order.pay_amount[0] || 0
                : Number(order.pay_amount || 0);

              return (
                <div key={order.$id} className="border rounded-lg p-4 bg-gray-50 shadow-sm">
                  <div className="mb-2">
                    <h2 className="text-lg font-semibold text-gray-700">Order ID: {order.$id}</h2>
                    <p className="text-sm text-gray-600">
                      User: {order.name || 'Unknown User'} ({order.email || 'Unknown Email'})
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>Table Number:</span>
                      <input
                        type="number"
                        value={editingTable[order.$id] ?? (order.tableNumber?.[0] || '')}
                        onChange={(e) =>
                          setEditingTable((prev) => ({ ...prev, [order.$id]: e.target.value }))
                        }
                        className="border px-2 py-1 rounded-md text-sm w-20"
                      />
                      <button
                        onClick={() => handleUpdateTable(order.$id, editingTable[order.$id])}
                        disabled={updatingTableId === order.$id}
                        className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded"
                      >
                        {updatingTableId === order.$id ? "Saving..." : "Update"}
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-gray-500">
                    Created at: {new Date(order.created_at).toLocaleString()}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 my-1">
                    <p className="text-sm">Order Status: {renderStatusBadge(order.status)}</p>
                    <p className="text-sm">Payment: {renderPaymentStatusBadge(order.payment_status)}</p>
                  </div>

                  <div className="text-sm text-gray-700 font-semibold mb-3">
                    {Array.isArray(order.spaces) ? (
                      order.spaces.map((space, i) => (
                        <div key={i}>Space: {space?.name || 'Unnamed Space'}</div>
                      ))
                    ) : (
                      <div>Space: {order.spaces?.name || order.spaces || 'N/A'}</div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {order.items.map((itemString, index) => {
                      let item;
                      try {
                        item = JSON.parse(itemString);
                      } catch (e) {
                        item = { menuName: 'Invalid Item' };
                      }
                      return (
                        <div key={index} className="border p-3 rounded-md bg-white">
                          {item.menuImage && (
                            <img
                              src={item.menuImage}
                              alt={item.menuName}
                              className="w-24 h-24 object-cover mb-3"
                            />
                          )}
                          <p className="font-medium">{item.menuName}</p>
                          <p className="text-sm text-gray-600">
                            ₱{(Number(item.menuPrice) * Number(item.quantity || 1)).toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity || 1}</p>
                          {item.room_name && (
                            <p className="text-sm text-gray-500 italic">From: {item.room_name}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="text-right mt-4 space-y-1">
                    <p className="text-lg font-semibold text-green-700">
                      Total: ₱{totalAmount.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-700">
                      Paid: ₱{paidAmount.toFixed(2)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllOrdersPage;

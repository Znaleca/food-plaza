'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faClock, faHourglassHalf, faTimesCircle, faExclamationCircle, faBan, faReceipt, faXmark, faUtensils, faBagShopping } from '@fortawesome/free-solid-svg-icons'; 
import OrderReceipt from './OrderReceipt';

const MENU_STATUS = {
  PENDING: 'pending',
  PREPARING: 'preparing',
  READY: 'ready',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  FAILED: 'failed',
};

const PAYMENT_STATUS = {
  PENDING: "pending",
  PAID: "paid",
  EXPIRED: "expired",
  FAILED: "failed",
};

const SERVICE_TYPES = {
  DINE_IN: 'Dine In',
  TAKEOUT: 'Take Out',
};

const getServiceType = (serviceTypeStr) => {
    if (serviceTypeStr.toLowerCase().includes('dine in')) return SERVICE_TYPES.DINE_IN;
    if (serviceTypeStr.toLowerCase().includes('take out')) return SERVICE_TYPES.TAKEOUT;
    return null;
}

const OrderCard = ({ order, isReadOnly = false }) => {
  const [showReceipt, setShowReceipt] = useState(false); 

  const tableNumber = order.tableNumber?.[0] || 'N/A';
  
  const serviceTypeMap = (order.serviceType || []).reduce((acc, serviceStr) => {
    const [stallName, type] = serviceStr.split(':').map(s => s.trim());
    if (stallName && type) acc[stallName] = getServiceType(type);
    return acc;
  }, {});

  const renderStatus = (status) => {
    const statusMap = {
      [MENU_STATUS.PENDING]: { text: 'PENDING', color: 'bg-neutral-200 text-neutral-950 border-neutral-950' },
      [MENU_STATUS.PREPARING]: { text: 'PREPARING', color: 'bg-neutral-950 text-white border-neutral-950' },
      [MENU_STATUS.READY]: { text: 'READY', color: 'bg-red-600 text-white border-red-600' }, 
      [MENU_STATUS.COMPLETED]: { text: 'COMPLETED', color: 'bg-white text-neutral-950 border-neutral-950' },
      [MENU_STATUS.CANCELLED]: { text: 'CANCELLED', color: 'bg-neutral-100 text-neutral-400 border-neutral-300' },
      [MENU_STATUS.FAILED]: { text: 'FAILED', color: 'bg-red-600 text-white border-red-600' },
    };
    const s = statusMap[status] || statusMap[MENU_STATUS.PENDING];
    return (
      <div className={`inline-flex px-3 py-1 border-2 font-black text-[10px] uppercase tracking-widest ${s.color}`}>
        {s.text}
      </div>
    );
  };

  const renderPaymentStatus = (status) => {
    const statusKey = status.toLowerCase();
    const statusMap = {
      [PAYMENT_STATUS.PENDING]: { text: 'PENDING', bg: 'bg-neutral-200', textCol: 'text-neutral-950' },
      [PAYMENT_STATUS.PAID]: { text: 'PAID', bg: 'bg-neutral-950', textCol: 'text-white' },
      [PAYMENT_STATUS.EXPIRED]: { text: 'EXPIRED', bg: 'bg-neutral-100', textCol: 'text-neutral-400' },
      [PAYMENT_STATUS.FAILED]: { text: 'FAILED', bg: 'bg-red-600', textCol: 'text-white' },
    };
    const s = statusMap[statusKey] || statusMap[PAYMENT_STATUS.FAILED];
    return (
      <div className={`inline-flex px-4 py-2 border-4 border-neutral-950 font-black text-xs uppercase tracking-widest ${s.bg} ${s.textCol}`}>
        {s.text}
      </div>
    );
  };

  const parseItemsGroupedByRoom = () => {
    const grouped = {};
    let totalItemCount = 0; 
    (order.items || []).forEach((itemStr, index) => {
      try {
        const item = JSON.parse(itemStr);
        totalItemCount++;
        const roomId = item.room_id || 'unknown';
        const roomName = item.room_name || 'Unknown Stall';

        if (!grouped[roomId]) {
          grouped[roomId] = {
            roomName,
            items: [],
            serviceTypesFound: new Set(),
          };
        }
        
        const serviceType = serviceTypeMap[roomName] || null;
        if (serviceType) grouped[roomId].serviceTypesFound.add(serviceType);

        grouped[roomId].items.push({ ...item, index });
      } catch {}
    });

    Object.keys(grouped).forEach(roomId => {
        const stallGroup = grouped[roomId];
        const types = Array.from(stallGroup.serviceTypesFound);
        if (types.length === 1) stallGroup.displayServiceType = types[0];
        else stallGroup.displayServiceType = null;
        delete stallGroup.serviceTypesFound; 
    });

    return { grouped, totalItemCount };
  };

  const { grouped: groupedItems, totalItemCount } = parseItemsGroupedByRoom();

  if (totalItemCount === 0) return null;

  const paymentStatus = order.payment_status?.toLowerCase() || PAYMENT_STATUS.FAILED;
  const showReceiptButton = paymentStatus !== PAYMENT_STATUS.FAILED;
  
  const renderServiceTypeTag = (serviceType) => {
    const serviceMap = {
        [SERVICE_TYPES.DINE_IN]: { text: 'DINE IN', bg: 'bg-neutral-950', textCol: 'text-white' },
        [SERVICE_TYPES.TAKEOUT]: { text: 'TAKE OUT', bg: 'bg-white', textCol: 'text-neutral-950' },
    };
    const s = serviceMap[serviceType];
    if (!s) return null;
    return (
      <span className={`inline-flex items-center px-3 py-1 text-[10px] font-black uppercase tracking-widest border-2 border-neutral-950 ${s.bg} ${s.textCol} ml-4`}>
        {s.text}
      </span>
    );
  };

  return (
    <div className="w-full bg-white border-[6px] border-neutral-950 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col mb-12">

      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-stretch border-b-[6px] border-neutral-950 bg-neutral-50">
        <div className="p-6 md:p-8 flex-1 w-full border-b-[6px] md:border-b-0 md:border-r-[6px] border-neutral-950">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-red-600 mb-2">ORDER_ID</p>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none text-neutral-950">
            #{order.$id.slice(-8)}
          </h2>
          <p className="text-xs font-bold uppercase tracking-widest text-neutral-500 mt-4">
            {new Date(order.created_at).toLocaleString()}
          </p>
        </div>

        <div className="flex w-full md:w-auto">
          <div className="p-6 md:p-8 flex flex-col justify-center border-r-[6px] border-neutral-950 flex-1 md:flex-none">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-400 mb-3">PAYMENT</p>
            {renderPaymentStatus(paymentStatus)}
          </div>
          <div className="p-6 md:p-8 flex flex-col justify-center flex-1 md:flex-none bg-neutral-950 text-white">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-400 mb-2 text-center">TABLE</p>
            <div className="text-4xl font-black text-center tracking-tighter leading-none">
              {tableNumber}
            </div>
          </div>
        </div>
      </div>

      {/* ── ITEMS BODY ── */}
      <div className="p-6 md:p-8 bg-white">
        <h3 className="text-xl font-black uppercase tracking-tighter mb-8 border-b-4 border-neutral-950 pb-4">
          ORDER MANIFEST
        </h3>
        
        <div className="space-y-10">
          {Object.entries(groupedItems).map(([roomId, { roomName, items, displayServiceType }]) => (
            <div key={roomId} className="border-4 border-neutral-950">
              
              {/* Stall Header */}
              <div className="bg-neutral-950 text-white p-4 flex items-center">
                <h4 className="text-lg font-black uppercase tracking-tighter leading-none">
                  {roomName}
                </h4>
                {displayServiceType && renderServiceTypeTag(displayServiceType)}
              </div>
              
              {/* Items List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0">
                {items.map((item, idx) => {
                  const isCompleted = item.status === MENU_STATUS.COMPLETED;
                  return (
                    <div
                      key={item.index}
                      className={`relative p-5 flex items-start gap-4 transition-all ${
                        isCompleted ? 'bg-neutral-50 grayscale opacity-80' : 'bg-white'
                      } border-neutral-950
                      border-t-4 md:border-t-0
                      [&]:nth-child(n+2):border-t-4 
                      md:[&]:nth-child(-n+2):border-t-0
                      lg:[&]:nth-child(-n+3):border-t-0
                      md:border-l-4 md:[&]:nth-child(odd):border-l-0
                      lg:border-l-4 lg:[&]:nth-child(3n+1):border-l-0
                      `}
                    >
                      {/* Image */}
                      {item.menuImage ? (
                        <div className="flex-shrink-0 w-16 h-16 border-2 border-neutral-950 overflow-hidden">
                          <Image src={item.menuImage} alt={item.menuName} width={64} height={64} className="object-cover w-full h-full" />
                        </div>
                      ) : (
                        <div className="flex-shrink-0 w-16 h-16 border-2 border-neutral-950 bg-neutral-100 flex items-center justify-center">
                          <span className="text-[8px] font-black uppercase">NO IMG</span>
                        </div>
                      )}

                      {/* Details */}
                      <div className="flex-grow">
                        <p className="font-black text-sm uppercase tracking-tight leading-snug mb-1">
                          {item.menuName} 
                          {item.size && <span className="text-neutral-500 font-bold ml-1">({item.size})</span>}
                        </p>
                        <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-3">
                          QTY: <span className="text-neutral-950 font-black">{item.quantity}</span>
                        </p>
                        {renderStatus(item.status || MENU_STATUS.PENDING)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div className="border-t-[6px] border-neutral-950 p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-4 bg-neutral-50">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-neutral-400 text-center md:text-left">
          THANK YOU FOR YOUR ORDER
        </p>
        
        {showReceiptButton && (
          <button
            onClick={() => setShowReceipt(true)}
            className="w-full md:w-auto px-8 py-4 bg-neutral-950 text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-red-600 transition-colors border-4 border-neutral-950 flex items-center justify-center gap-3 group"
          >
            <FontAwesomeIcon icon={faReceipt} className="group-hover:animate-bounce" />
            VIEW RECEIPT
          </button>
        )}
      </div>

      {/* ── RECEIPT MODAL ── */}
      {showReceipt && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center bg-white/90 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl border-[8px] border-neutral-950 bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] my-8">
            <div className="sticky top-0 z-10 flex justify-between items-center border-b-4 border-neutral-950 p-4 bg-neutral-950 text-white">
              <span className="font-black uppercase tracking-[0.3em] text-[10px]">RECEIPT_DATA</span>
              <button
                onClick={() => setShowReceipt(false)}
                className="w-8 h-8 bg-white text-neutral-950 flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors"
                aria-label="Close Receipt"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>
            {/* PASSING GROUPED ITEMS WITH SERVICE TYPE DATA */}
            <OrderReceipt order={order} serviceTypeGroups={groupedItems} />
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderCard;
'use client';

import React from 'react';
import { useAuth } from '@/context/authContext';
import {
  FaUser,
  FaStore,
  FaCalendarCheck,
  FaCalendarTimes,
  FaHashtag,
  FaHourglassHalf,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaBan,
} from 'react-icons/fa';

// Helper component for displaying a row of data with an icon
const DataRow = ({ icon: Icon, label, value, valueClassName = '' }) => (
  <div className="flex items-start gap-3">
    <Icon className="mt-0.5 flex-shrink-0 text-base text-red-600" />
    <div className="flex flex-col">
      <span className="text-[10px] font-black uppercase tracking-[0.18em] text-neutral-600">
        {label}
      </span>
      <span className={`break-words text-sm font-bold text-neutral-950 ${valueClassName}`}>
        {value}
      </span>
    </div>
  </div>
);

const ReservationTicket = ({ booking, showActions = true }) => {
  const { currentUser } = useAuth();

  // Correctly access the nested room object and provide a fallback.
  const room = booking?.room || { name: 'Unknown Stall', stallNumber: 'N/A' };
  const userName = booking?.user_name || currentUser?.name || 'Unknown User';
  const leaseId = booking?.$id || 'N/A';

  // Formats a date string into a more readable format (e.g., "October 12, 2025, 2:58 PM")
  const formatDate = (dateString) => {
    if (!dateString) return 'Not Specified';
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Enhanced getStatus function to include an icon and background colors
  const getStatus = (status, checkOut) => {
    const now = new Date();
    const checkoutDate = checkOut ? new Date(checkOut) : null;

    if (checkoutDate && now > checkoutDate && status !== 'declined') {
      return {
        text: 'Expired',
        color: 'text-neutral-700',
        bgColor: 'bg-neutral-200',
        icon: FaBan,
      };
    }

    switch (status) {
      case 'pending':
        return {
          text: 'Pending Review',
          color: 'text-amber-800',
          bgColor: 'bg-amber-200',
          icon: FaHourglassHalf,
        };
      case 'approved':
        return {
          text: 'Approved',
          color: 'text-emerald-800',
          bgColor: 'bg-emerald-200',
          icon: FaCheckCircle,
        };
      case 'declined':
        return {
          text: 'Declined',
          color: 'text-red-700',
          bgColor: 'bg-red-200',
          icon: FaTimesCircle,
        };
      default:
        return {
          text: 'Unknown Status',
          color: 'text-neutral-700',
          bgColor: 'bg-neutral-200',
          icon: FaExclamationTriangle,
        };
    }
  };

  const statusInfo = getStatus(booking?.status, booking?.check_out);

  if (!booking || !booking.check_in || !booking.check_out) {
    return (
      <div className="border-4 border-black bg-white p-6 text-center shadow-[6px_6px_0px_#000]">
        Error: Incomplete lease or stall data provided.
      </div>
    );
  }

  return (
    <div className="w-full border-4 border-black bg-white p-5 text-neutral-950 shadow-[8px_8px_0px_#000] md:p-6">
      
      {/* 1. Header: Title and Status Badge */}
      <div className="flex flex-col justify-between gap-3 border-b-2 border-black pb-4 sm:flex-row sm:items-center">
        <h2 className="mb-1 text-lg font-black uppercase tracking-[0.2em] text-red-600 sm:mb-0 md:text-xl">
          Lease Request
        </h2>
        <div className={`inline-flex items-center border-2 border-black px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.14em] ${statusInfo.bgColor}`}>
          <statusInfo.icon className={`mr-2 ${statusInfo.color}`} />
          <span className={statusInfo.color}>{statusInfo.text}</span>
        </div>
      </div>

      {/* 2. Main Details: Lessee and Stall Info */}
      <div className="my-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-4 border-2 border-black bg-neutral-50 p-4">
          <DataRow icon={FaUser} label="Lessee Name" value={userName} />
          <DataRow icon={FaStore} label="Requested Stall" value={`${room.name} (#${room.stallNumber})`} />
        </div>
        <div className="space-y-4 border-2 border-black bg-neutral-50 p-4">
          <DataRow icon={FaCalendarCheck} label="Lease Start" value={formatDate(booking.check_in)} />
          <DataRow icon={FaCalendarTimes} label="Lease End" value={formatDate(booking.check_out)} />
        </div>
      </div>

      {/* 3. Footer: Lease ID and Actions */}
      <div className="border-t-2 border-black pt-4">
        <div className="mb-6 border-2 border-black bg-neutral-50 p-4">
          <DataRow icon={FaHashtag} label="Lease ID" value={leaseId} valueClassName="font-mono text-xs text-neutral-800" />
        </div>

        {showActions && (
          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:justify-end">
            <button
              onClick={() => console.log(`Cancel Booking: ${leaseId}`)}
              className="w-full border-2 border-black bg-white px-5 py-2 text-xs font-black uppercase tracking-[0.14em] text-red-600 transition hover:bg-black hover:text-white sm:w-auto"
            >
              Cancel Request
            </button>
            <button
              onClick={() => console.log(`View Room: ${room.$id}`)}
              className="w-full border-2 border-black bg-red-600 px-5 py-2 text-xs font-black uppercase tracking-[0.14em] text-white shadow-[4px_4px_0px_#000] transition hover:bg-black hover:shadow-[2px_2px_0px_#000] hover:translate-y-[2px] sm:w-auto"
            >
              View Stall Details
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReservationTicket;
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
  <div className="flex items-start">
    <Icon className="text-pink-500 text-base mt-1 mr-4 flex-shrink-0" />
    <div className="flex flex-col">
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
        {label}
      </span>
      <span className={`font-medium text-white break-words ${valueClassName}`}>
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
        color: 'text-gray-400',
        bgColor: 'bg-gray-700/20',
        icon: FaBan,
      };
    }

    switch (status) {
      case 'pending':
        return {
          text: 'Pending Review',
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-400/10',
          icon: FaHourglassHalf,
        };
      case 'approved':
        return {
          text: 'Approved',
          color: 'text-green-400',
          bgColor: 'bg-green-400/10',
          icon: FaCheckCircle,
        };
      case 'declined':
        return {
          text: 'Declined',
          color: 'text-red-500',
          bgColor: 'bg-red-500/10',
          icon: FaTimesCircle,
        };
      default:
        return {
          text: 'Unknown Status',
          color: 'text-gray-400',
          bgColor: 'bg-gray-700/20',
          icon: FaExclamationTriangle,
        };
    }
  };

  const statusInfo = getStatus(booking?.status, booking?.check_out);

  if (!booking || !booking.check_in || !booking.check_out) {
    return (
      <div className="bg-neutral-900 border border-red-500 rounded-xl p-6 text-center text-white">
        Error: Incomplete lease or stall data provided.
      </div>
    );
  }

  return (
    <div className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-6 text-white shadow-lg hover:border-pink-600 hover:shadow-pink-600/10 transition-all duration-300 font-sans">
      
      {/* 1. Header: Title and Status Badge */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-neutral-800">
        <h2 className="text-xl font-bold tracking-wider uppercase text-pink-500 mb-2 sm:mb-0">
          Lease Request
        </h2>
        <div className={`flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${statusInfo.bgColor}`}>
          <statusInfo.icon className={`mr-2 ${statusInfo.color}`} />
          <span className={statusInfo.color}>{statusInfo.text}</span>
        </div>
      </div>

      {/* 2. Main Details: Lessee and Stall Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
        <div className="space-y-4">
          <DataRow icon={FaUser} label="Lessee Name" value={userName} />
          <DataRow icon={FaStore} label="Requested Stall" value={`${room.name} (#${room.stallNumber})`} />
        </div>
        <div className="space-y-4">
          <DataRow icon={FaCalendarCheck} label="Lease Start" value={formatDate(booking.check_in)} />
          <DataRow icon={FaCalendarTimes} label="Lease End" value={formatDate(booking.check_out)} />
        </div>
      </div>

      {/* 3. Footer: Lease ID and Actions */}
      <div className="pt-4 border-t border-neutral-800">
        <div className="mb-6">
          <DataRow icon={FaHashtag} label="Lease ID" value={leaseId} valueClassName="text-sm font-mono text-gray-300" />
        </div>

        {showActions && (
          <div className="flex flex-col sm:flex-row justify-end items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <button
              onClick={() => console.log(`Cancel Booking: ${leaseId}`)}
              className="w-full sm:w-auto border border-red-600/50 text-red-500 px-5 py-2 rounded-lg text-sm font-semibold hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-200"
            >
              Cancel Request
            </button>
            <button
              onClick={() => console.log(`View Room: ${room.$id}`)}
              className="w-full sm:w-auto bg-pink-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-pink-700 transition-all duration-200"
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
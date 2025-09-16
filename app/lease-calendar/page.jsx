'use client';

import React from 'react';
import CalendarView from '@/components/CalendarView';
import Link from 'next/link'; // Use Link for navigation
import { FaChevronLeft } from 'react-icons/fa6'; // Use the same icon

const LeaseCalendar = () => {
  return (
    <div className="w-full min-h-screen bg-neutral-900 text-white px-4 py-12">
      {/* Back Button with same design as LeasePage */}
      <Link
        href="/lease/management"
        className="flex items-center text-yellow-400 hover:text-pink-400 transition duration-300 py-6"
      >
        <FaChevronLeft className="mr-2" />
        <span className="font-medium text-lg">Back</span>
      </Link>
      
      <CalendarView />
    </div>
  );
};

export default LeaseCalendar;
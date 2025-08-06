'use client';

import React from 'react';
import {
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaFacebook,
} from 'react-icons/fa';

const ContactPage = () => {
  return (
    <div className="w-full min-h-screen bg-neutral-900 text-white p-8 flex flex-col items-center">
      {/* Header Section */}
      <div className="mt-12 sm:mt-16 text-center mb-8 px-4">
        <p className="mt-4 text-2xl sm:text-9xl font-extrabold text-white leading-tight">CONTACT US</p>
      </div>

      {/* Intro Text */}
      <div className="text-center max-w-3xl mx-auto mb-12 px-4">
        <p className="text-lg sm:text-xl font-light text-gray-400">
          Got questions, suggestions, or need support? We're just a message away. Reach out to The Corner through any of the following ways.
        </p>
      </div>

      {/* Contact Details */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-10 max-w-5xl w-full text-center mb-12">
        <div className="flex flex-col items-center text-gray-200">
          <FaPhone className="text-pink-500 text-3xl mb-2" />
          <span className="font-semibold text-base sm:text-lg mb-1">Phone</span>
          <p className="text-sm text-gray-400">Mobile: +63 912 345 6789</p>
          <p className="text-sm text-gray-400">Tel: (047) 237-1234</p>
        </div>
        <div className="flex flex-col items-center text-gray-200">
          <FaEnvelope className="text-pink-500 text-3xl mb-2" />
          <span className="font-semibold text-base sm:text-lg mb-1">Email</span>
          <p className="text-sm text-gray-400">
            <a
              href="mailto:support@thecornerfoodplaza.com"
              className="hover:underline"
            >
              support@thecornerfoodplaza.com
            </a>
          </p>
        </div>
        <div className="flex flex-col items-center text-gray-200">
          <FaMapMarkerAlt className="text-pink-500 text-3xl mb-2" />
          <span className="font-semibold text-base sm:text-lg mb-1">Location</span>
          <p className="text-sm text-gray-400">Apollo, Orani</p>
          <p className="text-sm text-gray-400">Bataan, Philippines</p>
        </div>
      </div>

      {/* Social or Footer Note */}
      <div className="text-center max-w-2xl mx-auto px-4">
        <p className="text-md sm:text-lg font-light text-gray-400">
          Stay connected with us for updates and promotions.
        </p>
        <a
          href="https://facebook.com/thecornerfoodplaza"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center text-pink-500 hover:underline gap-2 text-sm sm:text-base"
        >
          <FaFacebook />
          facebook.com/thecornerfoodplaza
        </a>
      </div>
    </div>
  );
};

export default ContactPage;

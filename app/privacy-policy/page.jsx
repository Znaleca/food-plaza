'use client';

import { FaUserShield, FaClipboardList, FaShareAlt, FaCookieBite, FaUserCheck, FaHistory } from 'react-icons/fa';

const PolicyPrivacyPage = () => {
  return (
    <div className="w-full min-h-screen bg-neutral-900 text-white p-8 flex flex-col items-center">
      {/* Header Section */}
      <div className="mt-12 sm:mt-16 text-center mb-8 px-4">
        <p className="mt-4 text-2xl sm:text-9xl font-extrabold text-white leading-tight">PRIVACY POLICY</p>
        
      </div>

      {/* Intro */}
      <div className="text-center max-w-3xl mx-auto mb-28 px-4">
        <p className="text-lg sm:text-xl font-light text-gray-400">
          Your privacy is our priority. This policy explains how we collect, use, and safeguard your data when you visit or interact with us.
        </p>
      </div>

      {/* Policy Sections Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-10 max-w-5xl w-full text-left mb-12">
        <div className="bg-neutral-800 p-6 rounded-xl shadow border border-neutral-700">
          <div className="flex items-center gap-3 mb-2 text-pink-500">
            <FaUserShield className="text-xl" />
            <h2 className="text-lg font-semibold">1. Information We Collect</h2>
          </div>
          <p className="text-sm text-neutral-300">
            We collect your name, email, and feedback when you contact us at{' '}
            <a href="mailto:support@thecornerfoodplaza.com" className="text-pink-400 underline hover:text-pink-500">
              support@thecornerfoodplaza.com
            </a>
            . We also gather non-personal data like device and browser info.
          </p>
        </div>

        <div className="bg-neutral-800 p-6 rounded-xl shadow border border-neutral-700">
          <div className="flex items-center gap-3 mb-2 text-pink-500">
            <FaClipboardList className="text-xl" />
            <h2 className="text-lg font-semibold">2. How We Use Your Information</h2>
          </div>
          <ul className="list-disc list-inside text-sm text-neutral-300 space-y-1 ml-2">
            <li>To respond to your inquiries</li>
            <li>To improve our services and features</li>
            <li>To send updates (if you’ve opted in)</li>
          </ul>
        </div>

        <div className="bg-neutral-800 p-6 rounded-xl shadow border border-neutral-700">
          <div className="flex items-center gap-3 mb-2 text-pink-500">
            <FaShareAlt className="text-xl" />
            <h2 className="text-lg font-semibold">3. Data Sharing</h2>
          </div>
          <p className="text-sm text-neutral-300">
            We never sell or trade your personal information. We only share data when legally required or to protect our platform.
          </p>
        </div>

        <div className="bg-neutral-800 p-6 rounded-xl shadow border border-neutral-700">
          <div className="flex items-center gap-3 mb-2 text-pink-500">
            <FaCookieBite className="text-xl" />
            <h2 className="text-lg font-semibold">4. Cookies</h2>
          </div>
          <p className="text-sm text-neutral-300">
            Our website may use cookies to personalize your experience. You may disable cookies through your browser settings.
          </p>
        </div>

        <div className="bg-neutral-800 p-6 rounded-xl shadow border border-neutral-700">
          <div className="flex items-center gap-3 mb-2 text-pink-500">
            <FaUserCheck className="text-xl" />
            <h2 className="text-lg font-semibold">5. Your Rights</h2>
          </div>
          <p className="text-sm text-neutral-300">
            You may request access to or deletion of your personal data by emailing us at{' '}
            <a href="mailto:support@thecornerfoodplaza.com" className="text-pink-400 underline hover:text-pink-500">
              support@thecornerfoodplaza.com
            </a>
            .
          </p>
        </div>

        <div className="bg-neutral-800 p-6 rounded-xl shadow border border-neutral-700">
          <div className="flex items-center gap-3 mb-2 text-pink-500">
            <FaHistory className="text-xl" />
            <h2 className="text-lg font-semibold">6. Policy Updates</h2>
          </div>
          <p className="text-sm text-neutral-300">
            This policy may be updated occasionally. Any changes will be reflected on this page with the version number below.
          </p>
        </div>
      </div>

      {/* Footer Note */}
      <div className="text-center text-sm text-neutral-500">
        Version 1.0.0 – Last updated May 10, 2025
      </div>
    </div>
  );
};

export default PolicyPrivacyPage;

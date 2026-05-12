'use client';

import { FaUserShield, FaClipboardList, FaShareAlt, FaCookieBite, FaUserCheck, FaHistory } from 'react-icons/fa';

const PolicyPrivacyPage = () => {
  return (
    <div className="w-full min-h-screen bg-white text-neutral-950 selection:bg-red-600 selection:text-white px-6 pt-32 pb-24">
      
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-16">
        <h1 className="text-6xl md:text-9xl font-[1000] uppercase tracking-tighter leading-[0.8] mb-6">
          DATA<br />POLICY
        </h1>
        <div className="h-4 w-32 bg-red-600" />
      </div>

      {/* Intro Statement */}
      <div className="max-w-4xl mb-20">
        <p className="text-2xl md:text-4xl font-bold uppercase tracking-tight leading-none text-neutral-400">
          YOUR PRIVACY IS OUR <span className="text-neutral-950">PRIORITY</span>. WE SAFEGUARD YOUR DATA WITH THE SAME RIGOR WE APPLY TO OUR DESIGN.
        </p>
      </div>

      {/* Policy Sections Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t-4 border-l-4 border-neutral-950">
        
        {/* Section 1 */}
        <div className="p-8 border-r-4 border-b-4 border-neutral-950 hover:bg-neutral-50 transition-colors group">
          <div className="flex items-center gap-3 mb-6">
            <FaUserShield className="text-2xl text-red-600" />
            <h2 className="text-xl font-[1000] uppercase tracking-tighter">1. Collection</h2>
          </div>
          <p className="text-sm font-medium leading-relaxed text-neutral-600">
            We collect name, email, and feedback sent to{' '}
            <a href="mailto:bernardlanzdeleon@gmail.com" className="font-black text-neutral-950 underline decoration-red-600 underline-offset-4">
              bernardlanzdeleon@gmail.com
            </a>
            . We also gather non-personal device data.
          </p>
        </div>

        {/* Section 2 */}
        <div className="p-8 border-r-4 border-b-4 border-neutral-950 hover:bg-neutral-50 transition-colors group">
          <div className="flex items-center gap-3 mb-6">
            <FaClipboardList className="text-2xl text-red-600" />
            <h2 className="text-xl font-[1000] uppercase tracking-tighter">2. Usage</h2>
          </div>
          <ul className="text-sm font-black uppercase tracking-widest text-neutral-950 space-y-2">
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-red-600" /> Respond to Inquiries</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-red-600" /> Service Optimization</li>
            <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-red-600" /> Feature Updates</li>
          </ul>
        </div>

        {/* Section 3 */}
        <div className="p-8 border-r-4 border-b-4 border-neutral-950 hover:bg-neutral-50 transition-colors group">
          <div className="flex items-center gap-3 mb-6">
            <FaShareAlt className="text-2xl text-red-600" />
            <h2 className="text-xl font-[1000] uppercase tracking-tighter">3. Sharing</h2>
          </div>
          <p className="text-sm font-medium leading-relaxed text-neutral-600">
            We zero-trade your info. Data is only shared when legally mandated or to preserve platform integrity. No exceptions.
          </p>
        </div>

        {/* Section 4 */}
        <div className="p-8 border-r-4 border-b-4 border-neutral-950 hover:bg-neutral-50 transition-colors group">
          <div className="flex items-center gap-3 mb-6">
            <FaCookieBite className="text-2xl text-red-600" />
            <h2 className="text-xl font-[1000] uppercase tracking-tighter">4. Cookies</h2>
          </div>
          <p className="text-sm font-medium leading-relaxed text-neutral-600">
            We use essential cookies to personalize your flow. You retain the right to terminate cookie tracking via browser settings.
          </p>
        </div>

        {/* Section 5 */}
        <div className="p-8 border-r-4 border-b-4 border-neutral-950 hover:bg-neutral-50 transition-colors group">
          <div className="flex items-center gap-3 mb-6">
            <FaUserCheck className="text-2xl text-red-600" />
            <h2 className="text-xl font-[1000] uppercase tracking-tighter">5. Your Rights</h2>
          </div>
          <p className="text-sm font-medium leading-relaxed text-neutral-600">
            Access or Deletion requests are processed via{' '}
            <span className="font-black text-neutral-950">bernardlanzdeleon@gmail.com</span>. We respect your digital footprint.
          </p>
        </div>

        {/* Section 6 */}
        <div className="p-8 border-r-4 border-b-4 border-neutral-950 hover:bg-neutral-50 transition-colors group">
          <div className="flex items-center gap-3 mb-6">
            <FaHistory className="text-2xl text-red-600" />
            <h2 className="text-xl font-[1000] uppercase tracking-tighter">6. Updates</h2>
          </div>
          <p className="text-sm font-medium leading-relaxed text-neutral-600">
            This protocol is subject to evolution. Changes will be logged here. Check the manifest version below.
          </p>
        </div>
      </div>

      {/* Manifest Footer */}
      <div className="max-w-7xl mx-auto mt-20 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-neutral-950 flex items-center justify-center text-white font-black text-xs italic">
            BLITZ
          </div>
          <div className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-400">
            Manifest v2.0.26 — May 2026
          </div>
        </div>
        <div className="h-px flex-1 bg-neutral-200 hidden md:block mx-8" />
        <div className="text-[10px] font-black uppercase tracking-widest text-neutral-950">
          Bataan, Philippines
        </div>
      </div>
    </div>
  );
};

export default PolicyPrivacyPage;
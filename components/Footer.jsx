import { FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn } from 'react-icons/fa';
import Link from 'next/link';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-white py-16">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        {/* Grid Layout for Footer Sections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">

          {/* Brand / About Section */}
          <div>
            <h2 className="text-2xl font-semibold text-white">The Corner Food Plaza</h2>
            <p className="mt-4 text-gray-400 text-sm leading-relaxed">
              A curated selection of the best food stalls. Experience a variety of flavors at The Corner!
            </p>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="text-lg font-medium text-white mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-gray-300 hover:text-white transition-all duration-300">About Us</Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-white transition-all duration-300">Contact</Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="text-gray-300 hover:text-white transition-all duration-300">Privacy Policy</Link>
              </li>
            </ul>
          </div>

          {/* Social Media Links */}
          <div>
            <h3 className="text-lg font-medium text-white mb-4">Follow Us</h3>
            <div className="flex justify-center md:justify-start space-x-6">
              <Link href="https://facebook.com" target="_blank" className="p-3 bg-gray-800 rounded-full hover:bg-blue-600 transition-all duration-300">
                <FaFacebookF className="w-5 h-5" />
              </Link>
              <Link href="https://instagram.com" target="_blank" className="p-3 bg-gray-800 rounded-full hover:bg-pink-500 transition-all duration-300">
                <FaInstagram className="w-5 h-5" />
              </Link>
              <Link href="https://twitter.com" target="_blank" className="p-3 bg-gray-800 rounded-full hover:bg-blue-400 transition-all duration-300">
                <FaTwitter className="w-5 h-5" />
              </Link>
              <Link href="https://linkedin.com" target="_blank" className="p-3 bg-gray-800 rounded-full hover:bg-blue-700 transition-all duration-300">
                <FaLinkedinIn className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="border-t border-gray-700 mt-12 pt-6 text-center text-sm text-gray-400">
          &copy; {currentYear} <span className="font-medium text-white">The Corner</span>. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;

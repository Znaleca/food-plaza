import { FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn } from 'react-icons/fa';
import Link from 'next/link';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-900 text-white py-16 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
          
          {/* Brand Info */}
          <div>
            <h2 className="text-3xl font-extrabold tracking-widest text-white font-poppins">
              THE CORNER
            </h2>
            <p className="text-pink-600 text-sm font-semibold tracking-widest mt-1">
              FOOD PLAZA
            </p>
            <p className="mt-4 text-gray-400 text-sm leading-relaxed">
              Your go-to destination for the best food stalls around. 
              Enjoy a variety of flavors at The Corner!
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 tracking-wide">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/about"
                  className="text-gray-400 hover:text-pink-500 transition duration-300"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-gray-400 hover:text-pink-500 transition duration-300"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy-policy"
                  className="text-gray-400 hover:text-pink-500 transition duration-300"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Media Icons */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 tracking-wide">Follow Us</h3>
            <div className="flex justify-center md:justify-start space-x-4">
              <Link
                href="https://facebook.com"
                target="_blank"
                className="p-3 bg-neutral-800 rounded-full hover:bg-blue-600 transition"
              >
                <FaFacebookF className="w-5 h-5" />
              </Link>
              <Link
                href="https://instagram.com"
                target="_blank"
                className="p-3 bg-neutral-800 rounded-full hover:bg-pink-500 transition"
              >
                <FaInstagram className="w-5 h-5" />
              </Link>
              <Link
                href="https://twitter.com"
                target="_blank"
                className="p-3 bg-neutral-800 rounded-full hover:bg-blue-400 transition"
              >
                <FaTwitter className="w-5 h-5" />
              </Link>
              <Link
                href="https://linkedin.com"
                target="_blank"
                className="p-3 bg-neutral-800 rounded-full hover:bg-blue-700 transition"
              >
                <FaLinkedinIn className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-neutral-700 mt-12 pt-6 text-center text-sm text-gray-500">
          &copy; {currentYear}{' '}
          <span className="font-semibold text-white tracking-wide">The Corner</span>. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;

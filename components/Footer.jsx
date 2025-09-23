import { FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn } from 'react-icons/fa';
import Link from 'next/link';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-neutral-950 text-white py-16 px-6 font-sans relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
          
          {/* Brand Info */}
          <div>
            <h2 className="text-3xl font-extrabold tracking-widest text-white">
              THE CORNER
            </h2>
            <p className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-500 to-cyan-400 text-sm font-semibold tracking-[0.3em] mt-1">
              FOOD PLAZA
            </p>
            <p className="mt-4 text-gray-400 text-sm leading-relaxed max-w-sm mx-auto md:mx-0">
              Your go-to destination for the best food stalls around. 
              Enjoy a variety of flavors at The Corner!
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-fuchsia-500">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {[
                { name: 'About Us', href: '/about' },
                { name: 'Contact', href: '/contact' },
                { name: 'Privacy Policy', href: '/privacy-policy' },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-fuchsia-400 transition duration-300"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-lg font-semibold mb-4 tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-500 to-cyan-400">
              Follow Us
            </h3>
            <div className="flex justify-center md:justify-start space-x-4">
              {[
                { href: 'https://facebook.com', icon: FaFacebookF, hover: 'hover:text-blue-500' },
                { href: 'https://instagram.com', icon: FaInstagram, hover: 'hover:text-pink-500' },
                { href: 'https://twitter.com', icon: FaTwitter, hover: 'hover:text-cyan-400' },
                { href: 'https://linkedin.com', icon: FaLinkedinIn, hover: 'hover:text-blue-400' },
              ].map(({ href, icon: Icon, hover }, idx) => (
                <Link
                  key={idx}
                  href={href}
                  target="_blank"
                  className={`p-3 rounded-full bg-neutral-900 border border-neutral-800 shadow-md hover:border-fuchsia-400 hover:shadow-fuchsia-500/30 transition ${hover}`}
                >
                  <Icon className="w-5 h-5" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-neutral-800 mt-12 pt-6 text-center text-sm text-gray-500">
          &copy; {currentYear}{' '}
          <span className="font-semibold bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-500 to-cyan-400">
            The Corner
          </span>. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import { FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn } from 'react-icons/fa';
import Link from 'next/link';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t-4 border-neutral-950 py-16 px-2 sm:px-4 font-sans relative overflow-hidden">
      <div className="w-full px-0">
        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
          
          {/* Brand Info */}
          <div>
            <h2 className="text-4xl md:text-5xl font-black text-neutral-950 uppercase tracking-tighter">
              THE CORNER
            </h2>
            <p className="text-xs font-bold tracking-[0.4em] text-red-600 uppercase mt-2">
              FOOD PLAZA
            </p>
            <p className="mt-6 text-neutral-600 text-sm font-medium leading-relaxed max-w-sm mx-auto md:mx-0">
              Your go-to destination for the best food stalls around. 
              Enjoy a variety of flavors at The Corner!
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-black text-neutral-950 uppercase tracking-tight mb-6">
              Quick Links
            </h3>
            <ul className="space-y-4">
              {[
                { name: 'About Us', href: '/about' },
                { name: 'Contact', href: '/contact' },
                { name: 'Privacy Policy', href: '/privacy-policy' },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-neutral-500 font-bold uppercase tracking-wider text-sm hover:text-red-600 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-xl font-black text-neutral-950 uppercase tracking-tight mb-6">
              Follow Us
            </h3>
            <div className="flex justify-center md:justify-start space-x-4">
              {[
                { href: 'https://facebook.com', icon: FaFacebookF },
                { href: 'https://instagram.com', icon: FaInstagram },
                { href: 'https://twitter.com', icon: FaTwitter },
                { href: 'https://linkedin.com', icon: FaLinkedinIn },
              ].map(({ href, icon: Icon }, idx) => (
                <Link
                  key={idx}
                  href={href}
                  target="_blank"
                  className="flex items-center justify-center h-12 w-12 border-2 border-neutral-950 text-neutral-950 hover:bg-red-600 hover:border-red-600 hover:text-white transition-all group"
                >
                  <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t-4 border-neutral-950 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center text-xs font-black uppercase tracking-widest text-neutral-400">
          <p>&copy; {currentYear} <span className="text-neutral-950">THE CORNER</span>.</p>
          <p className="mt-4 md:mt-0">ALL RIGHTS RESERVED.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
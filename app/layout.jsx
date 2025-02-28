import React from 'react';
import { Link } from 'next/link';

const Layout = ({ children }) => {
  return (
    <div>
      <nav>
        <Link href="/">Home</Link>
        <Link href="/spaces">Spaces</Link>
      </nav>
      {children}
    </div>
  );
};

export default Layout;

'use client';

import { usePathname } from "next/navigation";
import Header from "./Header";

export default function HeaderWrapper() {
  const pathname = usePathname();
  const hideHeader = pathname === "/login" || pathname === "/register";

  if (hideHeader) return null;

  return (
    <div className="fixed top-0 left-0 w-full z-[9999] bg-white shadow-md">
      <Header />
    </div>
  );
}

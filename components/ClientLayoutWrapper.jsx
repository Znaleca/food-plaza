'use client';

import { useState, useEffect } from "react";
import Loading from "@/components/Loading";

export default function ClientLayoutWrapper({ children }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <Loading message="Getting things ready..." />;
  }

  return <>{children}</>;
}

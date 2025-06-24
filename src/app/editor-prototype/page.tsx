"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const CambridgePlayground = dynamic(
  () => import("../components/cambridge-playground"),
  { ssr: false }
);

export default function CambridgePlaygroundPage() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (window) {
      setIsReady(true);
    }
  }, []);

  if (!isReady) return null;

  return <CambridgePlayground />;
}

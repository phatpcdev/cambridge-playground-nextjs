"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const EditorPrototype = dynamic(
  () => import("../components/editor-prototype"),
  { ssr: false }
);

export default function EditorPrototypePage() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (window) {
      setIsReady(true);
    }
  }, []);

  if (!isReady) return null;

  return <EditorPrototype />;
}

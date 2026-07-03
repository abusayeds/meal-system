"use client";

import { useEffect } from "react";

export default function ThemeColorSync() {
  useEffect(() => {
    const color = "#ffffff";
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "theme-color");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", color);

    document.documentElement.style.backgroundColor = color;
    document.body.style.backgroundColor = color;
  }, []);

  return null;
}

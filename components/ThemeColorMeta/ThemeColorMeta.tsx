'use client';

import { useEffect } from 'react';

export default function ThemeColorMeta() {
  useEffect(() => {
    const themeColor = getComputedStyle(document.documentElement).getPropertyValue('--theme-color').trim();
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta && themeColor) meta.setAttribute('content', themeColor);
  }, []);

  return null;

}
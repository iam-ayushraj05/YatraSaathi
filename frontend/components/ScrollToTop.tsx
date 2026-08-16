'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // Disable native scroll restoration by the browser
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    const resetScroll = () => {
      window.scrollTo(0, 0);
      const scrollContainers = document.querySelectorAll('.overflow-y-auto, main, [style*="overflow-y: auto"]');
      scrollContainers.forEach((container) => {
        container.scrollTop = 0;
      });
    };

    // Reset scroll immediately
    resetScroll();

    // Reset scroll after a short delay to account for dynamic rendering/hydration
    const timer = setTimeout(resetScroll, 100);
    const timer2 = setTimeout(resetScroll, 500);

    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
    };
  }, [pathname]);

  return null;
}

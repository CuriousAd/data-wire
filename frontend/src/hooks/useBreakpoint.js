import { useState, useEffect } from 'react';

const BREAKPOINTS = {
  mobile: '(max-width: 767px)',
  tablet: '(min-width: 768px) and (max-width: 1023px)',
  desktop: '(min-width: 1024px)',
};

/**
 * Reactive breakpoint hook — single source of truth for responsive layout decisions.
 * Returns { isMobile, isTablet, isDesktop, breakpoint }.
 * Uses matchMedia listeners so re-renders happen only on actual breakpoint transitions.
 */
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState(() => {
    if (typeof window === 'undefined') return 'desktop';
    if (window.matchMedia(BREAKPOINTS.mobile).matches) return 'mobile';
    if (window.matchMedia(BREAKPOINTS.tablet).matches) return 'tablet';
    return 'desktop';
  });

  useEffect(() => {
    const mobileQuery = window.matchMedia(BREAKPOINTS.mobile);
    const tabletQuery = window.matchMedia(BREAKPOINTS.tablet);
    const desktopQuery = window.matchMedia(BREAKPOINTS.desktop);

    const update = () => {
      if (mobileQuery.matches) setBreakpoint('mobile');
      else if (tabletQuery.matches) setBreakpoint('tablet');
      else setBreakpoint('desktop');
    };

    mobileQuery.addEventListener('change', update);
    tabletQuery.addEventListener('change', update);
    desktopQuery.addEventListener('change', update);

    return () => {
      mobileQuery.removeEventListener('change', update);
      tabletQuery.removeEventListener('change', update);
      desktopQuery.removeEventListener('change', update);
    };
  }, []);

  return {
    breakpoint,
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop',
  };
}

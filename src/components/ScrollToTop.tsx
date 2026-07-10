import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Resets window scroll to the top on every pathname change.
 * Skips when a hash is present so useHashScroll can handle in-page anchors.
 * Runs both immediately and after paint to defeat browser scroll restoration
 * and late-mounting lazy content.
 */
const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    if (hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    // Re-assert after lazy Suspense content mounts and layout settles.
    const raf = requestAnimationFrame(() => window.scrollTo(0, 0));
    const t1 = setTimeout(() => window.scrollTo(0, 0), 60);
    const t2 = setTimeout(() => window.scrollTo(0, 0), 250);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;

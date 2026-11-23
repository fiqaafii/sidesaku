import { useEffect, useRef } from 'react';

/**
 * useScrollReveal
 * Lightweight IntersectionObserver hook for triggering scroll-reveal animations.
 * Automatically checks and respects prefers-reduced-motion.
 */
export function useScrollReveal(options = {}) {
  const containerRef = useRef(null);

  useEffect(() => {
    // Respect user's reduced-motion preference
    const prefersReducedMotion = typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const rootEl = containerRef.current || document;
    const targets = rootEl.querySelectorAll('[data-reveal]');

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      targets.forEach((el) => el.classList.add('reveal-active'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-active');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: options.threshold ?? 0.15,
        rootMargin: options.rootMargin ?? '0px 0px -40px 0px',
      }
    );

    targets.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, [options.threshold, options.rootMargin]);

  return containerRef;
}

export default useScrollReveal;

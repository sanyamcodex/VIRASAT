import { useEffect, useRef, useState } from 'react';

// Lightweight scroll-reveal wrapper (no external library). Adds `.is-visible`
// once the element scrolls into view; if IntersectionObserver is unavailable it
// shows immediately. Purely presentational — see `.reveal` in index.css. Motion
// itself is gated by prefers-reduced-motion there.
export default function Reveal({ as: Tag = 'div', className = '', children, ...props }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag ref={ref} className={`reveal ${visible ? 'is-visible' : ''} ${className}`} {...props}>
      {children}
    </Tag>
  );
}

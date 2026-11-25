import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useInView, useScroll, useSpring, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** Thin gradient bar at the top of the viewport that tracks page scroll progress. */
export function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 25, mass: 0.3 });
  return (
    <motion.div
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 h-1 origin-left z-[60] bg-gradient-to-r from-[#4F46E5] via-[#8B5CF6] to-[#06B6D4]"
    />
  );
}

/** Floating "back to top" button that appears after scrolling. */
export function BackToTopButton() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          aria-label="Back to top"
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 20 }}
          whileHover={{ scale: 1.1, rotate: -8 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-2xl bg-gradient-to-br from-[#4F46E5] to-[#06B6D4] text-white shadow-xl shadow-indigo-500/30 flex items-center justify-center cursor-pointer"
        >
          <ArrowUp className="w-5 h-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

/** Number that counts up from 0 when it scrolls into view. */
export function AnimatedCounter({ value, duration = 1.6, suffix = '', decimals = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const target = Number(value) || 0;
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return undefined;
    if (prefersReducedMotion()) {
      setDisplay(target);
      return undefined;
    }
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, target, duration]);

  return (
    <span ref={ref}>
      {display.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}

/** Typewriter that cycles through a list of words. */
export function RotatingWords({ words, className = '' }) {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!words?.length) return undefined;
    if (prefersReducedMotion()) {
      setText(words[0]);
      return undefined;
    }
    const current = words[index % words.length];
    let delay = deleting ? 45 : 95;
    if (!deleting && text === current) delay = 1600;
    if (deleting && text === '') delay = 300;

    const timer = setTimeout(() => {
      if (!deleting && text === current) {
        setDeleting(true);
      } else if (deleting && text === '') {
        setDeleting(false);
        setIndex((i) => (i + 1) % words.length);
      } else {
        setText(current.slice(0, text.length + (deleting ? -1 : 1)));
      }
    }, delay);
    return () => clearTimeout(timer);
  }, [text, deleting, index, words]);

  return (
    <span className={className}>
      {text}
      <span className="animate-caret inline-block w-[3px] h-[0.9em] -mb-1 ml-1 bg-cyan-300 rounded-sm" />
    </span>
  );
}

/** Rising glowing particles for dark hero backgrounds. */
export function ParticleField({ count = 28 }) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        left: `${(i * 37) % 100}%`,
        size: 2 + ((i * 7) % 5),
        duration: 10 + ((i * 13) % 14),
        delay: -((i * 11) % 20),
        color: ['#22D3EE', '#818CF8', '#A78BFA', '#F0ABFC'][i % 4],
      })),
    [count]
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.id}
          className="particle"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            background: p.color,
            boxShadow: `0 0 ${p.size * 4}px ${p.color}`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

/** Card wrapper that tilts in 3D and shows a cursor-following spotlight. */
export function TiltCard({ children, className = '', max = 8, ...rest }) {
  const ref = useRef(null);
  const [style, setStyle] = useState({});

  const onMove = (e) => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    el.style.setProperty('--mx', `${x * 100}%`);
    el.style.setProperty('--my', `${y * 100}%`);
    setStyle({
      transform: `perspective(900px) rotateX(${(0.5 - y) * max}deg) rotateY(${(x - 0.5) * max}deg) translateY(-4px)`,
    });
  };
  const onLeave = () => setStyle({ transform: 'perspective(900px) rotateX(0) rotateY(0)' });

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ ...style, transition: 'transform 0.25s ease-out' }}
      className={`spotlight-card will-change-transform ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

/** Button/link wrapper that drifts slightly toward the cursor. */
export function Magnetic({ children, strength = 0.25, className = '' }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const onMove = (e) => {
    if (prefersReducedMotion()) return;
    const rect = ref.current.getBoundingClientRect();
    setPos({
      x: (e.clientX - rect.left - rect.width / 2) * strength,
      y: (e.clientY - rect.top - rect.height / 2) * strength,
    });
  };
  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => setPos({ x: 0, y: 0 })}
      animate={pos}
      transition={{ type: 'spring', stiffness: 220, damping: 15, mass: 0.4 }}
      className={`inline-block ${className}`}
    >
      {children}
    </motion.div>
  );
}

/** Infinite horizontal marquee; children are duplicated for a seamless loop. */
export function Marquee({ children, className = '' }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#F8FAFC] to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#F8FAFC] to-transparent z-10" />
      <div className="flex w-max animate-marquee gap-4">
        <div className="flex gap-4 shrink-0">{children}</div>
        <div className="flex gap-4 shrink-0" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}

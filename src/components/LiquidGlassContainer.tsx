'use client';

import clsx from 'clsx';
import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';

interface LiquidGlassContainerProps {
  children: ReactNode;
  className?: string;
  roundedClass?: string; // Tailwind rounded class, e.g. 'rounded-2xl' or 'rounded-[28px]' or 'rounded-full'
  intensity?: 'low' | 'medium' | 'high' | 'strong';
  border?: 'subtle' | 'normal';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  animated?: boolean; // 是否启用液态玻璃动效
  animatedMode?: 'always' | 'hover' | 'inview'; // 动效触发模式
  tint?: 'blue' | 'neutral' | 'pink';
}

export default function LiquidGlassContainer({
  children,
  className,
  roundedClass = 'rounded-2xl',
  intensity = 'medium',
  border = 'subtle',
  shadow = 'lg',
  animated = true,
  animatedMode = 'inview',
  tint = 'blue',
}: LiquidGlassContainerProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [motionReduced, setMotionReduced] = useState(false);
  useEffect(() => {
    if (!animated || animatedMode !== 'inview') return;
    const el = rootRef.current;
    if (!el || typeof window === 'undefined') return;
    const obs = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        setInView(!!first?.isIntersecting);
      },
      { root: null, threshold: 0 }
    );
    obs.observe(el);
    return () => {
      obs.disconnect();
    };
  }, [animated, animatedMode]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      const handler = (e: MediaQueryListEvent) => setMotionReduced(e.matches);
      setMotionReduced(mq.matches);
      mq.addEventListener?.('change', handler);
      return () => mq.removeEventListener?.('change', handler);
    } catch {}
  }, []);
  const intensityClasses =
    intensity === 'strong'
      ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-3xl'
      : intensity === 'high'
      ? 'bg-white/70 dark:bg-gray-900/70 backdrop-blur-3xl'
      : intensity === 'low'
      ? 'bg-white/30 dark:bg-gray-900/30 backdrop-blur-sm'
      : 'bg-white/50 dark:bg-gray-900/50 backdrop-blur-lg';

  const borderClasses =
    border === 'subtle'
      ? 'border border-white/20 dark:border-gray-800/30'
      : 'border border-white/30 dark:border-gray-700/40';

  const shadowMap: Record<string, string> = {
    none: 'shadow-none',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    '2xl': 'shadow-2xl',
  };

  const classes = clsx(
    'relative overflow-hidden lgx-glass',
    roundedClass,
    intensityClasses,
    borderClasses,
    shadowMap[shadow],
    className,
    tint === 'blue' ? 'lgx-tint-blue' : tint === 'pink' ? 'lgx-tint-pink' : 'lgx-tint-neutral'
  );

  const overlayIntensityClass =
    intensity === 'strong'
      ? 'lgx-overlay--strong'
      : intensity === 'high'
      ? 'lgx-overlay--high'
      : intensity === 'low'
      ? 'lgx-overlay--low'
      : 'lgx-overlay--medium';

  const shouldAnimate =
    animated && !motionReduced &&
    (animatedMode === 'always' || (animatedMode === 'hover' && isHovered) || (animatedMode === 'inview' && inView));

  return (
    <div
      ref={rootRef}
      className={classes}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span aria-hidden className='lgx-specular' />
      <span aria-hidden className='lgx-edge' />
      {shouldAnimate && (
        <>
          <span
            aria-hidden
            className={clsx('lgx-overlay', overlayIntensityClass)}
          />
          <span
            aria-hidden
            className={clsx('lgx-shimmer', overlayIntensityClass)}
          />
        </>
      )}
      {children}
    </div>
  );
}

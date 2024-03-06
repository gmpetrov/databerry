'use client';

import { useEffect, useRef, useState } from 'react';

interface CounterProps {
  number: number;
  duration?: number;
}

export default function Counter({ number = 0, duration = 3000 }: CounterProps) {
  const counterElement = useRef<HTMLSpanElement | null>(null);
  const startTimestamp = useRef<number | null>(null);
  const [counterValue, setCounterValue] = useState<string>('0');
  const [animationCompleted, setAnimationCompleted] = useState<boolean>(false);
  let animationRequestId: number | null = null;
  let observer: IntersectionObserver | null = null;

  const precision: number =
    number % 1 === 0 ? 0 : (number.toString().split('.')[1] || []).length;

  const easeOut = (t: number): number => {
    return 1 - Math.pow(1 - t, 5);
  };

  const startAnimation = () => {
    const step = (timestamp: number) => {
      if (!startTimestamp.current) startTimestamp.current = timestamp;
      const progress: number = Math.min(
        (timestamp - (startTimestamp.current || 0)) / duration,
        1
      );
      const easedProgress: number = easeOut(progress);
      const newRawValue: number = parseFloat(
        (easedProgress * number).toFixed(precision)
      );
      setCounterValue(newRawValue.toFixed(precision));

      if (progress < 1) {
        animationRequestId = window.requestAnimationFrame(step);
      } else {
        setAnimationCompleted(true);
      }
    };

    animationRequestId = window.requestAnimationFrame(step);
  };

  useEffect(() => {
    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !animationCompleted) {
          startAnimation();
        }
      });
    });

    observer.observe(counterElement.current as Element);

    return () => {
      if (animationRequestId) {
        window.cancelAnimationFrame(animationRequestId);
      }
      if (observer) {
        observer.disconnect();
      }
    };
  }, []);

  return <span ref={counterElement}>{counterValue}</span>;
}

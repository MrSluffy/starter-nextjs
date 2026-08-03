"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface GenerationCounterProps {
  count: number | null;
}

/** easeOutCubic: decelerating curve for smooth animation finish */
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function GenerationCounter({ count }: GenerationCounterProps) {
  const [displayedCount, setDisplayedCount] = useState<number>(0);
  const previousCountRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const hasReceivedFirstValue = useRef(false);

  const animate = useCallback((from: number, to: number, duration: number) => {
    // Cancel any in-progress animation
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    const startTime = performance.now();

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);

      const currentValue = from + (to - from) * easedProgress;
      setDisplayedCount(currentValue);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(step);
      } else {
        animationFrameRef.current = null;
      }
    };

    animationFrameRef.current = requestAnimationFrame(step);
  }, []);

  useEffect(() => {
    if (count === null) {
      return;
    }

    if (!hasReceivedFirstValue.current) {
      // Initial load: animate from 0 to count over 1500ms
      hasReceivedFirstValue.current = true;
      animate(0, count, 1500);
    } else if (previousCountRef.current !== count) {
      // Subsequent update: animate from previous value to new count over 750ms
      const from = previousCountRef.current ?? 0;
      animate(from, count, 750);
    }

    previousCountRef.current = count;
  }, [count, animate]);

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Return null when count is null (hidden state)
  if (count === null) {
    return null;
  }

  return (
    <div className="flex items-center gap-1.5 text-sm whitespace-nowrap">
      <span className="text-foreground font-semibold tabular-nums">
        {Math.round(displayedCount).toLocaleString()}
      </span>
      <span className="text-muted-foreground">projects generated</span>
    </div>
  );
}

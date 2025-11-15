import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook to smoothly animate progress value changes
 *
 * Instead of jumping from 40% to 70%, this will smoothly
 * interpolate the displayed value over time
 *
 * @param targetProgress - The target progress value (0-100)
 * @param duration - Animation duration in milliseconds (default: 800ms)
 * @returns The smoothly animated progress value
 */
export function useSmoothProgress(targetProgress: number, duration: number = 800): number {
  const [displayedProgress, setDisplayedProgress] = useState(0);
  const animationRef = useRef<number | null>(null);
  const startValueRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    // Cancel any ongoing animation
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
    }

    // Set starting point for animation
    startValueRef.current = displayedProgress;
    startTimeRef.current = null;

    // Easing function for smooth acceleration/deceleration
    const easeOutCubic = (t: number): number => {
      return 1 - Math.pow(1 - t, 3);
    };

    const animate = (currentTime: number) => {
      // Initialize start time on first frame
      if (startTimeRef.current === null) {
        startTimeRef.current = currentTime;
      }

      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1); // 0 to 1

      // Apply easing function
      const easedProgress = easeOutCubic(progress);

      // Calculate current value
      const currentValue = startValueRef.current + (targetProgress - startValueRef.current) * easedProgress;

      setDisplayedProgress(Math.round(currentValue));

      // Continue animation if not complete
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        animationRef.current = null;
      }
    };

    // Start animation
    animationRef.current = requestAnimationFrame(animate);

    // Cleanup on unmount or when targetProgress changes
    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [targetProgress, duration]);

  return displayedProgress;
}

import { useState, useEffect, useRef } from "react";

export function usePullToRefresh(onRefresh: () => void) {
  const [pulling, setPulling] = useState(false);
  const startY = useRef(0);
  const isPulling = useRef(false);

  useEffect(() => {
    const threshold = 80;

    const onTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        startY.current = e.touches[0].clientY;
        isPulling.current = true;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isPulling.current) return;
      const diff = e.touches[0].clientY - startY.current;
      if (diff > threshold) {
        setPulling(true);
      }
    };

    const onTouchEnd = () => {
      if (isPulling.current && pulling) {
        onRefresh();
      }
      isPulling.current = false;
      setPulling(false);
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);

    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [onRefresh, pulling]);

  return { pulling };
}

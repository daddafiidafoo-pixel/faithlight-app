import React, { useRef, useState } from 'react';

export default function PullToRefresh({
  onRefresh,
  children,
  disabled = false,
  threshold = 70,
  className = '',
}) {
  const startY = useRef(0);
  const pulling = useRef(false);
  const refreshingRef = useRef(false);

  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const canStartPull = () => {
    return window.scrollY <= 0;
  };

  const handleTouchStart = (e) => {
    if (disabled || isRefreshing || !canStartPull()) return;
    startY.current = e.touches[0].clientY;
    pulling.current = true;
  };

  const handleTouchMove = (e) => {
    if (!pulling.current || disabled || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const distance = currentY - startY.current;

    if (distance > 0 && canStartPull()) {
      const limitedDistance = Math.min(distance * 0.5, 100);
      setPullDistance(limitedDistance);
    }
  };

  const resetPull = () => {
    pulling.current = false;
    setPullDistance(0);
  };

  const handleTouchEnd = async () => {
    if (!pulling.current || disabled || isRefreshing) {
      resetPull();
      return;
    }

    if (pullDistance >= threshold && onRefresh && !refreshingRef.current) {
      try {
        refreshingRef.current = true;
        setIsRefreshing(true);
        await onRefresh();
      } catch (error) {
        console.error('Pull-to-refresh failed:', error);
      } finally {
        refreshingRef.current = false;
        setIsRefreshing(false);
      }
    }

    resetPull();
  };

  const indicatorText = isRefreshing
    ? 'Refreshing...'
    : pullDistance >= threshold
      ? 'Release to refresh'
      : pullDistance > 0
        ? 'Pull to refresh'
        : '';

  return (
    <div
      className={className}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        style={{
          height: `${pullDistance}px`,
          transition: isRefreshing ? 'height 0.2s ease' : 'height 0.1s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          color: '#666',
          overflow: 'hidden',
        }}
      >
        {indicatorText}
      </div>

      {children}
    </div>
  );
}
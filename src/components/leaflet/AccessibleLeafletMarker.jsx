import { useEffect, useRef } from 'react';
import L from 'leaflet';

/**
 * Wrapper for leaflet markers to ensure WCAG 2.1 AA compliance
 * Adds accessible names and roles to map markers
 */
export function enhanceLeafletMarkerAccessibility(marker, label) {
  if (!marker || !marker._icon) return;
  
  const element = marker._icon;
  element.setAttribute('role', 'button');
  element.setAttribute('aria-label', label || 'Map marker');
  element.setAttribute('tabindex', '0');
  element.style.cursor = 'pointer';
  
  // Make marker keyboard accessible
  element.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      marker.openPopup?.();
    }
  });
}

export default function AccessibleLeafletMarker({ position, label, children, map }) {
  const markerRef = useRef(null);

  useEffect(() => {
    if (!map || !position) return;

    const marker = L.marker(position).addTo(map);
    markerRef.current = marker;

    // Add accessibility
    enhanceLeafletMarkerAccessibility(marker, label);

    if (children) {
      marker.bindPopup(children);
    }

    return () => {
      map.removeLayer(marker);
    };
  }, [map, position, label, children]);

  return null;
}
/**
 * ResponsiveGrid — Mobile-first responsive grid that stacks vertically on small screens
 * Eliminates horizontal scrolling by forcing single-column layout on mobile
 */
export default function ResponsiveGrid({
  children,
  columns = { mobile: 1, sm: 1, md: 2, lg: 3, xl: 4 },
  gap = 4,
  className = '',
}) {
  // Build Tailwind grid classes dynamically
  const getGridClass = () => {
    let classes = 'grid w-full';
    
    // Base mobile (1 column)
    if (columns.mobile === 1) classes += ' grid-cols-1';
    
    // Small screens
    if (columns.sm) {
      const col = Math.min(columns.sm, 2); // Max 2 for sm
      if (col === 1) classes += ' sm:grid-cols-1';
      else if (col === 2) classes += ' sm:grid-cols-2';
    }
    
    // Medium screens
    if (columns.md) {
      const col = Math.min(columns.md, 2); // Max 2 for md
      if (col === 1) classes += ' md:grid-cols-1';
      else if (col === 2) classes += ' md:grid-cols-2';
    }
    
    // Large screens
    if (columns.lg) {
      const col = Math.min(columns.lg, 3); // Max 3 for lg
      if (col === 1) classes += ' lg:grid-cols-1';
      else if (col === 2) classes += ' lg:grid-cols-2';
      else if (col === 3) classes += ' lg:grid-cols-3';
    }
    
    // XL screens
    if (columns.xl) {
      const col = Math.min(columns.xl, 4);
      if (col === 1) classes += ' xl:grid-cols-1';
      else if (col === 2) classes += ' xl:grid-cols-2';
      else if (col === 3) classes += ' xl:grid-cols-3';
      else if (col === 4) classes += ' xl:grid-cols-4';
    }
    
    // Gap
    if (gap === 3) classes += ' gap-3';
    else if (gap === 4) classes += ' gap-4';
    else if (gap === 6) classes += ' gap-6';
    
    return classes;
  };

  return (
    <div className={`${getGridClass()} ${className}`} style={{ overflowX: 'hidden' }}>
      {children}
    </div>
  );
}
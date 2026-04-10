/**
 * SafeAreaWrapper — iOS WebView safe area padding
 * Prevents content from being hidden under notches or home indicators
 */
export default function SafeAreaWrapper({ children, className = '' }) {
  return (
    <div
      className={`pt-safe pb-safe pl-safe pr-safe ${className}`}
      style={{
        paddingTop: 'max(var(--safe-area-inset-top, 0px), 1rem)',
        paddingBottom: 'max(var(--safe-area-inset-bottom, 0px), 1rem)',
        paddingLeft: 'max(var(--safe-area-inset-left, 0px), 1rem)',
        paddingRight: 'max(var(--safe-area-inset-right, 0px), 1rem)',
      }}
    >
      {children}
    </div>
  );
}
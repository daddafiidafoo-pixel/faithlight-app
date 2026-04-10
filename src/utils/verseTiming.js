export function getActiveVerse(timing = [], currentTime = 0) {
  const match = timing.find(
    (item) => currentTime >= item.start && currentTime < item.end
  );
  return match?.verse || null;
}
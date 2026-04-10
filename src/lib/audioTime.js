export function formatAudioTime(seconds = 0) {
  const safe = Math.floor(Number(seconds) || 0);
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
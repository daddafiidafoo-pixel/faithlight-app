const DOWNLOADS_KEY = "faithlight-audio-downloads";
const RECENT_KEY = "faithlight-audio-recent";

export function getDownloads() {
  try {
    return JSON.parse(localStorage.getItem(DOWNLOADS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveDownloads(items) {
  localStorage.setItem(DOWNLOADS_KEY, JSON.stringify(items));
}

export function addDownload(item) {
  const current = getDownloads();
  const filtered = current.filter((d) => d.id !== item.id);
  saveDownloads([...filtered, item]);
}

export function removeDownload(id) {
  const current = getDownloads();
  saveDownloads(current.filter((d) => d.id !== id));
}

export function saveRecentPlayback(item) {
  localStorage.setItem(RECENT_KEY, JSON.stringify(item));
}

export function getRecentPlayback() {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "null");
  } catch {
    return null;
  }
}
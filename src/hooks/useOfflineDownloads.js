import { useEffect, useState } from "react";
import { addDownload, getDownloads, removeDownload } from "@/utils/audioBibleStorage";

export function useOfflineDownloads() {
  const [downloads, setDownloads] = useState([]);

  useEffect(() => {
    setDownloads(getDownloads());
  }, []);

  const refresh = () => setDownloads(getDownloads());

  const saveOffline = async ({ id, url, meta }) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to download audio");

    const blob = await response.blob();
    const localUrl = URL.createObjectURL(blob);

    addDownload({ id, localUrl, meta, createdAt: Date.now(), status: "ready" });
    refresh();
  };

  const deleteOffline = (id) => {
    removeDownload(id);
    refresh();
  };

  return { downloads, saveOffline, deleteOffline, refresh };
}
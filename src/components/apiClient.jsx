import axios from "axios";

export const api = axios.create({
  timeout: 20000,
});

// Dedup repeated errors within 3s window
let lastErrorKey = "";
let lastErrorTime = 0;

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    const url = err?.config?.url || "";
    const method = (err?.config?.method || "get").toUpperCase();
    const message =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      "Unknown error";
    const key = `${status}:${method}:${url}`;

    const now = Date.now();
    const isDuplicate = key === lastErrorKey && now - lastErrorTime < 3000;

    if (!isDuplicate) {
      lastErrorKey = key;
      lastErrorTime = now;
      // Route through global silent logger (visible in DevErrorOverlay, never in UI)
      window.__logError?.({ status, url, method, message, data: { params: err?.config?.params } });
    }

    return Promise.resolve({ data: null, error: true, status });
  }
);

export async function safeGet(url, config) {
  try {
    const res = await api.get(url, config);
    return { ok: true, data: res.data };
  } catch (err) {
    return {
      ok: false,
      status: err?.response?.status || 0,
      error: err?.response?.data?.error || err?.message || "Request failed",
      raw: err?.response?.data,
    };
  }
}

export async function safePost(url, data, config) {
  try {
    const res = await api.post(url, data, config);
    return { ok: true, data: res.data };
  } catch (err) {
    return {
      ok: false,
      status: err?.response?.status || 0,
      error: err?.response?.data?.error || err?.message || "Request failed",
      raw: err?.response?.data,
    };
  }
}
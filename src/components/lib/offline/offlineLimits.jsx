export function getOfflineLimitBytes(subscriptionPlan) {
  const plan = String(subscriptionPlan || "FREE").toUpperCase();
  if (plan === "PREMIUM") return 5 * 1024 * 1024 * 1024;
  if (plan === "BASIC") return 1 * 1024 * 1024 * 1024;
  return 200 * 1024 * 1024;
}

export function formatBytes(bytes) {
  const b = Number(bytes || 0);
  if (b >= 1024 ** 3) return `${(b / 1024 ** 3).toFixed(2)} GB`;
  if (b >= 1024 ** 2) return `${(b / 1024 ** 2).toFixed(2)} MB`;
  if (b >= 1024) return `${(b / 1024).toFixed(2)} KB`;
  return `${b} B`;
}
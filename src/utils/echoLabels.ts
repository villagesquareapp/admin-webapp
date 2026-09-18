// Shared presentation for echo (and livestream) session statuses.

export const ECHO_STATUS_TONE: Record<string, string> = {
  live: "bg-lightsuccess text-success",
  scheduled: "bg-lightinfo text-info",
  ended: "bg-lightgray text-darklink dark:bg-dark",
  saved: "bg-lightsecondary text-secondary",
};

export const formatDuration = (seconds?: number) => {
  const s = Math.max(0, Math.floor(seconds || 0));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  const rm = m % 60;
  return rm ? `${h}h ${rm}m` : `${h}h`;
};

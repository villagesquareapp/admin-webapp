/**
 * Shared VFlix status helpers.
 * VflixStatus values are identical to PostStatus, so the chip styling mirrors
 * the Posts/Users admin tables for a consistent look.
 */

export const VFLIX_STATUS_STYLES: Record<string, string> = {
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  suspended: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  disabled: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
  reported: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  flagged: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  banned: "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-300",
  shadow_hidden: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  archived: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
};

/** Turn a raw status value into a readable label, e.g. shadow_hidden -> "Shadow hidden". */
export const formatStatusLabel = (status: string): string => {
  if (!status) return "";
  const spaced = status.replace(/_/g, " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
};

/** Compact number formatting for engagement counters (1200 -> 1.2K). */
export const formatCount = (value: number = 0): string => {
  if (value < 1000) return String(value);
  if (value < 1_000_000) return `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}K`;
  return `${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1)}M`;
};

/** Format a duration in seconds as m:ss. */
export const formatDuration = (seconds: number = 0): string => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

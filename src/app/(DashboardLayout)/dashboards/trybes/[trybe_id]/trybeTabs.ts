// The Trybe page's tabs, in order; the first is the default.
export const TRYBE_TABS = [
  "overview",
  "profile",
  "people",
  "announcement",
  "posts",
  "videos",
  "live",
  "market",
  "events",
  "files",
  "polls",
  "reports",
  "audit",
] as const;
export type TrybeTab = (typeof TRYBE_TABS)[number];

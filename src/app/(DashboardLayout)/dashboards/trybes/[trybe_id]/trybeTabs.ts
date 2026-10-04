// The Trybe page's tabs, in order; the first is the default.
export const TRYBE_TABS = ["profile", "people", "announcement", "events", "files", "polls"] as const;
export type TrybeTab = (typeof TRYBE_TABS)[number];

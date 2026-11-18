// The lists the app's report sheet is built from: "All surfaces" reasons show
// everywhere, and a surface adds its own.
export const SURFACES: { value: string; label: string }[] = [
  { value: "", label: "All surfaces" },
  { value: "user", label: "Profiles" },
  { value: "post", label: "Posts" },
  { value: "vflix", label: "VFlix" },
  { value: "livestream", label: "Livestreams" },
  { value: "echo", label: "Echoes" },
  { value: "marketsquare", label: "MarketSquare" },
  { value: "trybe", label: "Trybes" },
  { value: "africa-talent-challenge", label: "ATC" },
];

export const surfaceLabel = (value: string | null) =>
  SURFACES.find((s) => s.value === (value ?? ""))?.label ?? value ?? "All surfaces";

// The order the main API returns them in: position, then newest first.
export const appOrder = (reasons: IReportReason[], surface: string) =>
  reasons
    .filter((r) => r.is_active && (r.service_type === null || r.service_type === surface))
    .sort((a, b) => a.position - b.position || b.created_at.localeCompare(a.created_at));

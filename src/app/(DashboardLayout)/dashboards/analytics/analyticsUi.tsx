"use client";

import { Icon } from "@iconify/react";
import { format, formatDistanceToNowStrict, parseISO } from "date-fns";

export { SECTIONS, sectionMeta } from "./sections";

export const CHART_COLORS = { primary: "#00A1FF", secondary: "#8965E5", muted: "#B6C0CA" };

export const compact = (n?: number | null) => new Intl.NumberFormat("en", { notation: "compact" }).format(n || 0);
export const num = (n?: number | null) => (n ?? 0).toLocaleString("en", { maximumFractionDigits: 1 });

export const pct = (rate?: number | null, digits = 0) =>
  rate == null || Number.isNaN(rate) ? "—" : `${(rate * 100).toFixed(rate > 0 && rate < 0.01 ? 1 : digits)}%`;

export const share = (part: number, whole: number) => (whole ? part / whole : 0);

export const day = (iso?: string | null, pattern = "MMM d") => {
  if (!iso) return "—";
  try {
    return format(parseISO(iso), pattern);
  } catch {
    return iso;
  }
};

export const ago = (iso?: string | null) => {
  if (!iso) return "";
  try {
    return formatDistanceToNowStrict(parseISO(iso), { addSuffix: true });
  } catch {
    return "";
  }
};

// Change against the previous period. "points" compares two rates.
export const Change = ({
  now,
  before,
  kind = "count",
  quiet,
}: {
  now: number;
  before: number;
  kind?: "count" | "points";
  quiet?: boolean;
}) => {
  let text: string;
  let dir: number;
  if (kind === "points") {
    const d = (now - before) * 100;
    dir = Math.abs(d) < 0.05 ? 0 : Math.sign(d);
    text = `${Math.abs(d).toFixed(1)} pts`;
  } else if (!before) {
    if (!now) return <span className="text-darklink">No change</span>;
    return <span className="text-success font-semibold">New</span>;
  } else {
    const d = (now - before) / before;
    dir = Math.abs(d) < 0.005 ? 0 : Math.sign(d);
    text = pct(Math.abs(d));
  }
  const tone = dir > 0 ? "text-success" : dir < 0 ? "text-error" : "text-darklink";
  return (
    <span className={`inline-flex items-center gap-0.5 font-semibold whitespace-nowrap ${tone}`}>
      {dir !== 0 && <Icon icon={dir > 0 ? "solar:arrow-right-up-linear" : "solar:arrow-right-down-linear"} height={12} />}
      {dir === 0 ? "No change" : text}
      {!quiet && <span className="font-normal text-darklink ms-1">vs previous</span>}
    </span>
  );
};

export const Segmented = <T extends string>({
  value,
  options,
  onChange,
  size = "md",
}: {
  value: T;
  options: { value: T; label: string; disabled?: boolean; title?: string }[];
  onChange: (v: T) => void;
  size?: "sm" | "md";
}) => (
  <div className="inline-flex rounded-xl border border-ld p-1 w-fit max-w-full overflow-x-auto">
    {options.map((o) => (
      <button
        key={o.value}
        type="button"
        disabled={o.disabled}
        title={o.title}
        aria-pressed={value === o.value}
        onClick={() => onChange(o.value)}
        className={`rounded-lg font-medium whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed ${
          size === "sm" ? "px-2.5 py-1 text-xs" : "px-3.5 py-1.5 text-sm"
        } ${value === o.value ? "bg-primary text-white" : "text-darklink hover:text-primary"}`}
      >
        {o.label}
      </button>
    ))}
  </div>
);

export const TrackingBanner = ({ tracking, from }: { tracking: IAnalyticsTracking; from?: string }) => {
  if (!tracking.ready) return null;
  const since = tracking.visits_since;
  if (since && from && from >= since.slice(0, 10)) {
    return (
      <p className="text-xs text-darklink flex items-center gap-1.5">
        <Icon icon="solar:check-circle-linear" height={14} className="text-success" />
        Visits tracked since {day(since, "MMM d, yyyy")}.
      </p>
    );
  }
  return (
    <div className="rounded-xl bg-lightwarning/50 dark:bg-lightwarning/10 px-4 py-3 flex items-start gap-2.5 text-sm">
      <Icon icon="solar:info-circle-bold-duotone" height={20} className="text-warning shrink-0 mt-px" />
      <p>
        {since ? (
          <>
            <span className="font-semibold">Visits tracked since {day(since, "MMM d, yyyy")}.</span>{" "}
          </>
        ) : (
          <span className="font-semibold">App visits aren’t tracked yet. </span>
        )}
        <span className="text-darklink">
          Earlier days are rebuilt from actions (posts, likes, views, messages…), so they undercount people who only browsed.
        </span>
      </p>
    </div>
  );
};

export const NotReady = () => (
  <div className="rounded-2xl border border-dashed border-ld text-center px-6 py-12">
    <span className="mx-auto size-12 rounded-full grid place-items-center bg-lightprimary text-primary">
      <Icon icon="solar:hourglass-line-bold-duotone" height={24} />
    </span>
    <h5 className="text-base font-semibold mt-3">Tracking starts when the main API update is live</h5>
    <p className="text-sm text-darklink mt-1 max-w-lg mx-auto">
      Daily actives, sections and retention come from per-section activity the main API records. Until that update is
      deployed these numbers stay at zero. Account and signup totals are already real.
    </p>
  </div>
);

export const LoadFailed = ({ what }: { what: string }) => (
  <div className="rounded-2xl border border-dashed border-ld text-center px-6 py-12">
    <span className="mx-auto size-12 rounded-full grid place-items-center bg-lighterror text-error">
      <Icon icon="solar:danger-circle-bold-duotone" height={24} />
    </span>
    <h5 className="text-base font-semibold mt-3">Couldn’t load {what}</h5>
    <p className="text-sm text-darklink mt-1">Refresh the page to try again. If it keeps failing, your role may not include Analytics.</p>
  </div>
);

// A tiny trend line for table rows.
export const Sparkline = ({ values, width = 96, height = 26 }: { values: number[]; width?: number; height?: number }) => {
  if (values.length < 2) return <span className="text-xs text-darklink">—</span>;
  const max = Math.max(1, ...values);
  const step = width / (values.length - 1);
  const y = (v: number) => height - 2 - (v / max) * (height - 4);
  const points = values.map((v, i) => `${(i * step).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="text-primary overflow-visible" aria-hidden>
      <polygon points={`0,${height} ${points} ${width},${height}`} className="fill-primary/10" />
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
};

// A labelled horizontal bar, for breakdown lists.
export const BarRow = ({
  label,
  value,
  max,
  sub,
  tone = "bg-primary",
}: {
  label: React.ReactNode;
  value: number;
  max: number;
  sub?: React.ReactNode;
  tone?: string;
}) => (
  <div className="py-1.5">
    <div className="flex items-baseline justify-between gap-3 text-sm">
      <span className="truncate">{label}</span>
      <span className="font-semibold tabular-nums whitespace-nowrap">
        {num(value)}
        {sub && <span className="font-normal text-xs text-darklink ms-1.5">{sub}</span>}
      </span>
    </div>
    <div className="h-1.5 rounded-full bg-lightgray dark:bg-white/5 mt-1 overflow-hidden">
      <div className={`h-full rounded-full ${tone}`} style={{ width: `${max ? Math.max(value ? 1.5 : 0, (100 * value) / max) : 0}%` }} />
    </div>
  </div>
);

export const baseChart = (overrides: any = {}): any => ({
  chart: { fontFamily: "inherit", foreColor: "#adb0bb", toolbar: { show: false }, zoom: { enabled: false }, ...overrides.chart },
  dataLabels: { enabled: false },
  grid: { borderColor: "rgba(173,181,189,0.18)", strokeDashArray: 4 },
  legend: { show: true, position: "top", horizontalAlign: "right", fontWeight: 600, markers: { size: 5 } },
  tooltip: { theme: "dark" },
  ...Object.fromEntries(Object.entries(overrides).filter(([k]) => k !== "chart")),
});

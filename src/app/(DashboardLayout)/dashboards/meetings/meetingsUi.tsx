"use client";

import { format, parseISO } from "date-fns";

export const fmtTime = (iso?: string | null) => {
  if (!iso) return "—";
  try {
    return format(parseISO(iso), "MMM d, h:mm a");
  } catch {
    return iso;
  }
};

export const fmtClock = (iso?: string | null) => {
  if (!iso) return "—";
  try {
    return format(parseISO(iso), "h:mm a");
  } catch {
    return iso;
  }
};

export const fmtDuration = (sec?: number | null) => {
  const s = Math.max(0, Math.round(Number(sec) || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h) return `${h}h ${String(m).padStart(2, "0")}m`;
  if (m) return `${m}m`;
  return `${s}s`;
};

export const usd = (n?: number | null) => {
  const v = Number(n) || 0;
  if (v === 0) return "$0.00";
  return v < 0.01 ? "<$0.01" : `$${v.toFixed(2)}`;
};

const ENDED_BY: Record<string, string> = {
  host: "Ended by the host",
  admin: "Ended by an admin",
  system: "Ended when everyone left",
  replaced: "Ended when the host started another",
};
export const endedByLabel = (by?: string | null) => (by ? ENDED_BY[by] || by : "");

export const StatusChip = ({ status }: { status: string }) =>
  status === "live" ? (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
      <span className="size-1.5 rounded-full bg-green-600 animate-pulse" />
      Live
    </span>
  ) : (
    <span className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300">
      Ended
    </span>
  );

export const RoleChip = ({ role }: { role: string }) => (
  <span
    className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${
      role === "host" ? "bg-lightprimary text-primary" : "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300"
    }`}
  >
    {role === "host" ? "Host" : "Guest"}
  </span>
);

export const LateChip = () => (
  <span className="inline-block rounded-full px-2 py-0.5 text-[11px] font-medium bg-lightwarning text-warning">Late</span>
);

export const PersonCell = ({ person, sub }: { person: Partial<IMeetingPerson> | null; sub?: string }) => (
  <div className="flex items-center gap-3 min-w-0">
    {person?.profile_picture ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={person.profile_picture} alt="" className="size-8 rounded-full object-cover shrink-0" />
    ) : (
      <span className="size-8 rounded-full grid place-items-center bg-lightprimary text-primary shrink-0 text-xs font-semibold">
        {(person?.name || person?.username || "?").charAt(0).toUpperCase()}
      </span>
    )}
    <div className="min-w-0">
      <p className="text-sm font-medium truncate max-w-[200px]">{person?.name || person?.username || "Unknown"}</p>
      <p className="text-xs text-darklink truncate max-w-[200px]">{sub ?? (person?.username ? `@${person.username}` : person?.email)}</p>
    </div>
  </div>
);

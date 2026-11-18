"use client";

import { Icon } from "@iconify/react";

export const BADGE_LABEL: Record<string, string> = {
  greencheck: "Green check",
  premium: "Premium",
};

export const VerifiedBadge = ({ badge }: { badge?: string | null }) => {
  if (!badge || badge === "none") return <span className="text-xs text-darklink">No badge</span>;
  const premium = badge === "premium";
  return (
    <span
      className={`inline-flex w-fit self-start items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
        premium ? "bg-lightwarning text-warning" : "bg-lightsuccess text-success"
      }`}
    >
      <Icon icon={premium ? "solar:crown-minimalistic-bold" : "solar:verified-check-bold"} height={13} />
      {BADGE_LABEL[badge] ?? badge}
    </span>
  );
};

const DAY = 86_400_000;

// "Ends in 12 days", "Ended 3 days ago".
export const untilLabel = (iso?: string | null) => {
  if (!iso) return "";
  const days = Math.round((new Date(iso).getTime() - Date.now()) / DAY);
  if (days > 1) return `Ends in ${days} days`;
  if (days === 1) return "Ends tomorrow";
  if (days === 0) return new Date(iso).getTime() > Date.now() ? "Ends today" : "Ended today";
  return `Ended ${-days} day${days === -1 ? "" : "s"} ago`;
};

export const shortDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "--";

export const PersonCell = ({ user }: { user: { name?: string | null; username?: string | null; profile_picture?: string | null; uuid?: string } }) => (
  <div className="flex items-center gap-3 min-w-0">
    {user?.profile_picture ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={user.profile_picture} alt="" className="size-9 rounded-full object-cover shrink-0" />
    ) : (
      <span className="size-9 rounded-full grid place-items-center bg-lightprimary text-primary shrink-0 text-sm font-semibold">
        {(user?.name || user?.username || "?").charAt(0).toUpperCase()}
      </span>
    )}
    <div className="min-w-0">
      <p className="text-sm font-medium truncate max-w-[200px]">{user?.name || "Unknown"}</p>
      <p className="text-xs text-darklink truncate max-w-[200px]">{user?.username ? `@${user.username}` : user?.uuid}</p>
    </div>
  </div>
);

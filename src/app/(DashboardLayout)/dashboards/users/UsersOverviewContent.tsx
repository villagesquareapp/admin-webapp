"use client";

import Link from "next/link";
import Image from "next/image";
import { Icon } from "@iconify/react";
import { formatDistanceToNow } from "date-fns";
import CardBox from "@/app/components/shared/CardBox";
import KpiCard from "@/app/components/shared/KpiCard";
import { POST_STATUS_TONE } from "@/utils/moderationLabels";

const fmt = (n: number) => new Intl.NumberFormat("en", { notation: "compact" }).format(n || 0);

const kpiCards = (k: IUserOverview["kpis"]) => [
  { label: "Total users", value: k.total, icon: "solar:users-group-rounded-linear", tone: "bg-lightprimary text-primary" },
  { label: "Active", value: k.active, icon: "solar:check-circle-linear", tone: "bg-lightsuccess text-success" },
  { label: "Online now", value: k.online, icon: "solar:wi-fi-router-linear", tone: "bg-lightsuccess text-success" },
  { label: "Verified", value: k.verified, icon: "solar:verified-check-linear", tone: "bg-lightinfo text-info" },
  { label: "New (7d)", value: k.new_7d, icon: "solar:user-plus-linear", tone: "bg-lightsecondary text-secondary" },
  { label: "Flagged", value: k.flagged, icon: "solar:flag-2-linear", tone: "bg-lightwarning text-warning" },
  { label: "Suspended", value: k.suspended, icon: "solar:user-block-linear", tone: "bg-lightwarning text-warning" },
  { label: "Banned", value: k.banned, icon: "solar:forbidden-circle-linear", tone: "bg-lighterror text-error" },
  { label: "Open reports", value: k.open_reports, icon: "solar:danger-triangle-linear", tone: "bg-lighterror text-error" },
];

const Badge = ({ b }: { b: string }) =>
  b === "premium" ? <Icon icon="solar:crown-star-bold" className="text-warning" height={14} /> :
  b === "greencheck" ? <Icon icon="solar:verified-check-bold" className="text-info" height={14} /> : null;

const UserRow = ({ u, meta }: { u: IUserLite; meta?: "reports" | "time" }) => (
  <Link href={`/dashboards/users/${u.uuid}`} className="flex items-center gap-3 py-2.5">
    <div className="relative size-9 rounded-full overflow-hidden bg-lightgray dark:bg-dark shrink-0">
      {u.profile_picture && <Image src={u.profile_picture} alt="" fill className="object-cover" />}
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-sm font-medium truncate flex items-center gap-1">{u.name || "Unknown"} <Badge b={u.verification_badge} /></p>
      <p className="text-xs text-darklink truncate">@{u.username}</p>
    </div>
    {meta === "reports" ? (
      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-lighterror text-error shrink-0">{u.report_count || 0} reports</span>
    ) : (
      <span className="text-[11px] text-darklink shrink-0">{u.created_at ? formatDistanceToNow(new Date(u.created_at), { addSuffix: true }) : ""}</span>
    )}
  </Link>
);

const UsersOverviewContent = ({ data }: { data: IUserOverview | null }) => {
  if (!data) {
    return <CardBox><div className="py-16 text-center text-darklink">User overview is unavailable right now.</div></CardBox>;
  }
  const { kpis, by_status, by_account_type, recent_signups, reported_users } = data;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-9 gap-4">
        {kpiCards(kpis).map((c) => (
          <KpiCard key={c.label} icon={c.icon} value={c.value} label={c.label} tone={c.tone} />
        ))}
      </div>

      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-8">
          <CardBox>
            <div className="flex items-center justify-between mb-3">
              <h5 className="card-title">Flagged / reported users</h5>
              <Link href="/dashboards/users/reports" className="text-primary text-sm font-semibold">All reports</Link>
            </div>
            {reported_users.length ? (
              <div className="flex flex-col divide-y divide-border dark:divide-darkborder">
                {reported_users.map((u) => <UserRow key={u.uuid} u={u} meta="reports" />)}
              </div>
            ) : <div className="py-6 text-center text-sm text-darklink">No users with open reports.</div>}
          </CardBox>
        </div>
        <div className="col-span-12 lg:col-span-4">
          <CardBox>
            <h5 className="card-title mb-3">By status</h5>
            <div className="flex flex-col gap-2.5">
              {Object.entries(by_status).map(([s, n]) => (
                <div key={s} className="flex items-center justify-between text-sm">
                  <span className="capitalize text-darklink">{s.replace(/_/g, " ")}</span>
                  <span className={`font-semibold tabular-nums px-2 rounded-full ${POST_STATUS_TONE[s] || ""}`}>{fmt(n)}</span>
                </div>
              ))}
            </div>
          </CardBox>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-4">
          <CardBox>
            <h5 className="card-title mb-3">By account type</h5>
            <div className="flex flex-col gap-2.5">
              {Object.entries(by_account_type).map(([t, n]) => (
                <div key={t} className="flex items-center justify-between text-sm">
                  <span className="capitalize text-darklink">{t}</span>
                  <span className="font-semibold tabular-nums">{fmt(n)}</span>
                </div>
              ))}
            </div>
          </CardBox>
        </div>
        <div className="col-span-12 lg:col-span-8">
          <CardBox>
            <div className="flex items-center justify-between mb-3">
              <h5 className="card-title">Recent signups</h5>
              <Link href="/dashboards/users/list" className="text-primary text-sm font-semibold">All users</Link>
            </div>
            {recent_signups.length ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 divide-y md:divide-y-0 divide-border dark:divide-darkborder">
                {recent_signups.map((u) => <UserRow key={u.uuid} u={u} meta="time" />)}
              </div>
            ) : <div className="py-6 text-center text-sm text-darklink">No signups yet.</div>}
          </CardBox>
        </div>
      </div>
    </div>
  );
};

export default UsersOverviewContent;

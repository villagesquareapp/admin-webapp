"use client";

import Link from "next/link";
import { Icon } from "@iconify/react";
import CardBox from "@/app/components/shared/CardBox";
import KpiCard from "@/app/components/shared/KpiCard";
import { formatDate } from "@/utils/dateUtils";
import { Chip, TrybeAvatar } from "../trybeUi";

const plural = (n: number, one: string, many: string) => `${n.toLocaleString()} ${n === 1 ? one : many}`;

const TopList = ({
  title,
  note,
  empty,
  rows,
}: {
  title: string;
  note: string;
  empty: string;
  rows: { uuid: string; name: string; avatar: string | null; value: string; sub?: string; href?: string }[];
}) => (
  <CardBox>
    <p className="text-sm font-semibold">{title}</p>
    <p className="text-xs text-darklink mb-3">{note}</p>
    {rows.length === 0 ? (
      <p className="text-sm text-darklink">{empty}</p>
    ) : (
      <div className="flex flex-col gap-3">
        {rows.map((r) => (
          <Link key={r.uuid} href={r.href ?? `/dashboards/trybes/${r.uuid}`} className="flex items-center gap-3 min-w-0">
            <TrybeAvatar src={r.avatar} name={r.name} size={36} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{r.name}</p>
              {r.sub && <p className="text-xs text-darklink">{r.sub}</p>}
            </div>
            <span className="text-sm tabular-nums text-darklink shrink-0">{r.value}</span>
          </Link>
        ))}
      </div>
    )}
  </CardBox>
);

// Numbers across all Trybes, with the ones that need staff first.
const TrybesOverview = ({ data, message }: { data: ITrybesOverview | null; message?: string }) => {
  if (!data) {
    return (
      <CardBox>
        <p className="py-10 text-center text-sm text-darklink">{message || "Couldn't load the overview."}</p>
      </CardBox>
    );
  }

  const tiles = [
    { icon: "solar:users-group-rounded-line-duotone", value: data.members, label: "People in Trybes", tone: "bg-lightprimary text-primary" },
    { icon: "solar:user-plus-rounded-line-duotone", value: data.joined_7_days, label: "Joined this week", tone: "bg-lightsuccess text-success" },
    { icon: "solar:document-text-line-duotone", value: data.posts_7_days, label: "Posts this week", tone: "bg-lightinfo text-info" },
    { icon: "solar:user-check-rounded-line-duotone", value: data.pending_requests, label: "Waiting to join", tone: "bg-lightwarning text-warning" },
    { icon: "solar:danger-triangle-line-duotone", value: data.open_reports, label: "Open reports", tone: "bg-lighterror text-error" },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
        {tiles.map((t) => (
          <KpiCard key={t.label} {...t} />
        ))}
      </div>

      {(data.pending_requests > 0 || data.campus_without_institution > 0 || data.open_reports > 0) && (
        <div className="flex flex-col gap-2">
          {data.pending_requests > 0 && (
            <Link
              href="/dashboards/trybes/requests"
              className="flex items-center gap-2 rounded-lg bg-lightwarning text-warning text-sm px-3 py-2"
            >
              <Icon icon="solar:user-check-rounded-line-duotone" height={18} />
              {plural(data.pending_requests, "request is", "requests are")} waiting
              {data.oldest_pending_at ? `, the oldest since ${formatDate(data.oldest_pending_at)}` : ""}.
            </Link>
          )}
          {data.open_reports > 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-lighterror text-error text-sm px-3 py-2">
              <Icon icon="solar:danger-triangle-line-duotone" height={18} />
              {plural(data.open_reports, "report", "reports")} about Trybes or their content still open. Each Trybe&apos;s
              Reports tab has its own.
            </div>
          )}
          {data.campus_without_institution > 0 && (
            <Link
              href="/dashboards/trybes/list?linked=false"
              className="flex items-center gap-2 rounded-lg bg-lightwarning text-warning text-sm px-3 py-2"
            >
              <Icon icon="solar:buildings-2-line-duotone" height={18} />
              {plural(data.campus_without_institution, "Campus Trybe has", "Campus Trybes have")} no institution linked.
            </Link>
          )}
        </div>
      )}

      <CardBox>
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm font-semibold me-2">Trybes</p>
          {data.trybes_by_status.map((s) => (
            <Link key={s.status} href={`/dashboards/trybes/list?status=${s.status}`} className="flex items-center gap-1.5 text-sm">
              <Chip value={s.status} />
              <span className="tabular-nums">{s.total.toLocaleString()}</span>
            </Link>
          ))}
        </div>
      </CardBox>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <TopList
          title="Most active this week"
          note="By posts in the last 7 days."
          empty="No posts this week."
          rows={data.most_active.map((t) => ({ ...t, value: plural(t.posts_7_days, "post", "posts"), sub: plural(t.member_count, "member", "members") }))}
        />
        <TopList
          title="Biggest"
          note="By members, active Trybes only."
          empty="No active Trybes."
          rows={data.biggest.map((t) => ({ ...t, value: plural(t.member_count, "member", "members") }))}
        />
        <TopList
          title="Most requests waiting"
          note="Where reviews are piling up."
          empty="No requests waiting."
          rows={data.most_waiting.map((t) => ({ ...t, value: plural(t.pending, "request", "requests"), sub: `Oldest since ${formatDate(t.oldest_at)}`, href: `/dashboards/trybes/requests?trybe_id=${t.uuid}` }))}
        />
      </div>
    </div>
  );
};

export default TrybesOverview;

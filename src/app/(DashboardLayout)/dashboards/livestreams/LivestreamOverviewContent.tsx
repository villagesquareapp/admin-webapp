"use client";

import Link from "next/link";
import Image from "next/image";
import { Icon } from "@iconify/react";
import CardBox from "@/app/components/shared/CardBox";
import KpiCard from "@/app/components/shared/KpiCard";
import { ECHO_STATUS_TONE } from "@/utils/echoLabels";

const fmt = (n: number) => new Intl.NumberFormat("en", { notation: "compact" }).format(n || 0);

const kpiCards = (k: ILivestreamOverview["kpis"]) => [
  { label: "Total streams", value: k.total, icon: "solar:play-stream-linear", tone: "bg-lightprimary text-primary" },
  { label: "Live now", value: k.live, icon: "solar:videocamera-record-linear", tone: "bg-lightsuccess text-success" },
  { label: "Scheduled", value: k.scheduled, icon: "solar:calendar-linear", tone: "bg-lightinfo text-info" },
  { label: "Ended", value: k.ended, icon: "solar:stop-circle-linear", tone: "bg-lightgray text-darklink dark:bg-dark" },
  { label: "Viewers", value: k.total_viewers, icon: "solar:users-group-rounded-linear", tone: "bg-lightsecondary text-secondary" },
  { label: "Gifts", value: k.total_gifts, icon: "solar:gift-linear", tone: "bg-lightwarning text-warning" },
  { label: "Open reports", value: k.open_reports, icon: "solar:flag-2-linear", tone: "bg-lighterror text-error" },
  { label: "New (7d)", value: k.today, icon: "solar:add-circle-linear", tone: "bg-lightprimary text-primary" },
];

const Cover = ({ src }: { src?: string }) => (
  <div className="relative w-14 h-9 rounded-md overflow-hidden bg-lightgray dark:bg-dark shrink-0">
    {src && <Image src={src} alt="" fill className="object-cover" />}
  </div>
);

const StreamRow = ({ s }: { s: ILivestreams }) => (
  <Link href={`/dashboards/livestreams/${s.uuid}`} className="flex items-center gap-3 py-2.5">
    <Cover src={s.cover} />
    <div className="min-w-0 flex-1">
      <p className="text-sm font-medium truncate">{s.title || "Untitled stream"}</p>
      <p className="text-xs text-darklink truncate">@{s.host?.username}</p>
    </div>
    <div className="text-right shrink-0">
      <p className="text-sm font-semibold tabular-nums">{fmt(s.users)}</p>
      <p className="text-[11px] text-darklink">viewers</p>
    </div>
  </Link>
);

const LivestreamOverviewContent = ({ data }: { data: ILivestreamOverview | null }) => {
  if (!data) {
    return (
      <CardBox>
        <div className="py-16 text-center text-darklink">Livestream overview is unavailable right now.</div>
      </CardBox>
    );
  }
  const { kpis, by_status, by_category, engagement, live_now, top_streams, reported_streams } = data;
  const maxCat = Math.max(1, ...by_category.map((c) => c.count));

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-4">
        {kpiCards(kpis).map((c) => (
          <KpiCard key={c.label} icon={c.icon} value={c.value} label={c.label} tone={c.tone} />
        ))}
      </div>

      <CardBox>
        <h5 className="card-title mb-3">Engagement across all streams</h5>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { icon: "solar:users-group-rounded-linear", v: engagement.viewers, l: "Viewers", t: "bg-lightprimary text-primary" },
            { icon: "solar:gift-linear", v: engagement.gifts, l: "Gifts", t: "bg-lightwarning text-warning" },
            { icon: "solar:heart-linear", v: engagement.likes, l: "Likes", t: "bg-lighterror text-error" },
            { icon: "solar:chat-round-linear", v: engagement.comments, l: "Comments", t: "bg-lightinfo text-info" },
            { icon: "solar:share-linear", v: engagement.shares, l: "Shares", t: "bg-lightsuccess text-success" },
            { icon: "solar:diamond-linear", v: engagement.diamonds, l: "Diamonds", t: "bg-lightsecondary text-secondary" },
            { icon: "solar:wallet-money-linear", v: engagement.cowries, l: "Cowries", t: "bg-lightwarning text-warning" },
          ].map((s) => (
            <div key={s.l} className="rounded-xl border border-border dark:border-darkborder p-3">
              <span className={`size-8 rounded-lg grid place-items-center mb-2 ${s.t}`}>
                <Icon icon={s.icon} height={16} />
              </span>
              <p className="text-lg font-bold tabular-nums leading-tight">{fmt(s.v)}</p>
              <p className="text-xs text-darklink">{s.l}</p>
            </div>
          ))}
        </div>
      </CardBox>

      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-6">
          <CardBox>
            <div className="flex items-center justify-between mb-3">
              <h5 className="card-title flex items-center gap-2">
                <span className="size-2 rounded-full bg-success animate-pulse" /> Live now
              </h5>
              <Link href="/dashboards/livestreams/list?status=live" className="text-primary text-sm font-semibold">View all</Link>
            </div>
            {live_now.length ? (
              <div className="flex flex-col divide-y divide-border dark:divide-darkborder">
                {live_now.map((s) => <StreamRow key={s.uuid} s={s} />)}
              </div>
            ) : <div className="py-6 text-center text-sm text-darklink">No streams are live right now.</div>}
          </CardBox>
        </div>
        <div className="col-span-12 lg:col-span-6">
          <CardBox>
            <h5 className="card-title mb-3">Needs review</h5>
            {reported_streams.length ? (
              <div className="flex flex-col divide-y divide-border dark:divide-darkborder">
                {reported_streams.map((s) => (
                  <Link key={s.uuid} href={`/dashboards/livestreams/${s.uuid}`} className="flex items-center gap-3 py-2.5">
                    <Cover src={s.cover} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{s.title || "Untitled stream"}</p>
                      <p className="text-xs text-darklink truncate">@{s.host?.username}</p>
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-lighterror text-error shrink-0">
                      {s.report_count || 0} reports
                    </span>
                  </Link>
                ))}
              </div>
            ) : <div className="py-6 text-center text-sm text-darklink">Nothing needs review.</div>}
          </CardBox>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-4">
          <CardBox>
            <h5 className="card-title mb-3">By status</h5>
            <div className="flex flex-col gap-2.5">
              {Object.entries(by_status).map(([s, n]) => (
                <div key={s} className="flex items-center justify-between text-sm">
                  <span className="capitalize text-darklink">{s}</span>
                  <span className="font-semibold tabular-nums">{fmt(n)}</span>
                </div>
              ))}
            </div>
          </CardBox>
        </div>
        <div className="col-span-12 lg:col-span-4">
          <CardBox>
            <div className="flex items-center justify-between mb-3">
              <h5 className="card-title">Top categories</h5>
              <Link href="/dashboards/livestreams/categories" className="text-primary text-sm font-semibold">Manage</Link>
            </div>
            {by_category.length ? (
              <div className="flex flex-col gap-2.5">
                {by_category.map((c) => (
                  <div key={c.name} className="grid grid-cols-[110px_1fr_32px] items-center gap-3">
                    <span className="text-xs text-darklink truncate" title={c.name}>{c.name}</span>
                    <span className="h-2 rounded-full bg-lightgray dark:bg-dark overflow-hidden">
                      <span className="block h-full rounded-full bg-primary" style={{ width: `${(c.count / maxCat) * 100}%` }} />
                    </span>
                    <span className="text-xs font-semibold text-right tabular-nums">{c.count}</span>
                  </div>
                ))}
              </div>
            ) : <div className="py-4 text-center text-sm text-darklink">No categories.</div>}
          </CardBox>
        </div>
        <div className="col-span-12 lg:col-span-4">
          <CardBox>
            <h5 className="card-title mb-3">Top streams</h5>
            {top_streams.length ? (
              <div className="flex flex-col divide-y divide-border dark:divide-darkborder">
                {top_streams.map((s) => <StreamRow key={s.uuid} s={s} />)}
              </div>
            ) : <div className="py-4 text-center text-sm text-darklink">No ended streams yet.</div>}
          </CardBox>
        </div>
      </div>
    </div>
  );
};

export default LivestreamOverviewContent;

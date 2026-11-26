"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Icon } from "@iconify/react";
import { formatDistanceToNow } from "date-fns";
import CardBox from "@/app/components/shared/CardBox";
import { getUserActivity } from "@/app/api/user";
import { BarRow, CHART_COLORS, Segmented, baseChart, compact, day, num, sectionMeta } from "../../analytics/analyticsUi";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const WINDOWS = [
  { value: "7", label: "7 days" },
  { value: "30", label: "30 days" },
  { value: "90", label: "90 days" },
] as const;

export const minutes = (m?: number | null) => {
  if (m == null) return "—";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  return m % 60 ? `${h}h ${m % 60}m` : `${h}h`;
};

const Kpi = ({ icon, label, value, sub }: { icon: string; label: string; value: React.ReactNode; sub?: React.ReactNode }) => (
  <div className="rounded-xl border border-border dark:border-darkborder p-3 min-w-0">
    <div className="flex items-center gap-1.5 text-[11px] text-darklink">
      <Icon icon={icon} height={14} className="text-primary shrink-0" />
      <span className="truncate">{label}</span>
    </div>
    <p className="text-lg font-bold tabular-nums mt-1 truncate">{value}</p>
    {sub && <p className="text-[11px] text-darklink leading-tight">{sub}</p>}
  </div>
);

const Count = ({ icon, label, value, sub }: { icon: string; label: string; value: number | null | undefined; sub?: string }) => (
  <div className="flex items-center gap-2.5 py-2 min-w-0">
    <span className="size-8 rounded-lg grid place-items-center bg-lightprimary text-primary shrink-0">
      <Icon icon={icon} height={16} />
    </span>
    <div className="min-w-0">
      <p className="text-sm font-bold tabular-nums leading-tight" title={value != null ? num(value) : "Not available"}>
        {value == null ? "—" : compact(value)}
        {sub && <span className="text-[11px] font-normal text-darklink ms-1">{sub}</span>}
      </p>
      <p className="text-[11px] text-darklink leading-tight">{label}</p>
    </div>
  </div>
);

const DailyChart = ({ series, timeTracked }: { series: IUserActivity["series"]; timeTracked: boolean }) => {
  const options = baseChart({
    chart: { type: "bar", height: 220 },
    colors: [CHART_COLORS.primary, CHART_COLORS.secondary],
    plotOptions: { bar: { columnWidth: series.length > 40 ? "80%" : "55%", borderRadius: 3 } },
    stroke: { width: [0, 2], curve: "smooth" },
    // See-through bars so the made-per-day line stays visible over them.
    fill: { opacity: [0.45, 1] },
    markers: { size: series.length > 40 ? 0 : 3 },
    xaxis: {
      categories: series.map((d) => d.day),
      type: "datetime",
      labels: { format: "MMM d", style: { fontSize: "11px" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
      tooltip: { enabled: false },
    },
    yaxis: [
      { min: 0, title: { text: timeTracked ? "Minutes" : undefined }, labels: { formatter: (v: number) => `${Math.round(v)}`, style: { fontSize: "11px" } } },
      { min: 0, opposite: true, forceNiceScale: true, labels: { formatter: (v: number) => `${Math.round(v)}`, style: { fontSize: "11px" } } },
    ],
    tooltip: {
      theme: "dark",
      shared: true,
      intersect: false,
      x: { format: "ddd, MMM d" },
      y: [
        { formatter: (v: number | null) => (v == null ? "not recorded" : minutes(v)) },
        { formatter: (v: number | null) => (v == null ? "—" : num(v)) },
      ],
    },
  });
  const data = [
    { name: "Time in app", type: "column", data: series.map((d) => d.minutes) },
    { name: "Posts & VFlix made", type: "line", data: series.map((d) => d.created) },
  ];
  return <Chart options={options} series={data} type="line" height={220} width="100%" />;
};

const ActiveStrip = ({ series }: { series: IUserActivity["series"] }) => (
  <div>
    <div className="flex gap-[3px] flex-wrap">
      {series.map((d) => (
        <span
          key={d.day}
          title={`${day(d.day, "EEE, MMM d")}: ${d.active == null ? "unknown" : d.active ? "used the app" : "didn't open the app"}`}
          className={`size-3 rounded-[3px] ${d.active ? "bg-primary" : "bg-lightgray dark:bg-white/10"}`}
        />
      ))}
    </div>
    <p className="text-[11px] text-darklink mt-1.5">Each square is a day (Lagos time); blue means they used the app.</p>
  </div>
);

const Hours = ({ byHour }: { byHour: number[] }) => {
  const max = Math.max(1, ...byHour);
  return (
    <div>
      <div className="flex items-end gap-[3px] h-20">
        {byHour.map((m, h) => (
          <div key={h} className="flex-1 h-full flex items-end" title={`${String(h).padStart(2, "0")}:00 – ${minutes(m)}`}>
            <div className="w-full rounded-t-sm bg-primary/80" style={{ height: `${m ? Math.max(4, (100 * m) / max) : 0}%` }} />
          </div>
        ))}
      </div>
      <div className="flex justify-between text-[10px] text-darklink mt-1">
        <span>00</span>
        <span>06</span>
        <span>12</span>
        <span>18</span>
        <span>23</span>
      </div>
    </div>
  );
};

export type ActivityWindow = "7" | "30" | "90";

export function useUserActivity(userId: string) {
  const [days, setDays] = useState<ActivityWindow>("30");
  const [data, setData] = useState<IUserActivity | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "failed">("loading");

  useEffect(() => {
    let live = true;
    setState("loading");
    getUserActivity(userId, Number(days))
      .then((res) => {
        if (!live) return;
        setData(res?.data ?? null);
        setState(res?.data ? "ready" : "failed");
      })
      .catch(() => live && setState("failed"));
    return () => {
      live = false;
    };
  }, [userId, days]);

  return { days, setDays, data, state };
}

const UserActivityPanel = ({ activity }: { activity: ReturnType<typeof useUserActivity> }) => {
  const { days, setDays, data, state } = activity;

  const header = (
    <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
      <div>
        <h5 className="card-title">Activity</h5>
        <p className="text-xs text-darklink">What they&rsquo;ve done on VillageSquare. Days are Lagos time.</p>
      </div>
      <Segmented size="sm" value={days} options={WINDOWS.map((w) => ({ ...w }))} onChange={setDays} />
    </div>
  );

  if (state !== "ready" || !data) {
    return (
      <CardBox>
        {header}
        {state === "loading" ? (
          <div className="h-72 rounded-xl animate-pulse bg-lightgray dark:bg-dark" />
        ) : (
          <p className="text-sm text-darklink py-8 text-center">Activity didn&rsquo;t load. Refresh to try again.</p>
        )}
      </CardBox>
    );
  }

  const { usage, time, content: c, engagement: e } = data;
  const windowActive = usage ? (days === "7" ? usage.days_active.d7 : days === "30" ? usage.days_active.d30 : usage.days_active.d90) : null;
  const lastSeen = time?.last_seen_at ?? (usage?.last_online || null);
  const sections = usage?.sections ?? [];
  const sectionMax = Math.max(1, ...sections.map((s) => s.days));
  const timeSince = time?.tracked_since;
  const timePartial = !!timeSince && data.series[0]?.day < timeSince;

  return (
    <CardBox>
      {header}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Kpi
          icon="solar:calendar-mark-linear"
          label="Days active"
          value={windowActive == null ? "—" : `${windowActive} / ${data.window_days}`}
          sub={usage ? `${num(usage.days_active.total)} days in all` : "Not tracked here"}
        />
        <Kpi
          icon="solar:clock-circle-linear"
          label="Time in app"
          value={time ? minutes(time.total_minutes) : "—"}
          sub={
            time
              ? time.active_days
                ? `about ${minutes(time.avg_minutes_per_active_day)} a day they were on`
                : "No time recorded yet"
              : "Starts with the main API update"
          }
        />
        <Kpi
          icon="solar:eye-linear"
          label="Last seen"
          value={usage?.online ? <span className="text-success">Online</span> : lastSeen ? formatDistanceToNow(new Date(lastSeen), { addSuffix: true }) : usage?.last_active_day ? day(usage.last_active_day, "MMM d") : "—"}
          sub={time ? `${minutes(time.today_minutes)} today` : usage?.first_active_day ? `First seen ${day(usage.first_active_day, "MMM d, yyyy")}` : undefined}
        />
        <Kpi
          icon="solar:smartphone-2-linear"
          label="App"
          value={usage?.platform ? (usage.platform.toLowerCase() === "ios" ? "iOS" : usage.platform.charAt(0).toUpperCase() + usage.platform.slice(1)) : "—"}
          sub={usage?.app_version ? `Version ${usage.app_version}` : data.devices?.length ? `${data.devices.length} device${data.devices.length === 1 ? "" : "s"}` : undefined}
        />
      </div>

      <div className="mt-5">
        <DailyChart series={data.series} timeTracked={!!time} />
        {(time === null || timePartial) && (
          <p className="text-[11px] text-darklink flex items-center gap-1.5 -mt-1">
            <Icon icon="solar:info-circle-linear" height={13} />
            {time === null
              ? "Time in app isn't recorded in this environment yet."
              : `Time in app is recorded from ${day(timeSince, "MMM d, yyyy")}; earlier days show no bar.`}{" "}
            It&rsquo;s an estimate: 5-minute stretches in which the app talked to the server.
          </p>
        )}
      </div>

      <div className="mt-4">
        <ActiveStrip series={data.series} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-darklink mb-1">Sections used</p>
          {sections.length ? (
            sections.map((s) => {
              const meta = sectionMeta(s.section);
              return <BarRow key={s.section} label={meta.short} value={s.days} max={sectionMax} sub={s.days === 1 ? "day" : "days"} />;
            })
          ) : (
            <p className="text-sm text-darklink py-2">{usage ? "No sections used in this period." : "Not tracked here."}</p>
          )}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-darklink mb-1">Usual hours</p>
          {time && time.total_minutes > 0 ? (
            <Hours byHour={time.by_hour} />
          ) : (
            <p className="text-sm text-darklink py-2">{time ? "No time recorded in this period." : "Starts with the main API update."}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 mt-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-darklink">Made</p>
          <div className="grid grid-cols-2 gap-x-3">
            <Count icon="solar:document-text-linear" label="Posts" value={c?.posts} />
            <Count icon="solar:chat-line-linear" label="Replies" value={c?.replies} />
            <Count icon="solar:video-frame-play-vertical-linear" label="VFlix videos" value={c?.vflix} />
            <Count icon="solar:chat-round-line-linear" label="VFlix comments" value={c?.vflix_comments} />
            <Count icon="solar:microphone-3-linear" label="Echoes hosted" value={c?.echoes_hosted} />
            <Count icon="solar:play-stream-linear" label="Livestreams hosted" value={c?.livestreams_hosted} />
            <Count icon="solar:videocamera-record-linear" label="Meetings hosted" value={c?.meetings_hosted} />
            <Count icon="solar:shop-2-linear" label="MarketSquare products" value={c?.products} />
            <Count icon="game-icons:africa" label="ATC entries" value={c?.atc_entries} />
            <Count icon="solar:bookmark-linear" label="Saved items" value={c?.bookmarks} />
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-darklink">Reach and interaction</p>
          <div className="grid grid-cols-2 gap-x-3">
            <Count icon="solar:users-group-rounded-linear" label="Followers" value={e?.followers} />
            <Count icon="solar:user-plus-linear" label="Following" value={e?.following} />
            <Count icon="solar:eye-linear" label="Views received" value={e?.views_received} />
            <Count icon="solar:heart-linear" label="Likes received" value={e?.likes_received} />
            <Count icon="solar:like-linear" label="Likes given" value={e?.likes_given} />
            <Count icon="solar:chat-round-dots-linear" label="Messages sent" value={e?.messages_sent} />
            <Count icon="solar:phone-calling-linear" label="Calls made" value={e?.calls} />
            <Count
              icon="solar:gift-linear"
              label="Gifts sent"
              value={e?.gifts_sent}
              sub={e?.gift_coins_sent ? `${compact(e.gift_coins_sent)} Coins` : undefined}
            />
            <Count
              icon="solar:gift-bold-duotone"
              label="Gifts received"
              value={e?.gifts_received}
              sub={e?.gift_coins_received ? `${compact(e.gift_coins_received)} Coins` : undefined}
            />
            <Count icon="solar:star-linear" label="ATC votes cast" value={e?.votes_cast} />
            <Count icon="solar:users-group-two-rounded-linear" label="Trybes joined" value={e?.trybes} />
            <Count icon="solar:flag-linear" label="Reports filed" value={e?.reports_filed} />
          </div>
        </div>
      </div>

      {!!data.interests?.length && (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-darklink mb-2">Interests</p>
          <div className="flex flex-wrap gap-1.5">
            {data.interests.map((i) => (
              <span key={i.key} className="text-xs px-2.5 py-1 rounded-full bg-lightprimary text-primary font-medium">
                {i.label}
              </span>
            ))}
          </div>
        </div>
      )}
      <p className="text-[11px] text-darklink mt-4">Counts are all-time, except the chart, days active, time, sections and hours, which cover the chosen period.</p>
    </CardBox>
  );
};

export default UserActivityPanel;

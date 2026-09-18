"use client";

import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Icon } from "@iconify/react";
import CardBox from "@/app/components/shared/CardBox";
import KpiCard from "@/app/components/shared/KpiCard";
import { formatDistanceToNow } from "date-fns";
import { actionIcon, actionLabel, actionTone } from "@/utils/moderationLabels";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const fmt = (n: number) => new Intl.NumberFormat("en", { notation: "compact" }).format(n || 0);

const kpiCards = (k: IPostOverview["kpis"]) => [
  { label: "Total posts", value: k.total, icon: "solar:document-text-linear", tone: "bg-lightprimary text-primary" },
  { label: "Active", value: k.active, icon: "solar:check-circle-linear", tone: "bg-lightsuccess text-success" },
  { label: "Open reports", value: k.open_reports, icon: "solar:flag-2-linear", tone: "bg-lighterror text-error" },
  { label: "In review", value: k.in_review, icon: "solar:clock-circle-linear", tone: "bg-lightwarning text-warning" },
  { label: "Shadow-limited", value: k.shadow_limited, icon: "solar:eye-closed-linear", tone: "bg-lightwarning text-warning" },
  { label: "Taken down", value: k.taken_down, icon: "solar:trash-bin-trash-linear", tone: "bg-lighterror text-error" },
  { label: "New (7d)", value: k.today, icon: "solar:calendar-linear", tone: "bg-lightsecondary text-secondary" },
];

const Thumb = ({ src }: { src?: string }) => (
  <div className="relative w-9 h-12 rounded-md overflow-hidden bg-lightgray dark:bg-dark shrink-0">
    {src && <Image src={src} alt="" fill className="object-cover" />}
  </div>
);

const REASON_COLORS = ["#00A1FF", "#FF6692", "#FFB900", "#46caeb", "#8965E5", "#00ceb6", "#f97316", "#94a3b8"];

const EngTile = ({ icon, value, label, tone }: { icon: string; value: number; label: string; tone: string }) => (
  <div className="rounded-xl border border-border dark:border-darkborder p-3">
    <span className={`size-8 rounded-lg grid place-items-center mb-2 ${tone}`}>
      <Icon icon={icon} height={16} />
    </span>
    <p className="text-lg font-bold tabular-nums leading-tight">{fmt(value)}</p>
    <p className="text-xs text-darklink">{label}</p>
  </div>
);

const FUNNEL = [
  { key: "received", label: "Reports received", tone: "bg-info", text: "text-info" },
  { key: "open", label: "Open", tone: "bg-error", text: "text-error" },
  { key: "in_review", label: "In review", tone: "bg-warning", text: "text-warning" },
  { key: "resolved", label: "Resolved", tone: "bg-success", text: "text-success" },
  { key: "dismissed", label: "Dismissed", tone: "bg-gray-400", text: "text-darklink" },
] as const;

const PostsOverviewContent = ({ data }: { data: IPostOverview | null }) => {
  if (!data) {
    return (
      <CardBox>
        <div className="py-16 text-center text-darklink">Posts overview is unavailable right now.</div>
      </CardBox>
    );
  }
  // Defensive defaults so the page renders even before the enriched API deploys.
  const { kpis, by_status, by_reason } = data;
  const trends = data.trends || [];
  const engagement = data.engagement || { likes: 0, replies: 0, shares: 0, views: 0 };
  const media_mix = data.media_mix || { image: 0, video: 0, text: 0 };
  const funnel = data.funnel || { received: 0, open: 0, in_review: 0, resolved: 0, dismissed: 0 };
  const top_posts = data.top_posts || [];
  const reported_posts = data.reported_posts || [];
  const recent_actions = data.recent_actions || [];
  const maxReason = Math.max(1, ...by_reason.map((r) => r.count));
  const mixTotal = Math.max(1, media_mix.image + media_mix.video + media_mix.text);
  const funnelMax = Math.max(1, funnel.received);

  const chartOptions: any = {
    chart: { type: "area", height: 270, fontFamily: "inherit", foreColor: "#adb0bb", toolbar: { show: false }, sparkline: { enabled: false } },
    colors: ["#00A1FF", "#FF6692"],
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 2.5 },
    fill: { type: "gradient", gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.02, stops: [0, 90] } },
    legend: { show: true, position: "top", horizontalAlign: "right", fontWeight: 600, markers: { radius: 12 } },
    grid: { borderColor: "rgba(173,181,189,0.18)", strokeDashArray: 4, padding: { left: 8, right: 8 } },
    xaxis: {
      categories: trends.map((t) => t.date),
      type: "datetime",
      labels: { format: "MMM d", style: { fontSize: "11px" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
      tooltip: { enabled: false },
    },
    yaxis: { labels: { formatter: (v: number) => fmt(Math.round(v)), style: { fontSize: "11px" } }, min: 0 },
    tooltip: { theme: "dark", x: { format: "MMM d, yyyy" } },
  };
  const chartSeries = [
    { name: "Posts", data: trends.map((t) => t.posts) },
    { name: "Reports", data: trends.map((t) => t.reports) },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-4">
        {kpiCards(kpis).map((c) => (
          <KpiCard key={c.label} icon={c.icon} value={c.value} label={c.label} tone={c.tone} />
        ))}
      </div>

      {/* trends + funnel */}
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-8">
          <CardBox>
            <div className="flex items-center justify-between mb-1">
              <h5 className="card-title">Activity · last 14 days</h5>
              <span className="text-xs text-darklink">posts vs. reports</span>
            </div>
            <Chart options={chartOptions} series={chartSeries} type="area" height={270} width="100%" />
          </CardBox>
        </div>
        <div className="col-span-12 lg:col-span-4">
          <CardBox>
            <h5 className="card-title mb-3">Report funnel</h5>
            <div className="flex flex-col gap-3">
              {FUNNEL.map((f) => {
                const v = funnel[f.key] || 0;
                return (
                  <div key={f.key}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-darklink">{f.label}</span>
                      <span className={`font-bold tabular-nums ${f.text}`}>{fmt(v)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-lightgray dark:bg-dark overflow-hidden">
                      <div className={`h-full rounded-full ${f.tone}`} style={{ width: `${(v / funnelMax) * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardBox>
        </div>
      </div>

      {/* engagement + media mix */}
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-8">
          <CardBox>
            <h5 className="card-title mb-3">Engagement across all posts</h5>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <EngTile icon="solar:eye-linear" value={engagement.views} label="Views" tone="bg-lightprimary text-primary" />
              <EngTile icon="solar:heart-linear" value={engagement.likes} label="Likes" tone="bg-lighterror text-error" />
              <EngTile icon="solar:reply-2-linear" value={engagement.replies} label="Replies" tone="bg-lightinfo text-info" />
              <EngTile icon="solar:share-linear" value={engagement.shares} label="Shares" tone="bg-lightsuccess text-success" />
            </div>
          </CardBox>
        </div>
        <div className="col-span-12 lg:col-span-4">
          <CardBox>
            <h5 className="card-title mb-3">Media mix</h5>
            <div className="flex h-3 rounded-full overflow-hidden mb-3">
              <div className="bg-primary" style={{ width: `${(media_mix.image / mixTotal) * 100}%` }} />
              <div className="bg-secondary" style={{ width: `${(media_mix.video / mixTotal) * 100}%` }} />
              <div className="bg-gray-300 dark:bg-gray-600" style={{ width: `${(media_mix.text / mixTotal) * 100}%` }} />
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2"><span className="size-2.5 rounded-sm bg-primary" />Image</span>
                <span className="font-semibold tabular-nums">{fmt(media_mix.image)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2"><span className="size-2.5 rounded-sm bg-secondary" />Video</span>
                <span className="font-semibold tabular-nums">{fmt(media_mix.video)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2"><span className="size-2.5 rounded-sm bg-gray-300 dark:bg-gray-600" />Text only</span>
                <span className="font-semibold tabular-nums">{fmt(media_mix.text)}</span>
              </div>
            </div>
          </CardBox>
        </div>
      </div>

      {/* needs review + by status */}
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-8">
          <CardBox>
            <div className="flex items-center justify-between mb-3">
              <h5 className="card-title">Needs review</h5>
              <Link href="/dashboards/posts/queue" className="text-primary text-sm font-semibold">Open queue</Link>
            </div>
            {reported_posts.length ? (
              <div className="flex flex-col divide-y divide-border dark:divide-darkborder">
                {reported_posts.map((p) => (
                  <Link key={p.uuid} href={`/dashboards/posts/${p.uuid}`} className="flex items-center gap-3 py-2.5">
                    <Thumb src={p.media?.[0]?.thumbnail} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{p.caption || "Untitled"}</p>
                      <p className="text-xs text-darklink truncate">@{p.user?.username}</p>
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-lighterror text-error shrink-0">
                      {p.report_count || 0} reports
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-sm text-darklink">Nothing needs review.</div>
            )}
          </CardBox>
        </div>
        <div className="col-span-12 lg:col-span-4">
          <CardBox>
            <h5 className="card-title mb-3">By status</h5>
            <div className="flex flex-col gap-2.5">
              {Object.entries(by_status).map(([s, n]) => (
                <div key={s} className="flex items-center justify-between text-sm">
                  <span className="capitalize text-darklink">{s.replace(/_/g, " ")}</span>
                  <span className="font-semibold tabular-nums">{fmt(n)}</span>
                </div>
              ))}
            </div>
          </CardBox>
        </div>
      </div>

      {/* by reason + recent enforcement */}
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-6">
          <CardBox>
            <div className="flex items-center justify-between mb-3">
              <h5 className="card-title">Open reports by reason</h5>
              <Link href="/dashboards/posts/reports" className="text-primary text-sm font-semibold">All reports</Link>
            </div>
            {by_reason.length ? (
              <div className="flex flex-col gap-2.5">
                {by_reason.map((r, i) => (
                  <div key={r.reason} className="grid grid-cols-[130px_1fr_36px] items-center gap-3">
                    <span className="text-xs text-darklink truncate" title={r.reason}>{r.reason}</span>
                    <span className="h-2 rounded-full bg-lightgray dark:bg-dark overflow-hidden">
                      <span className="block h-full rounded-full" style={{ width: `${(r.count / maxReason) * 100}%`, background: REASON_COLORS[i % REASON_COLORS.length] }} />
                    </span>
                    <span className="text-xs font-semibold text-right tabular-nums">{r.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-sm text-darklink">No open reports.</div>
            )}
          </CardBox>
        </div>
        <div className="col-span-12 lg:col-span-6">
          <CardBox>
            <div className="flex items-center justify-between mb-3">
              <h5 className="card-title">Recent enforcement</h5>
              <Link href="/dashboards/posts/enforcement" className="text-primary text-sm font-semibold">Full log</Link>
            </div>
            {recent_actions?.length ? (
              <div className="flex flex-col divide-y divide-border dark:divide-darkborder">
                {recent_actions.map((a) => (
                  <div key={a.uuid} className="flex items-center gap-3 py-2.5">
                    <span className={`size-8 rounded-lg grid place-items-center shrink-0 ${actionTone(a.action)}`}>
                      <Icon icon={actionIcon(a.action)} height={16} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{actionLabel(a.action)}</p>
                      <p className="text-xs text-darklink truncate">
                        {a.reason || (a.result !== "executed" ? a.result : "content action")}
                      </p>
                    </div>
                    <span className="text-[11px] text-darklink shrink-0">
                      {a.created_at ? formatDistanceToNow(new Date(a.created_at), { addSuffix: true }) : ""}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-sm text-darklink">No enforcement actions yet.</div>
            )}
          </CardBox>
        </div>
      </div>

      {/* top posts */}
      <CardBox>
        <h5 className="card-title mb-3">Top posts by likes</h5>
        {top_posts.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {top_posts.map((p) => (
              <Link key={p.uuid} href={`/dashboards/posts/${p.uuid}`} className="flex items-center gap-3">
                <Thumb src={p.media?.[0]?.thumbnail} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{p.caption || "Untitled"}</p>
                  <p className="text-xs text-darklink truncate">@{p.user?.username}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold tabular-nums">{fmt(p.likes_count)}</p>
                  <p className="text-[11px] text-darklink">likes</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-sm text-darklink">No posts yet.</div>
        )}
      </CardBox>
    </div>
  );
};

export default PostsOverviewContent;

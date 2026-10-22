"use client";

import type { CSSProperties } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { Icon } from "@iconify/react";
import CardBox from "@/app/components/shared/CardBox";
import VflixStatusBadge from "./VflixStatusBadge";
import { formatCount, formatStatusLabel } from "./vflixStatus";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

// tone -> tinted chip classes (MaterialM tokens)
const TONE: Record<string, string> = {
  primary: "bg-lightprimary text-primary",
  success: "bg-lightsuccess text-success",
  warning: "bg-lightwarning text-warning",
  secondary: "bg-lightsecondary text-secondary",
  error: "bg-lighterror text-error",
  info: "bg-lightinfo text-info",
};

const STATUS_COLORS: Record<string, string> = {
  active: "#00A1FF",
  reported: "#FFB900",
  flagged: "#46caeb",
  banned: "#FF6692",
  disabled: "#8965E5",
  shadow_hidden: "#00ceb6",
  archived: "#7b8893",
};

const SectionTitle = ({
  title,
  sub,
  href,
  cta,
}: {
  title: string;
  sub?: string;
  href?: string;
  cta?: string;
}) => (
  <div className="flex items-center justify-between gap-3 mb-4">
    <h5 className="text-[15px] font-bold tracking-tight">
      {title}
      {sub && <span className="text-darklink font-medium text-xs ml-2">{sub}</span>}
    </h5>
    {href && (
      <Link href={href} className="text-xs font-semibold text-primary hover:underline shrink-0">
        {cta || "View"} →
      </Link>
    )}
  </div>
);

const OverviewContent = ({ data }: { data: IVflixOverview | null }) => {
  if (!data) {
    return (
      <CardBox>
        <div className="py-16 text-center text-darklink">
          <Icon icon="solar:videocamera-record-linear" height={40} className="mx-auto mb-3" />
          <p>VFlix overview is unavailable right now.</p>
        </div>
      </CardBox>
    );
  }

  const k = data.kpis;
  const catalogTotal =
    data.catalog.sounds +
    data.catalog.filters +
    data.catalog.templates +
    data.catalog.stickers +
    data.catalog.fonts +
    data.catalog.colours;

  const segs = [
    { label: "Videos", sub: `${k.total.toLocaleString()} total`, icon: "solar:videocamera-record-bold", tone: "primary", href: "/dashboards/vflix/videos" },
    { label: "Moderation", sub: `${data.moderation.open.toLocaleString()} in queue`, icon: "solar:flag-2-bold", tone: "warning", href: "/dashboards/vflix/moderation" },
    { label: "Featured", sub: `${k.featured} curated`, icon: "solar:star-bold", tone: "secondary", href: "/dashboards/vflix/featured" },
    { label: "Creators", sub: "Top performers", icon: "solar:users-group-rounded-bold", tone: "info", href: "/dashboards/vflix/creators" },
    { label: "Catalog", sub: `${catalogTotal.toLocaleString()} assets`, icon: "solar:library-bold", tone: "success", href: "/dashboards/vflix/catalog" },
    { label: "Reports", sub: `${(data.moderation.reported + data.moderation.flagged).toLocaleString()} open`, icon: "solar:danger-triangle-bold", tone: "error", href: "/dashboards/vflix/reports" },
  ];

  const kpis = [
    { label: "Total videos", value: k.total.toLocaleString(), icon: "solar:videocamera-record-bold", tone: "primary", delta: "▲ 3.2%", sub: "vs prev 30d", dtone: "text-success" },
    { label: "Active", value: k.active.toLocaleString(), icon: "solar:play-circle-bold", tone: "success", delta: "▲ 2.9%", sub: "vs prev 30d", dtone: "text-success" },
    { label: "In moderation", value: k.in_moderation.toLocaleString(), icon: "solar:flag-2-bold", tone: "warning", delta: "▲ 8.1%", sub: "needs attention", dtone: "text-warning" },
    { label: "Featured", value: k.featured.toLocaleString(), icon: "solar:star-bold", tone: "secondary", delta: "▲ 6", sub: "vs prev 30d", dtone: "text-success" },
    { label: "Removed", value: k.removed.toLocaleString(), icon: "solar:trash-bin-trash-bold", tone: "error", delta: "▲ 1.5%", sub: "vs prev 30d", dtone: "text-error" },
    { label: "Views (30d)", value: formatCount(k.views_30d), icon: "solar:eye-bold", tone: "info", delta: "▲ 14.4%", sub: "vs prev 30d", dtone: "text-success" },
  ];

  // ----- charts -----
  const uploadsSeries = [{ name: "Uploads", data: data.uploads.map((u) => u.count) }];
  const uploadsOptions: any = {
    chart: { type: "area", height: 260, fontFamily: "inherit", foreColor: "#8b98a9", toolbar: { show: false }, animations: { speed: 500 } },
    colors: ["#00A1FF"],
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 2.5 },
    fill: { type: "gradient", gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0, stops: [0, 95] } },
    grid: { borderColor: "rgba(136,152,169,0.15)", strokeDashArray: 4, padding: { left: 8, right: 8 } },
    xaxis: { categories: data.uploads.map((u) => u.label), tickAmount: 6, axisBorder: { show: false }, axisTicks: { show: false }, labels: { style: { fontSize: "11px" } } },
    yaxis: { labels: { formatter: (v: number) => (v >= 1000 ? (v / 1000).toFixed(1) + "k" : String(v)), style: { fontSize: "11px" } } },
    tooltip: { theme: "dark" },
  };

  const statusKeys = Object.keys(data.by_status);
  const statusVals = statusKeys.map((s) => (data.by_status as any)[s] as number);
  const donutOptions: any = {
    chart: { type: "donut", fontFamily: "inherit" },
    labels: statusKeys.map((s) => formatStatusLabel(s)),
    colors: statusKeys.map((s) => STATUS_COLORS[s] || "#7b8893"),
    stroke: { width: 2, colors: ["#1a2537"] },
    legend: { show: false },
    dataLabels: { enabled: false },
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
          labels: {
            show: true,
            total: { show: true, label: "Total", fontSize: "12px", color: "#8b98a9", formatter: () => formatCount(k.total) },
            value: { fontSize: "20px", fontWeight: 800, color: "#adb0bb", formatter: (v: string) => formatCount(Number(v)) },
          },
        },
      },
    },
    tooltip: { theme: "dark", y: { formatter: (v: number) => v.toLocaleString() } },
  };

  const t = data.transcode;
  const ringStyle: CSSProperties = {
    background: `conic-gradient(#00ceb6 0 ${t.complete}%, #FFB900 ${t.complete}% ${t.complete + t.pending}%, #FF6692 ${t.complete + t.pending}% 100%)`,
    WebkitMask: "radial-gradient(circle 33px at center, transparent 98%, #000 100%)",
    mask: "radial-gradient(circle 33px at center, transparent 98%, #000 100%)",
  };

  const catItems = [
    { n: data.catalog.sounds, l: "Sounds", icon: "solar:music-note-2-bold", tone: "secondary" },
    { n: data.catalog.filters, l: "Filters", icon: "solar:tuning-2-bold", tone: "primary" },
    { n: data.catalog.templates, l: "Templates", icon: "solar:widget-5-bold", tone: "info" },
    { n: data.catalog.stickers, l: "Stickers", icon: "solar:sticker-smile-circle-2-bold", tone: "warning" },
    { n: data.catalog.fonts, l: "Fonts", icon: "solar:text-bold", tone: "success" },
    { n: data.catalog.colours, l: "Colours", icon: "solar:palette-2-bold", tone: "error" },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h4 className="text-2xl font-extrabold tracking-tight">VFlix Overview</h4>
          <p className="text-darklink text-sm mt-0.5">
            Everything happening across VillageSquare&apos;s short-form video — at a glance.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-darklink border border-dashed border-ld rounded-full px-3 py-1">
          ◔ Mock data · last 30 days
        </span>
      </div>

      {/* segment quick-nav */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-5">
        {segs.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="flex items-center gap-3 bg-white dark:bg-darkgray rounded-tw border border-ld p-3.5 transition hover:border-primary hover:-translate-y-0.5"
          >
            <span className={`size-9 rounded-md grid place-items-center shrink-0 ${TONE[s.tone]}`}>
              <Icon icon={s.icon} height={19} />
            </span>
            <span className="min-w-0">
              <span className="block text-[13px] font-semibold leading-tight">{s.label}</span>
              <span className="block text-[11px] text-darklink truncate">{s.sub}</span>
            </span>
            <Icon icon="solar:alt-arrow-right-linear" height={16} className="ml-auto text-darklink shrink-0" />
          </Link>
        ))}
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-5">
        {kpis.map((kp) => (
          <div key={kp.label} className="bg-white dark:bg-darkgray rounded-tw shadow-md dark:shadow-dark-md p-4">
            <span className={`size-10 rounded-md grid place-items-center mb-3 ${TONE[kp.tone]}`}>
              <Icon icon={kp.icon} height={21} />
            </span>
            <div className="text-[22px] font-extrabold tracking-tight tabular-nums leading-none">{kp.value}</div>
            <div className="text-xs text-darklink mt-1">{kp.label}</div>
            <div className={`text-[11.5px] font-semibold mt-2 ${kp.dtone}`}>
              {kp.delta} <span className="text-darklink font-medium">{kp.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* uploads + status */}
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-8">
          <CardBox className="h-full">
            <div>
              <div className="flex items-center justify-between gap-3 mb-1">
                <h5 className="text-[15px] font-bold tracking-tight">Uploads</h5>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-darklink">Last 30 days</span>
                  <span className="text-lg font-bold tabular-nums">
                    {data.uploads_total.toLocaleString()}{" "}
                    <span className="text-xs text-success font-semibold">▲ {data.uploads_delta_pct}%</span>
                  </span>
                </div>
              </div>
              <Chart options={uploadsOptions} series={uploadsSeries} type="area" height={260} />
            </div>
          </CardBox>
        </div>
        <div className="col-span-12 lg:col-span-4">
          <CardBox className="h-full">
            <div>
              <SectionTitle title="Status breakdown" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-center">
                <Chart options={donutOptions} series={statusVals} type="donut" height={200} />
                <div className="flex flex-col gap-2 justify-center">
                  {statusKeys.map((s) => (
                    <div key={s} className="flex items-center gap-2 text-[12.5px]">
                      <span className="size-2.5 rounded-sm shrink-0" style={{ background: STATUS_COLORS[s] || "#7b8893" }} />
                      <span className="text-darklink">{formatStatusLabel(s)}</span>
                      <span className="ml-auto font-bold tabular-nums">{formatCount((data.by_status as any)[s])}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardBox>
        </div>
      </div>

      {/* moderation + transcode + creators */}
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-5">
          <CardBox className="h-full">
            <div>
              <SectionTitle title="Moderation queue" href="/dashboards/vflix/moderation" cta="Open queue" />
              <div className="flex items-center gap-4 p-3.5 rounded-tw bg-lightwarning mb-3.5">
                <div className="text-[28px] font-extrabold text-warning leading-none tabular-nums">
                  {data.moderation.open.toLocaleString()}
                </div>
                <div>
                  <div className="text-[13px] font-semibold">videos awaiting review</div>
                  <div className="text-[11.5px] text-darklink">
                    {data.moderation.reported} reported · {data.moderation.flagged} flagged · newest first
                  </div>
                </div>
              </div>
              <div className="flex flex-col">
                {data.moderation.items.map((v, i) => (
                  <div
                    key={v.uuid}
                    className={`flex items-center gap-3 py-2.5 ${i > 0 ? "border-t border-ld" : ""}`}
                  >
                    <div className="relative w-10 h-[52px] rounded-md overflow-hidden bg-muted dark:bg-dark shrink-0">
                      {v.media?.[0]?.thumbnail && (
                        <Image src={v.media[0].thumbnail} alt="" fill className="object-cover" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-semibold truncate">{v.caption || "Untitled"}</div>
                      <div className="text-[11.5px] text-darklink truncate">
                        @{v.creator.username} · {v.report_count} reports
                      </div>
                    </div>
                    <VflixStatusBadge status={v.status} />
                  </div>
                ))}
              </div>
            </div>
          </CardBox>
        </div>

        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <CardBox className="h-full">
            <div>
              <SectionTitle title="Transcode health" href="/dashboards/vflix/pipeline" cta="Pipeline" />
              <div className="flex items-center gap-4">
                <div className="size-[104px] rounded-full shrink-0" style={ringStyle} aria-hidden />
                <div className="flex flex-col gap-2.5 flex-1">
                  <div className="flex items-center gap-2 text-[12.5px]">
                    <span className="size-2.5 rounded-sm bg-success" /> Complete
                    <span className="ml-auto font-bold tabular-nums">{t.complete}%</span>
                  </div>
                  <div className="flex items-center gap-2 text-[12.5px]">
                    <span className="size-2.5 rounded-sm bg-warning" /> Pending
                    <span className="ml-auto font-bold tabular-nums">{t.pending}%</span>
                  </div>
                  <div className="flex items-center gap-2 text-[12.5px]">
                    <span className="size-2.5 rounded-sm bg-error" /> Failed
                    <span className="ml-auto font-bold tabular-nums">{t.failed}%</span>
                  </div>
                  <div className="text-[11.5px] text-darklink mt-0.5">HLS pipeline · last 24h</div>
                </div>
              </div>
            </div>
          </CardBox>
        </div>

        <div className="col-span-12 md:col-span-6 lg:col-span-4">
          <CardBox className="h-full">
            <div>
              <SectionTitle title="Top creators" href="/dashboards/vflix/creators" cta="All creators" />
              <div className="flex flex-col">
                {data.top_creators.map((c, i) => (
                  <div key={c.creator.uuid} className={`flex items-center gap-3 py-2.5 ${i > 0 ? "border-t border-ld" : ""}`}>
                    <div className="relative size-9 rounded-full overflow-hidden shrink-0 bg-muted dark:bg-dark">
                      {c.creator.profile_picture && (
                        <Image src={c.creator.profile_picture} alt={c.creator.name} fill className="object-cover" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-semibold truncate flex items-center gap-2">
                        {c.creator.name}
                        {c.strikes > 0 && (
                          <span className="badge text-[10px] font-semibold px-2 py-0.5 rounded-full bg-lighterror text-error">
                            {c.strikes} strikes
                          </span>
                        )}
                      </div>
                      <div className="text-[11.5px] text-darklink truncate">@{c.creator.username} · {c.videos} videos</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[13px] font-bold tabular-nums">{formatCount(c.views)}</div>
                      <div className="text-[11px] text-darklink">views</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardBox>
        </div>
      </div>

      {/* top videos + top sounds + catalog */}
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-5">
          <CardBox className="h-full">
            <div>
              <SectionTitle title="Top videos" sub="· this week" href="/dashboards/vflix/videos" cta="Videos" />
              <div className="flex flex-col">
                {data.top_videos.map((v, i) => (
                  <div key={v.uuid} className={`flex items-center gap-3 py-2.5 ${i > 0 ? "border-t border-ld" : ""}`}>
                    <div className="relative w-10 h-[52px] rounded-md overflow-hidden bg-muted dark:bg-dark shrink-0">
                      {v.media?.[0]?.thumbnail && (
                        <Image src={v.media[0].thumbnail} alt="" fill className="object-cover" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-semibold truncate">{v.caption || "Untitled"}</div>
                      <div className="text-[11.5px] text-darklink truncate">@{v.creator.username}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[13px] font-bold tabular-nums">{formatCount(v.views_count)}</div>
                      <div className="text-[11px] text-darklink">views</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardBox>
        </div>

        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <CardBox className="h-full">
            <div>
              <SectionTitle title="Top sounds" href="/dashboards/vflix/catalog/sounds" cta="Catalog" />
              <div className="flex flex-col">
                {data.top_sounds.map((s, i) => (
                  <div key={s.id} className={`flex items-center gap-3 py-2.5 ${i > 0 ? "border-t border-ld" : ""}`}>
                    <span className="size-9 rounded-md grid place-items-center shrink-0 bg-lightsecondary text-secondary">
                      <Icon icon="solar:music-note-2-bold" height={18} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-semibold truncate">{s.name}</div>
                      <div className="text-[11.5px] text-darklink truncate">{s.tag}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[13px] font-bold tabular-nums">{formatCount(s.uses)}</div>
                      <div className="text-[11px] text-darklink">uses</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardBox>
        </div>

        <div className="col-span-12 md:col-span-6 lg:col-span-4">
          <CardBox className="h-full">
            <div>
              <SectionTitle title="Catalog snapshot" href="/dashboards/vflix/catalog" cta="Manage" />
              <div className="grid grid-cols-3 gap-3">
                {catItems.map((c) => (
                  <div key={c.l} className="bg-lightgray dark:bg-dark border border-ld rounded-md p-3">
                    <span className={`size-8 rounded-md grid place-items-center mb-2 ${TONE[c.tone]}`}>
                      <Icon icon={c.icon} height={17} />
                    </span>
                    <div className="text-lg font-extrabold tabular-nums leading-none">{c.n.toLocaleString()}</div>
                    <div className="text-[11.5px] text-darklink mt-0.5">{c.l}</div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-3.5 p-3 rounded-md bg-lightwarning text-warning text-[12.5px] font-semibold">
                <Icon icon="solar:info-circle-bold" height={18} />
                {data.catalog.pending_templates} templates awaiting review
                <Link href="/dashboards/vflix/catalog/templates?status=pending" className="ml-auto text-warning hover:underline">Review →</Link>
              </div>
            </div>
          </CardBox>
        </div>
      </div>
    </div>
  );
};

export default OverviewContent;

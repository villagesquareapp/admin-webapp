"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import CardBox from "@/app/components/shared/CardBox";
import { formatCount } from "../vflixStatus";
import { KpiTile, PanelTitle, BarRow } from "../VflixUi";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const AnalyticsContent = ({ data }: { data: IVflixAnalytics | null }) => {
  if (!data) {
    return (
      <CardBox>
        <div className="py-16 text-center text-darklink">Analytics unavailable.</div>
      </CardBox>
    );
  }
  const k = data.kpis;

  const trendOptions: any = {
    chart: { type: "area", height: 280, fontFamily: "inherit", foreColor: "#8b98a9", toolbar: { show: false } },
    colors: ["#00A1FF"],
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 2.5 },
    fill: { type: "gradient", gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0, stops: [0, 95] } },
    grid: { borderColor: "rgba(136,152,169,0.15)", strokeDashArray: 4 },
    xaxis: { categories: data.trend.map((t) => t.label), tickAmount: 6, axisBorder: { show: false }, axisTicks: { show: false }, labels: { style: { fontSize: "11px" } } },
    yaxis: { labels: { formatter: (v: number) => (v >= 1e6 ? (v / 1e6).toFixed(1) + "M" : (v / 1000).toFixed(0) + "k"), style: { fontSize: "11px" } } },
    tooltip: { theme: "dark", y: { formatter: (v: number) => v.toLocaleString() } },
  };

  const engOptions: any = {
    chart: { type: "line", height: 200, fontFamily: "inherit", foreColor: "#8b98a9", toolbar: { show: false } },
    colors: ["#8965E5"],
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 2.5 },
    grid: { borderColor: "rgba(136,152,169,0.15)", strokeDashArray: 4 },
    xaxis: { categories: data.trend.map((t) => t.label), tickAmount: 5, axisBorder: { show: false }, axisTicks: { show: false }, labels: { style: { fontSize: "10px" } } },
    yaxis: { labels: { formatter: (v: number) => v.toFixed(1) + "%", style: { fontSize: "10px" } } },
    tooltip: { theme: "dark", y: { formatter: (v: number) => v.toFixed(1) + "%" } },
  };

  const mixOptions: any = {
    chart: { type: "donut", fontFamily: "inherit" },
    labels: ["Video", "Carousel"],
    colors: ["#00A1FF", "#8965E5"],
    stroke: { width: 2, colors: ["#1a2537"] },
    legend: { show: false },
    dataLabels: { enabled: false },
    plotOptions: { pie: { donut: { size: "70%", labels: { show: true, total: { show: true, label: "Video", fontSize: "12px", color: "#8b98a9", formatter: () => data.content_mix.video + "%" }, value: { fontSize: "20px", fontWeight: 800, color: "#adb0bb", formatter: (v: string) => v + "%" } } } } },
    tooltip: { theme: "dark", y: { formatter: (v: number) => v + "%" } },
  };

  const geoMax = Math.max(...data.geography.map((g) => g.value));

  return (
    <div className="flex flex-col gap-30">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-30">
        <KpiTile label="Views (30d)" value={formatCount(k.views)} icon="solar:eye-bold" tone="primary" delta="▲ 14.4%" sub="vs prev 30d" />
        <KpiTile label="Watch-through" value={`${k.watch_through}%`} icon="solar:play-circle-bold" tone="success" delta="▲ 2.1%" sub="vs prev 30d" />
        <KpiTile label="Avg watch time" value={`${k.avg_watch_seconds}s`} icon="solar:clock-circle-bold" tone="info" delta="▲ 0.8s" sub="vs prev 30d" />
        <KpiTile label="Engagement rate" value={`${k.engagement_rate}%`} icon="solar:heart-bold" tone="secondary" delta="▲ 0.6%" sub="vs prev 30d" />
      </div>

      <div className="grid grid-cols-12 gap-30">
        <div className="col-span-12 lg:col-span-8">
          <CardBox className="h-full">
            <div>
              <PanelTitle title="Views" sub="· last 30 days" />
              <Chart options={trendOptions} series={[{ name: "Views", data: data.trend.map((t) => t.views) }]} type="area" height={280} />
            </div>
          </CardBox>
        </div>
        <div className="col-span-12 lg:col-span-4">
          <CardBox className="h-full">
            <div>
              <PanelTitle title="Content mix" />
              <Chart options={mixOptions} series={[data.content_mix.video, data.content_mix.carousel]} type="donut" height={230} />
              <div className="flex justify-center gap-5 mt-2 text-[12.5px]">
                <span className="flex items-center gap-2"><span className="size-2.5 rounded-sm bg-primary" /> Video {data.content_mix.video}%</span>
                <span className="flex items-center gap-2"><span className="size-2.5 rounded-sm bg-secondary" /> Carousel {data.content_mix.carousel}%</span>
              </div>
            </div>
          </CardBox>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-30">
        <div className="col-span-12 md:col-span-6 lg:col-span-4">
          <CardBox className="h-full">
            <div>
              <PanelTitle title="Top countries" sub="· by views" />
              <div className="flex flex-col gap-3 mt-1">
                {data.geography.map((g) => (
                  <BarRow key={g.name} label={g.name} value={g.value} max={geoMax} display={formatCount(g.value)} />
                ))}
              </div>
            </div>
          </CardBox>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-4">
          <CardBox className="h-full">
            <div>
              <PanelTitle title="Retention" sub="· watch funnel" />
              <div className="flex flex-col gap-3 mt-1">
                {data.retention.map((r) => (
                  <BarRow key={r.name} label={r.name} value={r.value} max={100} display={`${r.value}%`} color="var(--color-success)" />
                ))}
              </div>
            </div>
          </CardBox>
        </div>
        <div className="col-span-12 lg:col-span-4">
          <CardBox className="h-full">
            <div>
              <PanelTitle title="Engagement rate" sub="· 30d" />
              <Chart options={engOptions} series={[{ name: "Engagement", data: data.trend.map((t) => t.engagement) }]} type="line" height={200} />
            </div>
          </CardBox>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-30">
        <div className="col-span-12 lg:col-span-5">
          <CardBox className="h-full">
            <div>
              <PanelTitle title="Top videos" />
              <div className="flex flex-col">
                {data.top_videos.map((v, i) => (
                  <div key={v.uuid} className={`flex items-center gap-3 py-2.5 ${i > 0 ? "border-t border-ld" : ""}`}>
                    <span className="w-5 text-center text-sm font-bold text-darklink shrink-0">{i + 1}</span>
                    <div className="relative w-9 h-12 rounded-md overflow-hidden bg-muted dark:bg-dark shrink-0">
                      {v.media?.[0]?.thumbnail && <Image src={v.media[0].thumbnail} alt="" fill className="object-cover" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-semibold truncate">{v.caption || "Untitled"}</div>
                      <div className="text-[11.5px] text-darklink truncate">@{v.creator.username}</div>
                    </div>
                    <div className="text-[13px] font-bold tabular-nums shrink-0">{formatCount(v.views_count)}</div>
                  </div>
                ))}
              </div>
            </div>
          </CardBox>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-4">
          <CardBox className="h-full">
            <div>
              <PanelTitle title="Top creators" />
              <div className="flex flex-col">
                {data.top_creators.map((c, i) => (
                  <div key={c.creator.uuid} className={`flex items-center gap-3 py-2.5 ${i > 0 ? "border-t border-ld" : ""}`}>
                    <span className="w-5 text-center text-sm font-bold text-darklink shrink-0">{i + 1}</span>
                    <div className="relative size-9 rounded-full overflow-hidden bg-muted dark:bg-dark shrink-0">
                      {c.creator.profile_picture && <Image src={c.creator.profile_picture} alt={c.creator.name} fill className="object-cover" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-semibold truncate">{c.creator.name}</div>
                      <div className="text-[11.5px] text-darklink truncate">@{c.creator.username}</div>
                    </div>
                    <div className="text-[13px] font-bold tabular-nums shrink-0">{formatCount(c.views)}</div>
                  </div>
                ))}
              </div>
            </div>
          </CardBox>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <CardBox className="h-full">
            <div>
              <PanelTitle title="Top sounds" />
              <div className="flex flex-col">
                {data.top_sounds.map((s, i) => (
                  <div key={s.id} className={`flex items-center gap-3 py-2.5 ${i > 0 ? "border-t border-ld" : ""}`}>
                    <span className="w-5 text-center text-sm font-bold text-darklink shrink-0">{i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-semibold truncate">{s.name}</div>
                      <div className="text-[11.5px] text-darklink truncate">{s.tag}</div>
                    </div>
                    <div className="text-[13px] font-bold tabular-nums shrink-0">{formatCount(s.uses)}</div>
                  </div>
                ))}
              </div>
            </div>
          </CardBox>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsContent;

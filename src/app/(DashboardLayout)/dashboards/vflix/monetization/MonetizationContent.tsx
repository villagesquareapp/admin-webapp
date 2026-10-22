"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import CardBox from "@/app/components/shared/CardBox";
import { formatCount } from "../vflixStatus";
import { KpiTile, PanelTitle } from "../VflixUi";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const MonetizationContent = ({ data }: { data: IVflixMonetization | null }) => {
  if (!data) return <CardBox><div className="py-16 text-center text-darklink">Monetization unavailable.</div></CardBox>;
  const k = data.kpis;

  const trendOptions: any = {
    chart: { type: "area", height: 260, fontFamily: "inherit", foreColor: "#8b98a9", toolbar: { show: false } },
    colors: ["#FFB900"],
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 2.5 },
    fill: { type: "gradient", gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0, stops: [0, 95] } },
    grid: { borderColor: "rgba(136,152,169,0.15)", strokeDashArray: 4 },
    xaxis: { categories: data.gifts_trend.map((t) => t.name), tickAmount: 6, axisBorder: { show: false }, axisTicks: { show: false }, labels: { style: { fontSize: "11px" } } },
    yaxis: { labels: { formatter: (v: number) => (v >= 1000 ? (v / 1000).toFixed(1) + "k" : String(v)), style: { fontSize: "11px" } } },
    tooltip: { theme: "dark", y: { formatter: (v: number) => `${v.toLocaleString()} gifts` } },
  };

  return (
    <div className="flex flex-col gap-30">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-30">
        <KpiTile label="Gifts (30d)" value={formatCount(k.total_gifts)} icon="solar:gift-bold" tone="primary" delta="▲ 9.7%" sub="vs prev 30d" />
        <KpiTile label="Coin value" value={formatCount(k.coin_value)} icon="solar:dollar-minimalistic-bold" tone="warning" delta="▲ 11.2%" sub="coins gifted" />
        <KpiTile label="Paid out" value={formatCount(k.paid_out)} icon="solar:wallet-money-bold" tone="success" sub="to creators" delta="▲ 6.4%" />
        <KpiTile label="Top earner" value={k.top_earner} icon="solar:crown-bold" tone="secondary" />
      </div>

      <CardBox>
        <div>
          <PanelTitle title="Gifts" sub="· last 30 days" />
          <Chart options={trendOptions} series={[{ name: "Gifts", data: data.gifts_trend.map((t) => t.value) }]} type="area" height={260} />
        </div>
      </CardBox>

      <div className="grid grid-cols-12 gap-30">
        <div className="col-span-12 lg:col-span-6">
          <CardBox className="h-full">
            <div>
              <PanelTitle title="Top earning creators" />
              <div className="flex flex-col">
                {data.top_earners.map((e, i) => (
                  <div key={e.creator.uuid} className={`flex items-center gap-3 py-2.5 ${i > 0 ? "border-t border-ld" : ""}`}>
                    <span className="w-5 text-center text-sm font-bold text-darklink shrink-0">{i + 1}</span>
                    <div className="relative size-9 rounded-full overflow-hidden bg-muted dark:bg-dark shrink-0">
                      {e.creator.profile_picture && <Image src={e.creator.profile_picture} alt={e.creator.name} fill className="object-cover" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-semibold truncate">{e.creator.name}</div>
                      <div className="text-[11.5px] text-darklink truncate">@{e.creator.username} · {formatCount(e.gifts)} gifts</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[13px] font-bold tabular-nums">{formatCount(e.coins)}</div>
                      <div className="text-[11px] text-darklink">coins</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardBox>
        </div>
        <div className="col-span-12 lg:col-span-6">
          <CardBox className="h-full">
            <div>
              <PanelTitle title="Top earning videos" />
              <div className="flex flex-col">
                {data.top_earning_videos.map((e, i) => (
                  <div key={e.video.uuid} className={`flex items-center gap-3 py-2.5 ${i > 0 ? "border-t border-ld" : ""}`}>
                    <span className="w-5 text-center text-sm font-bold text-darklink shrink-0">{i + 1}</span>
                    <div className="relative w-9 h-12 rounded-md overflow-hidden bg-muted dark:bg-dark shrink-0">
                      {e.video.media?.[0]?.thumbnail && <Image src={e.video.media[0].thumbnail} alt="" fill className="object-cover" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-semibold truncate">{e.video.caption || "Untitled"}</div>
                      <div className="text-[11.5px] text-darklink truncate">@{e.video.creator.username} · {formatCount(e.gifts)} gifts</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[13px] font-bold tabular-nums">{formatCount(e.coins)}</div>
                      <div className="text-[11px] text-darklink">coins</div>
                    </div>
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

export default MonetizationContent;

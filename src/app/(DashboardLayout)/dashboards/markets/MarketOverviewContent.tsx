"use client";

import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Icon } from "@iconify/react";
import { formatDistanceToNow } from "date-fns";
import CardBox from "@/app/components/shared/CardBox";
import KpiCard from "@/app/components/shared/KpiCard";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
const fmt = (n: number) => new Intl.NumberFormat("en", { notation: "compact" }).format(n || 0);
const money = (p: IMarketProductLite) =>
  p.price == null ? "—" : `${p.currency?.symbol || ""}${new Intl.NumberFormat("en").format(p.price)}`;

const kpiCards = (k: IMarketOverview["kpis"]) => [
  { label: "Total products", value: k.total_products, icon: "solar:box-linear", tone: "bg-lightprimary text-primary" },
  { label: "New today", value: k.today_products, icon: "solar:box-minimalistic-linear", tone: "bg-lightsuccess text-success" },
  { label: "New (7d)", value: k.new_7d_products, icon: "solar:calendar-add-linear", tone: "bg-lightsecondary text-secondary" },
  { label: "Total shops", value: k.total_shops, icon: "solar:shop-2-linear", tone: "bg-lightprimary text-primary" },
  { label: "Featured", value: k.featured, icon: "solar:star-linear", tone: "bg-lightwarning text-warning" },
  { label: "Out of stock", value: k.out_of_stock, icon: "solar:bag-cross-linear", tone: "bg-lightwarning text-warning" },
  { label: "Categories", value: k.total_categories, icon: "solar:widget-5-linear", tone: "bg-lightinfo text-info" },
  { label: "Reviews", value: k.total_reviews, icon: "solar:star-shine-linear", tone: "bg-lightinfo text-info" },
  { label: "Banned shops", value: k.banned_shops, icon: "solar:shop-minimalistic-linear", tone: "bg-lighterror text-error" },
  { label: "Taken down", value: k.taken_down, icon: "solar:trash-bin-trash-linear", tone: "bg-lighterror text-error" },
  { label: "Open reports", value: k.open_reports, icon: "solar:flag-2-linear", tone: "bg-lighterror text-error" },
];

const ProductRow = ({ p, meta }: { p: IMarketProductLite; meta?: "reports" | "time" }) => (
  <Link href={`/dashboards/markets/products/${p.uuid}`} className="flex items-center gap-3 py-2.5">
    <div className="relative size-10 rounded-lg overflow-hidden bg-lightgray dark:bg-dark shrink-0">
      {p.image && <Image src={p.image} alt="" fill className="object-cover" />}
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-sm font-medium truncate flex items-center gap-1">
        {p.title}
        {p.featured && <Icon icon="solar:star-bold" className="text-warning" height={13} />}
        {p.taken_down && <Icon icon="solar:trash-bin-trash-bold" className="text-error" height={13} />}
      </p>
      <p className="text-xs text-darklink truncate">{p.shop?.name || "—"} · {p.category?.name || "Uncategorised"}</p>
    </div>
    {meta === "reports" ? (
      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-lighterror text-error shrink-0">{p.report_count || 0} reports</span>
    ) : (
      <span className="text-sm font-semibold tabular-nums shrink-0">{money(p)}</span>
    )}
  </Link>
);

const MarketOverviewContent = ({ data }: { data: IMarketOverview | null }) => {
  if (!data) {
    return <CardBox><div className="py-16 text-center text-darklink">Marketplace overview is unavailable right now.</div></CardBox>;
  }
  const { kpis, by_category, top_shops, trends, recent_products, reported_products } = data;
  const maxCat = Math.max(1, ...by_category.map((c) => c.count));

  const chartOptions: any = {
    chart: { type: "area", height: 240, fontFamily: "inherit", foreColor: "#adb0bb", toolbar: { show: false } },
    colors: ["#00A1FF"],
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 2.5 },
    fill: { type: "gradient", gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.02, stops: [0, 90] } },
    grid: { borderColor: "rgba(173,181,189,0.18)", strokeDashArray: 4 },
    xaxis: { categories: trends.map((t) => t.date), type: "datetime", labels: { format: "MMM d", style: { fontSize: "11px" } }, axisBorder: { show: false }, axisTicks: { show: false }, tooltip: { enabled: false } },
    yaxis: { labels: { formatter: (v: number) => fmt(Math.round(v)), style: { fontSize: "11px" } }, min: 0 },
    tooltip: { theme: "dark", x: { format: "MMM d, yyyy" } },
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4">
        {kpiCards(kpis).map((c) => (
          <KpiCard key={c.label} icon={c.icon} value={c.value} label={c.label} tone={c.tone} />
        ))}
      </div>

      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-8">
          <CardBox>
            <div className="flex items-center justify-between mb-1">
              <h5 className="text-sm font-semibold text-dark dark:text-white">New products · last 14 days</h5>
              <Link href="/dashboards/markets/products" className="text-primary text-sm font-semibold">All products</Link>
            </div>
            <Chart options={chartOptions} series={[{ name: "Products", data: trends.map((t) => t.products) }]} type="area" height={240} width="100%" />
          </CardBox>
        </div>
        <div className="col-span-12 lg:col-span-4">
          <CardBox>
            <h5 className="text-sm font-semibold text-dark dark:text-white mb-3">Top shops</h5>
            {top_shops.length ? (
              <div className="flex flex-col divide-y divide-border dark:divide-darkborder">
                {top_shops.map((s) => (
                  <Link key={s.uuid} href={`/dashboards/markets/shops/${s.uuid}`} className="flex items-center justify-between py-2.5">
                    <span className="text-sm font-medium truncate">{s.name}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-lightprimary text-primary shrink-0">{fmt(s.products)} items</span>
                  </Link>
                ))}
              </div>
            ) : <div className="py-6 text-center text-sm text-darklink">No shops yet.</div>}
          </CardBox>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-5">
          <CardBox>
            <h5 className="text-sm font-semibold text-dark dark:text-white mb-3">Products by category</h5>
            {by_category.length ? (
              <div className="flex flex-col gap-2.5">
                {by_category.map((c) => (
                  <div key={c.name} className="grid grid-cols-[120px_1fr_44px] items-center gap-3">
                    <span className="text-xs text-darklink truncate">{c.name}</span>
                    <span className="h-2 rounded-full bg-lightgray dark:bg-dark overflow-hidden">
                      <span className="block h-full rounded-full bg-primary" style={{ width: `${(c.count / maxCat) * 100}%` }} />
                    </span>
                    <span className="text-xs font-semibold text-right tabular-nums">{fmt(c.count)}</span>
                  </div>
                ))}
              </div>
            ) : <div className="py-6 text-center text-sm text-darklink">No categories.</div>}
          </CardBox>
        </div>
        <div className="col-span-12 lg:col-span-7">
          <CardBox>
            <div className="flex items-center justify-between mb-3">
              <h5 className="text-sm font-semibold text-dark dark:text-white">Reported products</h5>
              <Link href="/dashboards/markets/reports" className="text-primary text-sm font-semibold">All reports</Link>
            </div>
            {reported_products.length ? (
              <div className="flex flex-col divide-y divide-border dark:divide-darkborder">
                {reported_products.map((p) => <ProductRow key={p.uuid} p={p} meta="reports" />)}
              </div>
            ) : <div className="py-6 text-center text-sm text-darklink">No products with open reports.</div>}
          </CardBox>
        </div>
      </div>

      <CardBox>
        <div className="flex items-center justify-between mb-3">
          <h5 className="text-sm font-semibold text-dark dark:text-white">Recent products</h5>
          <Link href="/dashboards/markets/products" className="text-primary text-sm font-semibold">All products</Link>
        </div>
        {recent_products.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            {recent_products.map((p) => <ProductRow key={p.uuid} p={p} meta="time" />)}
          </div>
        ) : <div className="py-6 text-center text-sm text-darklink">No products yet.</div>}
      </CardBox>
    </div>
  );
};

export default MarketOverviewContent;

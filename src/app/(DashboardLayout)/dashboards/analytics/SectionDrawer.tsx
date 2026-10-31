"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Drawer } from "flowbite-react";
import { Icon } from "@iconify/react";
import { baseChart, Change, CHART_COLORS, compact, day, num, pct, sectionMeta } from "./analyticsUi";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const Fact = ({ label, value, sub }: { label: string; value: React.ReactNode; sub?: React.ReactNode }) => (
  <div className="rounded-xl border border-ld px-3 py-2.5">
    <p className="text-[11px] text-darklink">{label}</p>
    <div className="text-sm font-semibold mt-0.5 tabular-nums">{value}</div>
    {sub && <div className="text-[11px] mt-0.5">{sub}</div>}
  </div>
);

const SectionDrawer = ({
  stats,
  range,
  onClose,
}: {
  stats: IAnalyticsSectionStats | null;
  range: IAnalyticsRange;
  onClose: () => void;
}) => {
  const m = stats ? sectionMeta(stats.section) : null;
  const options = baseChart({
    chart: { type: "area", height: 220 },
    colors: [CHART_COLORS.primary],
    stroke: { curve: "smooth", width: 2 },
    fill: { type: "gradient", gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.05, stops: [0, 90] } },
    legend: { show: false },
    xaxis: {
      categories: stats?.daily.map((d) => d.day) ?? [],
      type: "datetime",
      labels: { format: "MMM d", style: { fontSize: "11px" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
      tooltip: { enabled: false },
    },
    yaxis: { min: 0, labels: { formatter: (v: number) => compact(Math.round(v)), style: { fontSize: "11px" } } },
    tooltip: { theme: "dark", x: { format: "ddd, MMM d" }, y: { formatter: (v: number) => num(v) } },
  });

  return (
    <Drawer open={!!stats} onClose={onClose} position="right" className="z-[100] dark:bg-darkgray w-full max-w-[480px] p-0">
      {stats && m && (
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-ld">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className={`size-9 rounded-lg grid place-items-center shrink-0 ${m.tone}`}>
                <Icon icon={m.icon} height={19} />
              </span>
              <div className="min-w-0">
                <h5 className="text-base font-semibold truncate">{m.label}</h5>
                <p className="text-[11px] text-darklink">
                  {day(range.from)} – {day(range.to, "MMM d, yyyy")}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-full text-darklink hover:bg-lightgray dark:hover:bg-white/5" aria-label="Close">
              <Icon icon="solar:close-circle-linear" height={22} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-2.5">
              <Fact
                label={`Active people · ${range.days} days`}
                value={num(stats.active_users)}
                sub={<Change now={stats.active_users} before={stats.previous_active_users} />}
              />
              <Fact label="Share of everyone active" value={pct(stats.share_of_active, 1)} />
              <Fact label="Average per day" value={num(stats.dau_avg)} />
              <Fact label="Weekly · monthly" value={`${num(stats.wau)} · ${num(stats.mau)}`} />
            </div>

            <div className="rounded-xl border border-ld p-4">
              <p className="text-sm font-semibold">Daily active people</p>
              <div className="-mx-2">
                <Chart options={options} series={[{ name: "Active people", data: stats.daily.map((d) => d.active) }]} type="area" height={220} width="100%" />
              </div>
            </div>

            <div className="rounded-xl border border-ld p-4">
              <p className="text-sm font-semibold">Did they come back?</p>
              <p className="text-[11px] text-darklink mb-3">
                Of people who first used {m.short} in the last 90 days, how many used it again.
              </p>
              <div className="grid grid-cols-3 gap-2 text-center">
                {([
                  ["Next day", stats.d1],
                  ["Within 7 days", stats.d7],
                  ["Within 30 days", stats.d30],
                ] as const).map(([label, rate]) => (
                  <div key={label} className="rounded-lg bg-lightgray dark:bg-white/5 py-2.5">
                    <p className="text-lg font-bold tabular-nums">{pct(rate)}</p>
                    <p className="text-[11px] text-darklink">{label}</p>
                  </div>
                ))}
              </div>
              {(stats.d1 == null || stats.d7 == null || stats.d30 == null) && (
                <p className="text-[11px] text-darklink mt-2">“—” means not enough people have been around long enough to tell yet.</p>
              )}
            </div>
          </div>

          <div className="px-5 py-4 border-t border-ld">
            <Link
              href={`/dashboards/analytics/retention?section=${stats.section}`}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary"
            >
              <Icon icon="solar:refresh-circle-linear" height={18} /> See {m.short} retention by cohort
              <Icon icon="solar:alt-arrow-right-linear" height={14} />
            </Link>
          </div>
        </div>
      )}
    </Drawer>
  );
};

export default SectionDrawer;

"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Icon } from "@iconify/react";
import CardBox from "@/app/components/shared/CardBox";
import KpiCard from "@/app/components/shared/KpiCard";
import ReusableTable from "@/app/components/shared/ReusableTable";
import { createColumnHelper } from "@/utils/table";
import SectionDrawer from "./SectionDrawer";
import {
  baseChart,
  Change,
  CHART_COLORS,
  compact,
  day,
  LoadFailed,
  NotReady,
  num,
  pct,
  sectionMeta,
  share,
  Sparkline,
  TrackingBanner,
} from "./analyticsUi";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const DailyChart = ({ daily }: { daily: IAnalyticsDay[] }) => {
  const options = baseChart({
    chart: { type: "area", stacked: true, height: 280 },
    colors: [CHART_COLORS.primary, CHART_COLORS.secondary],
    stroke: { curve: "smooth", width: 2 },
    fill: { type: "gradient", gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.05, stops: [0, 90] } },
    xaxis: {
      categories: daily.map((d) => d.day),
      type: "datetime",
      labels: { format: "MMM d", style: { fontSize: "11px" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
      tooltip: { enabled: false },
    },
    yaxis: { min: 0, labels: { formatter: (v: number) => compact(Math.round(v)), style: { fontSize: "11px" } } },
    tooltip: { theme: "dark", shared: true, x: { format: "ddd, MMM d" }, y: { formatter: (v: number) => num(v) } },
  });
  const series = [
    { name: "Returning", data: daily.map((d) => d.returning) },
    { name: "New (signed up that day)", data: daily.map((d) => d.new) },
  ];
  return <Chart options={options} series={series} type="area" height={280} width="100%" />;
};

const FUNNEL_HINT: Record<string, string> = {
  came_back_day_1: "of those who signed up at least a day ago",
  came_back_week_1: "of those who signed up at least a week ago",
};
// Steps that need per-section tracking to count.
const TRACKED_STEPS = ["took_action", "came_back_day_1", "came_back_week_1"];

const Funnel = ({ funnel }: { funnel: IAnalyticsFunnel | null }) => {
  const steps = funnel?.steps ?? [];
  const top = steps[0]?.users ?? 0;
  const ready = funnel?.tracking.ready ?? false;
  return (
    <CardBox>
      <div>
        <h5 className="text-sm font-semibold">Onboarding funnel</h5>
        <p className="text-[11px] text-darklink">People who signed up in this period, step by step.</p>
      </div>
      {!funnel ? (
        <p className="text-sm text-darklink py-4">The funnel didn’t load.</p>
      ) : !top ? (
        <p className="text-sm text-darklink py-4">Nobody signed up in this period.</p>
      ) : (
        <div className="flex flex-col gap-3 mt-1">
          {steps.map((s) => {
            const comeBack = s.key in FUNNEL_HINT;
            const waiting = !ready && TRACKED_STEPS.includes(s.key);
            const early = comeBack && !s.eligible;
            const rate = share(s.users, s.eligible);
            return (
              <div key={s.key}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="truncate">{s.label}</span>
                  {waiting || early ? (
                    <span className="text-xs text-darklink">{waiting ? "Starts with tracking" : "Too early to tell"}</span>
                  ) : (
                    <span className="whitespace-nowrap tabular-nums">
                      <span className="font-semibold">{num(s.users)}</span>
                      {s.key !== "signed_up" && <span className="text-xs text-darklink ms-1.5">{pct(rate)}</span>}
                    </span>
                  )}
                </div>
                <div className="h-2 rounded-full bg-lightgray dark:bg-white/5 mt-1 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${comeBack ? "bg-secondary" : "bg-primary"}`}
                    style={{ width: `${waiting ? 0 : 100 * (comeBack ? rate : share(s.users, top))}%` }}
                  />
                </div>
                {comeBack && !waiting && !early && (
                  <p className="text-[11px] text-darklink mt-0.5">
                    {FUNNEL_HINT[s.key]} ({num(s.eligible)})
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </CardBox>
  );
};

const ReturnRates = ({ s }: { s: IAnalyticsSectionStats }) => (
  <div className="flex items-center gap-1 text-xs tabular-nums">
    {([
      ["1 day", s.d1],
      ["7 days", s.d7],
      ["30 days", s.d30],
    ] as const).map(([label, rate]) => (
      <span
        key={label}
        title={rate == null ? `Not enough people yet to tell (${label})` : `${pct(rate, 1)} came back within ${label}`}
        className={`w-11 text-center rounded-md py-0.5 ${rate == null ? "text-darklink" : "bg-lightprimary text-primary font-semibold"}`}
      >
        {pct(rate)}
      </span>
    ))}
  </div>
);

const OverviewView = ({ overview, funnel }: { overview: IAnalyticsOverview | null; funnel: IAnalyticsFunnel | null }) => {
  const [open, setOpen] = useState<IAnalyticsSectionStats | null>(null);

  if (!overview) return <LoadFailed what="analytics" />;

  const { totals: t, previous: p, tracking, range } = overview;
  const ready = tracking.ready;
  const sections = [...overview.sections].sort((a, b) => b.active_users - a.active_users);

  const col = createColumnHelper<IAnalyticsSectionStats>();
  const columns = [
    col.accessor("section", {
      header: () => <span>Section</span>,
      cell: (info) => {
        const m = sectionMeta(info.getValue());
        return (
          <div className="flex items-center gap-2.5">
            <span className={`size-8 rounded-lg grid place-items-center shrink-0 ${m.tone}`}>
              <Icon icon={m.icon} height={17} />
            </span>
            <span className="text-sm font-medium">{m.label}</span>
          </div>
        );
      },
    }),
    col.accessor("active_users", {
      header: () => <span>Active people</span>,
      cell: (info) => {
        const s = info.row.original;
        return (
          <div>
            <p className="text-sm font-semibold tabular-nums">{num(s.active_users)}</p>
            <p className="text-[11px]">
              <Change now={s.active_users} before={s.previous_active_users} quiet />
            </p>
          </div>
        );
      },
    }),
    col.display({
      id: "dwm",
      header: () => <span title="Average per day · last 7 days · last 30 days">Daily · weekly · monthly</span>,
      cell: (info) => {
        const s = info.row.original;
        return (
          <span className="text-sm tabular-nums">
            {num(Math.round(s.dau_avg))} <span className="text-darklink">·</span> {num(s.wau)} <span className="text-darklink">·</span> {num(s.mau)}
          </span>
        );
      },
    }),
    col.accessor("share_of_active", {
      header: () => <span title="Of everyone active in the app in this period">Share of actives</span>,
      cell: (info) => (
        <div className="flex items-center gap-2 w-32">
          <div className="h-1.5 flex-1 rounded-full bg-lightgray dark:bg-white/5 overflow-hidden">
            <div className="h-full rounded-full bg-primary" style={{ width: `${100 * info.getValue()}%` }} />
          </div>
          <span className="text-xs tabular-nums w-9 text-right">{pct(info.getValue())}</span>
        </div>
      ),
    }),
    col.display({
      id: "returns",
      header: () => (
        <span title="Of people who first used this section in the last 90 days, how many came back to it the next day, within 7 days and within 30 days">
          Came back · 1d / 7d / 30d
        </span>
      ),
      cell: (info) => <ReturnRates s={info.row.original} />,
    }),
    col.display({
      id: "trend",
      header: () => <span>Trend</span>,
      cell: (info) => <Sparkline values={info.row.original.daily.map((d) => d.active)} />,
    }),
  ];

  return (
    <div className="flex flex-col gap-5">
      <TrackingBanner tracking={tracking} from={range.from} />

      {ready ? (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          <KpiCard
            icon="solar:users-group-rounded-bold-duotone"
            value={t.active_users}
            label={`Active people · ${range.days} days`}
            tone="bg-lightprimary text-primary"
            extra={<Change now={t.active_users} before={p.active_users} />}
          />
          <KpiCard
            icon="solar:calendar-date-bold-duotone"
            value={Math.round(t.dau_avg)}
            label={`Avg per day · ${num(t.dau_today)} today`}
            tone="bg-lightprimary text-primary"
            extra={<Change now={t.dau_avg} before={p.dau_avg} />}
          />
          <KpiCard
            icon="solar:calendar-mark-bold-duotone"
            value={t.wau}
            label="Weekly active (last 7 days)"
            tone="bg-lightsecondary text-secondary"
            extra={<Change now={t.wau} before={p.wau} />}
          />
          <KpiCard
            icon="solar:calendar-bold-duotone"
            value={t.mau}
            label="Monthly active (last 30 days)"
            tone="bg-lightsecondary text-secondary"
            extra={<Change now={t.mau} before={p.mau} />}
          />
          <KpiCard
            icon="solar:magnet-bold-duotone"
            value={Math.round(t.stickiness * 100)}
            suffix="%"
            label="Stickiness (daily ÷ monthly)"
            tone="bg-lightinfo text-info"
            extra={<Change now={t.stickiness} before={p.stickiness} kind="points" />}
          />
          <KpiCard
            icon="solar:user-plus-rounded-bold-duotone"
            value={t.new_active}
            label={`New · ${num(t.returning_active)} returning`}
            tone="bg-lightsuccess text-success"
            extra={<Change now={t.new_active} before={p.new_active} />}
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KpiCard icon="solar:users-group-rounded-bold-duotone" value={t.users_total} label="Accounts" tone="bg-lightprimary text-primary" />
          <KpiCard
            icon="solar:user-plus-rounded-bold-duotone"
            value={t.signups}
            label={`Signups · ${range.days} days`}
            tone="bg-lightsuccess text-success"
            extra={<Change now={t.signups} before={p.signups} />}
          />
        </div>
      )}

      <p className="text-xs text-darklink -mt-2 px-1">
        {ready && (
          <>
            {num(t.active_users)} of {num(t.users_total)} accounts ({pct(share(t.active_users, t.users_total), 1)}) were active between{" "}
            {day(range.from)} and {day(range.to)}.{" "}
          </>
        )}
        {num(t.signups)} {t.signups === 1 ? "person" : "people"} signed up in these {range.days} days.
      </p>

      {!ready ? (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <div className="xl:col-span-2">
            <NotReady />
          </div>
          <Funnel funnel={funnel} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            <CardBox className="xl:col-span-2">
              <div>
                <h5 className="text-sm font-semibold">Daily active people</h5>
                <p className="text-[11px] text-darklink">Everyone who opened or used the app each day, split by whether they signed up that day.</p>
              </div>
              <div className="-mx-2">
                <DailyChart daily={overview.daily} />
              </div>
            </CardBox>
            <Funnel funnel={funnel} />
          </div>

          <ReusableTable
            tableData={sections}
            columns={columns}
            tableTitle="Sections"
            compactTitle
            dense
            paginated={false}
            onRowClick={(row) => setOpen(row)}
            extraButtons={<p className="text-xs text-darklink">Click a section for its daily chart and retention.</p>}
          />
        </>
      )}

      <SectionDrawer stats={open} range={range} onClose={() => setOpen(null)} />
    </div>
  );
};

export default OverviewView;

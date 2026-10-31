"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Spinner } from "flowbite-react";
import { Icon } from "@iconify/react";
import { toast } from "sonner";
import CardBox from "@/app/components/shared/CardBox";
import KpiCard from "@/app/components/shared/KpiCard";
import { Button } from "@/app/components/shared/Button";
import { getAudience, getSegments } from "@/app/api/analytics";
import SuiteHeader from "../../business-suite/SuiteHeader";
import SegmentsTable from "./SegmentsTable";
import { ago, BarRow, baseChart, CHART_COLORS, compact, LoadFailed, num, pct, sectionMeta, share } from "../analyticsUi";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const pretty = (k: string) =>
  k === "none" || k === "(not set)" || k === "not_set" ? "Not set" : k.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());

const sorted = (m: CountMap) => Object.entries(m ?? {}).sort((a, b) => b[1] - a[1]);

const LAST_ACTIVE: [keyof IAudienceBreakdown["last_active"], string][] = [
  ["a_last_7_days", "Last 7 days"],
  ["b_last_30_days", "8–30 days ago"],
  ["c_last_90_days", "1–3 months ago"],
  ["d_last_6_months", "3–6 months ago"],
  ["e_last_year", "6–12 months ago"],
  ["f_last_2_years", "1–2 years ago"],
  ["g_older", "Over 2 years ago"],
  ["h_no_signal", "Never"],
];

const DEPTH: [keyof IAudienceBreakdown["engagement_depth_days_with_any_action"], string][] = [
  ["a_none", "No active days"],
  ["b_1_day", "1 day"],
  ["c_2_to_4_days", "2–4 days"],
  ["d_5_to_19_days", "5–19 days"],
  ["e_20_plus_days", "20 days or more"],
];

const AGE: [keyof IAudienceBreakdown["age_bands"], string][] = [
  ["under_18", "Under 18"],
  ["18_24", "18–24"],
  ["25_34", "25–34"],
  ["35_44", "35–44"],
  ["45_plus", "45 and over"],
  ["not_set", "Not set"],
];

const CREATORS: [keyof IAudienceBreakdown["creators"], string][] = [
  ["posted_5_plus", "Posted 5+ times"],
  ["vflix_3_plus", "Posted 3+ VFlix videos"],
  ["hosted_echo", "Hosted an Echo room"],
  ["hosted_live", "Went Live"],
  ["listed_on_marketsquare", "Listed on MarketSquare"],
  ["applied_to_atc", "Applied to ATC"],
];

const SOCIAL: [keyof IAudienceBreakdown["social_graph"], string][] = [
  ["follow_someone", "Follow someone"],
  ["have_a_follower", "Have a follower"],
  ["have_10_plus_followers", "Have 10+ followers"],
  ["have_100_plus_followers", "Have 100+ followers"],
];

const Card = ({ title, hint, children, className = "" }: { title: string; hint?: string; children: React.ReactNode; className?: string }) => (
  <CardBox className={className}>
    <div>
      <h5 className="text-sm font-semibold">{title}</h5>
      {hint && <p className="text-[11px] text-darklink">{hint}</p>}
    </div>
    <div className="mt-1">{children}</div>
  </CardBox>
);

// Turns the cumulative "last N" counts into one bucket per range.
const lastActiveBuckets = (l: IAudienceBreakdown["last_active"]) => {
  const cumulative = [l.a_last_7_days, l.b_last_30_days, l.c_last_90_days, l.d_last_6_months, l.e_last_year, l.f_last_2_years];
  const ranges = cumulative.map((n, i) => Math.max(0, n - (cumulative[i - 1] ?? 0)));
  return LAST_ACTIVE.map(([key, label], i) => ({ key, label, value: i < 6 ? ranges[i] : l[key] }));
};

const PlaceTable = ({ rows, label }: { rows: { name: string; users: number; active: number }[]; label: string }) => {
  const max = Math.max(1, ...rows.map((r) => r.users));
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-darklink text-left">
            <th className="font-semibold py-1.5 pe-3">{label}</th>
            <th className="font-semibold py-1.5 px-3 text-right">People</th>
            <th className="font-semibold py-1.5 ps-3 text-right whitespace-nowrap">Active · 90 days</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border dark:divide-darkborder">
          {rows.map((r) => (
            <tr key={r.name}>
              <td className="py-1.5 pe-3">
                <p className="truncate max-w-[200px]">{pretty(r.name)}</p>
                <div className="h-1 rounded-full bg-lightgray dark:bg-white/5 mt-1 overflow-hidden max-w-[200px]">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${(100 * r.users) / max}%` }} />
                </div>
              </td>
              <td className="py-1.5 px-3 text-right tabular-nums font-semibold">{num(r.users)}</td>
              <td className="py-1.5 ps-3 text-right tabular-nums whitespace-nowrap">
                {num(r.active)} <span className="text-xs text-darklink">{pct(share(r.active, r.users))}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!rows.length && <p className="text-sm text-darklink py-3">No locations recorded.</p>}
    </div>
  );
};

const AudienceView = ({
  audience: a,
  segments,
  pushStats,
}: {
  audience: IAudienceBreakdown | null;
  segments: IAnalyticsSegment[] | null;
  pushStats: IPushStats | null;
}) => {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const refresh = async () => {
    setRefreshing(true);
    try {
      const [res] = await Promise.all([getAudience(true), getSegments(true)]);
      if (!res?.status) toast.error("Couldn’t refresh the numbers");
      router.refresh();
    } finally {
      setRefreshing(false);
    }
  };

  const header = (
    <SuiteHeader
      title="Audience"
      subtitle={a ? `Who the ${num(a.accounts.total)} accounts are, how to reach them, and pushes to win them back.` : "Who the accounts are and how to reach them."}
      back="/dashboards/analytics"
      actions={
        <>
          {a && <span className="text-xs text-darklink">Counted {ago(a.generated_at)}</span>}
          <Button color="light" className="h-10" onClick={refresh} disabled={refreshing}>
            {refreshing ? <Spinner size="sm" /> : <Icon icon="solar:refresh-linear" height={16} className="me-1" />}
            Recount
          </Button>
        </>
      }
    />
  );

  if (!a) {
    return (
      <div className="flex flex-col gap-5">
        {header}
        <LoadFailed what="the audience" />
      </div>
    );
  }

  const r = a.reachability;
  const total = a.accounts.total;
  const buckets = lastActiveBuckets(a.last_active);
  const months = Object.keys(a.signups_by_month ?? {}).sort();

  const lastActiveOptions = baseChart({
    chart: { type: "bar", height: 280 },
    colors: buckets.map((b) => (b.key === "h_no_signal" ? CHART_COLORS.muted : CHART_COLORS.primary)),
    plotOptions: { bar: { horizontal: true, distributed: true, borderRadius: 4, borderRadiusApplication: "end", barHeight: "70%", dataLabels: { position: "top" } } },
    legend: { show: false },
    dataLabels: {
      enabled: true,
      textAnchor: "start",
      offsetX: 8,
      style: { fontSize: "11px", fontWeight: 600, colors: ["#adb0bb"] },
      formatter: (v: number) => `${compact(v)} · ${pct(share(v, total))}`,
    },
    xaxis: {
      categories: buckets.map((b) => b.label),
      // Bars carry their own labels; room on the right for them.
      min: 0,
      max: Math.max(1, ...buckets.map((b) => b.value)) * 1.3,
      labels: { show: false },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { labels: { style: { fontSize: "12px" } } },
    grid: { show: false },
    tooltip: { theme: "dark", y: { formatter: (v: number) => `${num(v)} people (${pct(share(v, total), 1)})`, title: { formatter: () => "" } } },
  });

  const signupOptions = baseChart({
    chart: { type: "bar", height: 300 },
    colors: [CHART_COLORS.muted, CHART_COLORS.primary, CHART_COLORS.secondary],
    plotOptions: { bar: { columnWidth: "75%", borderRadius: 3, borderRadiusApplication: "end" } },
    stroke: { show: true, width: 1, colors: ["transparent"] },
    xaxis: {
      type: "datetime",
      categories: months.map((m) => `${m}-01`),
      labels: { format: "MMM yy", style: { fontSize: "11px" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
      tooltip: { enabled: false },
    },
    yaxis: { min: 0, labels: { formatter: (v: number) => compact(Math.round(v)), style: { fontSize: "11px" } } },
    tooltip: { theme: "dark", shared: true, intersect: false, x: { format: "MMMM yyyy" }, y: { formatter: (v: number) => num(v) } },
  });
  const signupSeries = [
    { name: "Signed up", data: months.map((m) => a.signups_by_month[m].signed_up) },
    { name: "Ever did anything", data: months.map((m) => a.signups_by_month[m].did_anything) },
    { name: "Active in last 90 days", data: months.map((m) => a.signups_by_month[m].active_last_90_days) },
  ];

  const sectionKeys = Array.from(
    new Set([...Object.keys(a.sections_users_ever ?? {}), ...Object.keys(a.sections_users_last_90_days ?? {})]),
  )
    .filter((k) => k !== "app")
    .sort((x, y) => (a.sections_users_ever[y] ?? 0) - (a.sections_users_ever[x] ?? 0));

  const gender = sorted(a.gender);
  const maxGender = Math.max(1, ...gender.map(([, n]) => n));
  const maxAge = Math.max(1, ...AGE.map(([k]) => a.age_bands[k] ?? 0));
  const maxDepth = Math.max(1, ...DEPTH.map(([k]) => a.engagement_depth_days_with_any_action[k] ?? 0));

  return (
    <div className="flex flex-col gap-5">
      {header}

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <KpiCard icon="solar:users-group-rounded-bold-duotone" value={total} label={`Accounts · ${num(a.accounts.deleted_accounts)} deleted`} tone="bg-lightprimary text-primary" />
        <KpiCard
          icon="solar:letter-bold-duotone"
          value={r.email_or_fresh_push}
          label="Reachable by email or a recent push"
          tone="bg-lightsuccess text-success"
          extra={<span className="text-darklink">{pct(share(r.email_or_fresh_push, total))} of accounts</span>}
        />
        <KpiCard
          icon="solar:bell-bing-bold-duotone"
          value={r.push_token_refreshed_last_270d}
          label={`Recent push token · ${compact(r.push_token_ios)} iOS, ${compact(r.push_token_android)} Android`}
          tone="bg-lightsecondary text-secondary"
          extra={<span className="text-darklink">{num(r.push_token_any)} with any token</span>}
        />
        <KpiCard
          icon="solar:mailbox-bold-duotone"
          value={r.email}
          label="Have an email"
          tone="bg-lightprimary text-primary"
          extra={<span className="text-darklink">{num(r.email_is_apple_private_relay)} Apple private relay</span>}
        />
        <KpiCard icon="solar:phone-bold-duotone" value={r.phone} label="Have a phone number" tone="bg-lightinfo text-info" />
        <KpiCard icon="solar:user-block-bold-duotone" value={r.no_way_to_reach} label="No way to reach" tone="bg-lighterror text-error" />
      </div>

      <SegmentsTable segments={segments} pushStats={pushStats} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <Card title="When people were last active" hint="Each account once, by its most recent activity.">
          <div className="-mx-2">
            <Chart options={lastActiveOptions} series={[{ name: "People", data: buckets.map((b) => b.value) }]} type="bar" height={280} width="100%" />
          </div>
        </Card>
        <Card title="Signups by month" hint="How many signed up, how many of them ever did anything, and how many are still around.">
          {months.length ? (
            <div className="-mx-2">
              <Chart options={signupOptions} series={signupSeries} type="bar" height={300} width="100%" />
            </div>
          ) : (
            <p className="text-sm text-darklink py-4">No signups recorded.</p>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card title="Top countries">
          <PlaceTable label="Country" rows={(a.top_countries ?? []).map((c) => ({ name: c.country, users: c.users, active: c.active_last_90_days }))} />
        </Card>
        <Card title="Top cities">
          <PlaceTable label="City" rows={(a.top_cities ?? []).map((c) => ({ name: c.city, users: c.users, active: c.active_last_90_days }))} />
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        <Card title="Gender">
          {gender.map(([k, n]) => (
            <BarRow key={k} label={pretty(k)} value={n} max={maxGender} sub={pct(share(n, total))} />
          ))}
        </Card>
        <Card title="Age">
          {AGE.map(([k, label]) => (
            <BarRow key={k} label={label} value={a.age_bands[k] ?? 0} max={maxAge} sub={pct(share(a.age_bands[k] ?? 0, total))} tone={k === "not_set" ? "bg-bordergray dark:bg-darkborder" : "bg-primary"} />
          ))}
        </Card>
        <Card title="How engaged" hint="Days on which each account did anything at all.">
          {DEPTH.map(([k, label]) => {
            const n = a.engagement_depth_days_with_any_action[k] ?? 0;
            return <BarRow key={k} label={label} value={n} max={maxDepth} sub={pct(share(n, total))} tone={k === "a_none" ? "bg-bordergray dark:bg-darkborder" : "bg-secondary"} />;
          })}
        </Card>
        <Card title="Creators" hint="People who made something, ever.">
          <div className="flex flex-col divide-y divide-border dark:divide-darkborder">
            {CREATORS.map(([k, label]) => (
              <div key={k} className="flex items-center justify-between gap-3 py-2 text-sm">
                <span>{label}</span>
                <span className="font-semibold tabular-nums">{num(a.creators[k])}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Following" hint="How connected people are.">
          <div className="flex flex-col divide-y divide-border dark:divide-darkborder">
            {SOCIAL.map(([k, label]) => (
              <div key={k} className="flex items-center justify-between gap-3 py-2 text-sm">
                <span>{label}</span>
                <span className="font-semibold tabular-nums">
                  {num(a.social_graph[k])} <span className="font-normal text-xs text-darklink">{pct(share(a.social_graph[k], total))}</span>
                </span>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Sections people have used" hint="People who ever did something there, and in the last 90 and 30 days.">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-darklink text-left">
                <th className="font-semibold py-1.5">Section</th>
                <th className="font-semibold py-1.5 text-right">Ever</th>
                <th className="font-semibold py-1.5 text-right">90 days</th>
                <th className="font-semibold py-1.5 text-right">30 days</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border dark:divide-darkborder">
              {sectionKeys.map((k) => (
                <tr key={k}>
                  <td className="py-1.5">{sectionMeta(k).short}</td>
                  <td className="py-1.5 text-right tabular-nums font-semibold">{compact(a.sections_users_ever[k])}</td>
                  <td className="py-1.5 text-right tabular-nums">{compact(a.sections_users_last_90_days[k])}</td>
                  <td className="py-1.5 text-right tabular-nums">{compact(a.sections_users_last_30_days[k])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      <Card title="Accounts by…">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-x-6 gap-y-4">
          {([
            ["Status", a.accounts.by_status],
            ["Signed up with", a.accounts.by_signup_method],
            ["Account type", a.accounts.by_account_type],
            ["Badge", a.accounts.by_badge],
            ["Payments (people)", a.payments_users_by_status],
          ] as const).map(([title, map]) => (
            <div key={title}>
              <p className="text-xs font-semibold text-darklink mb-1">{title}</p>
              {sorted(map).length ? (
                sorted(map).map(([k, n]) => (
                  <div key={k} className="flex items-center justify-between gap-3 py-1 text-sm">
                    <span className="truncate">{pretty(k)}</span>
                    <span className="font-semibold tabular-nums">{num(n)}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-darklink">None</p>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default AudienceView;

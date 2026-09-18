"use client";

import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Icon } from "@iconify/react";
import { formatDistanceToNow } from "date-fns";
import CardBox from "@/app/components/shared/CardBox";
import { actionIcon, actionLabel, actionTone } from "@/utils/moderationLabels";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
const fmt = (n: number) => new Intl.NumberFormat("en", { notation: "compact" }).format(n || 0);
const ngn = (n: number) => `₦${fmt(n)}`;

export interface DashboardData {
  needs_action: { pending_withdrawals: number; pending_verifications: number; open_reports: number; flagged_users: number; taken_down: number };
  modules: {
    users: { total: number; active: number; verified: number; suspended: number };
    posts: { total: number; active: number; open_reports: number; taken_down: number };
    echoes: { total: number; live: number; listeners: number; gifts: number };
    livestreams: { total: number; live: number; viewers: number; gifts: number };
    vflix: { total: number; views_30d: number; featured: number; in_moderation: number };
    market: { products: number; stores: number; reported: number; today: number };
  };
  live: { echoes: number; livestreams: number; users_online: number };
  trends: { date: string; posts: number; reports: number }[];
  reports_by_service: { label: string; count: number; color: string }[];
  monetization: { greencheck_subs: number; premium_subs: number; total_subscribers: number; vflix_gifts: number; vflix_coin_value: number; vflix_paid_out: number };
  recent_signups: IUserLite[];
  recent_enforcement: IEnforcementAction[];
}

const Avatar = ({ src }: { src?: string }) => (
  <div className="relative size-9 rounded-full overflow-hidden bg-lightgray dark:bg-dark shrink-0">
    {src && <Image src={src} alt="" fill className="object-cover" />}
  </div>
);

type Metric = { label: string; value: number; accent?: string };
const ModuleCard = ({ icon, title, href, tone, metrics }: { icon: string; title: string; href: string; tone: string; metrics: Metric[] }) => (
  <CardBox>
    <div className="flex items-center justify-between mb-2.5">
      <div className="flex items-center gap-2.5 min-w-0">
        <span className={`size-9 rounded-lg grid place-items-center shrink-0 ${tone}`}><Icon icon={icon} height={18} /></span>
        <h6 className="font-bold text-sm truncate">{title}</h6>
      </div>
      <Link href={href} className="text-xs font-semibold text-primary flex items-center gap-0.5 shrink-0">View<Icon icon="solar:alt-arrow-right-linear" height={13} /></Link>
    </div>
    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
      {metrics.map((m) => (
        <div key={m.label} className="flex items-center justify-between gap-2">
          <span className="text-xs text-darklink truncate">{m.label}</span>
          <span className={`text-sm font-bold tabular-nums ${m.accent || ""}`}>{fmt(m.value)}</span>
        </div>
      ))}
    </div>
  </CardBox>
);

const DashboardOverview = ({ data }: { data: DashboardData }) => {
  const { needs_action, modules, live, trends, reports_by_service, monetization, recent_signups, recent_enforcement } = data;
  const maxReport = Math.max(1, ...reports_by_service.map((r) => r.count));

  const chartOptions: any = {
    chart: { type: "area", height: 260, fontFamily: "inherit", foreColor: "#adb0bb", toolbar: { show: false } },
    colors: ["#00A1FF", "#FF6692"],
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 2.5 },
    fill: { type: "gradient", gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.02, stops: [0, 90] } },
    legend: { show: true, position: "top", horizontalAlign: "right", fontWeight: 600, markers: { radius: 12 } },
    grid: { borderColor: "rgba(173,181,189,0.18)", strokeDashArray: 4 },
    xaxis: { categories: trends.map((t) => t.date), type: "datetime", labels: { format: "MMM d", style: { fontSize: "11px" } }, axisBorder: { show: false }, axisTicks: { show: false }, tooltip: { enabled: false } },
    yaxis: { labels: { formatter: (v: number) => fmt(Math.round(v)), style: { fontSize: "11px" } }, min: 0 },
    tooltip: { theme: "dark", x: { format: "MMM d, yyyy" } },
  };
  const chartSeries = [
    { name: "Posts", data: trends.map((t) => t.posts) },
    { name: "Reports", data: trends.map((t) => t.reports) },
  ];

  const needCards = [
    { label: "Pending withdrawals", value: needs_action.pending_withdrawals, icon: "solar:money-bag-linear", tone: "bg-lightwarning text-warning", href: "/dashboards/wallets" },
    { label: "Pending verifications", value: needs_action.pending_verifications, icon: "solar:verified-check-linear", tone: "bg-lightinfo text-info", href: "/dashboards/verified-users" },
    { label: "Open reports", value: needs_action.open_reports, icon: "solar:flag-2-linear", tone: "bg-lighterror text-error", href: "/dashboards/posts/reports" },
    { label: "Flagged users", value: needs_action.flagged_users, icon: "solar:user-block-linear", tone: "bg-lightwarning text-warning", href: "/dashboards/users/list?status=flagged" },
    { label: "Taken-down content", value: needs_action.taken_down, icon: "solar:trash-bin-trash-linear", tone: "bg-lighterror text-error", href: "/dashboards/posts/list?status=disabled" },
  ];

  const moduleCards = [
    { icon: "solar:users-group-rounded-linear", title: "Users", href: "/dashboards/users", tone: "bg-lightprimary text-primary", metrics: [
      { label: "Total", value: modules.users.total }, { label: "Active", value: modules.users.active, accent: "text-success" },
      { label: "Verified", value: modules.users.verified, accent: "text-info" }, { label: "Suspended", value: modules.users.suspended, accent: "text-error" }] },
    { icon: "solar:document-text-linear", title: "Posts", href: "/dashboards/posts", tone: "bg-lightsuccess text-success", metrics: [
      { label: "Total", value: modules.posts.total }, { label: "Active", value: modules.posts.active, accent: "text-success" },
      { label: "Open reports", value: modules.posts.open_reports, accent: "text-error" }, { label: "Taken down", value: modules.posts.taken_down }] },
    { icon: "solar:microphone-3-linear", title: "Echoes", href: "/dashboards/echoes", tone: "bg-lightsecondary text-secondary", metrics: [
      { label: "Total", value: modules.echoes.total }, { label: "Live", value: modules.echoes.live, accent: "text-success" },
      { label: "Listeners", value: modules.echoes.listeners }, { label: "Gifts", value: modules.echoes.gifts, accent: "text-warning" }] },
    { icon: "solar:play-stream-linear", title: "Livestreams", href: "/dashboards/livestreams", tone: "bg-lightinfo text-info", metrics: [
      { label: "Total", value: modules.livestreams.total }, { label: "Live", value: modules.livestreams.live, accent: "text-success" },
      { label: "Viewers", value: modules.livestreams.viewers }, { label: "Gifts", value: modules.livestreams.gifts, accent: "text-warning" }] },
    { icon: "solar:videocamera-record-linear", title: "VFlix", href: "/dashboards/vflix", tone: "bg-lighterror text-error", metrics: [
      { label: "Videos", value: modules.vflix.total }, { label: "Views (30d)", value: modules.vflix.views_30d },
      { label: "Featured", value: modules.vflix.featured, accent: "text-primary" }, { label: "In review", value: modules.vflix.in_moderation, accent: "text-warning" }] },
    { icon: "solar:shop-2-linear", title: "MarketSquare", href: "/dashboards/markets", tone: "bg-lightwarning text-warning", metrics: [
      { label: "Products", value: modules.market.products }, { label: "Stores", value: modules.market.stores },
      { label: "Reported", value: modules.market.reported, accent: "text-error" }, { label: "New today", value: modules.market.today, accent: "text-success" }] },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* needs action */}
      <div>
        <h5 className="text-sm font-bold text-darklink uppercase tracking-wide mb-2.5">Needs attention</h5>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
          {needCards.map((c) => (
            <Link key={c.label} href={c.href}>
              <CardBox className="hover:border-primary transition">
                <div className="flex items-center justify-between">
                  <span className={`size-9 rounded-lg grid place-items-center ${c.tone}`}><Icon icon={c.icon} height={18} /></span>
                  <Icon icon="solar:alt-arrow-right-linear" height={15} className="text-darklink" />
                </div>
                <p className="text-2xl font-extrabold tabular-nums mt-2 leading-none">{fmt(c.value)}</p>
                <p className="text-xs text-darklink mt-1">{c.label}</p>
              </CardBox>
            </Link>
          ))}
        </div>
      </div>

      {/* module summaries */}
      <div>
        <h5 className="text-sm font-bold text-darklink uppercase tracking-wide mb-2.5">Modules</h5>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {moduleCards.map((m) => <ModuleCard key={m.title} {...m} />)}
        </div>
      </div>

      {/* trends + live */}
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-8">
          <CardBox>
            <div className="flex items-center justify-between mb-1">
              <h5 className="text-sm font-semibold text-dark dark:text-white">Activity · last 14 days</h5>
              <span className="text-xs text-darklink">content vs. reports</span>
            </div>
            <Chart options={chartOptions} series={chartSeries} type="area" height={260} width="100%" />
          </CardBox>
        </div>
        <div className="col-span-12 lg:col-span-4">
          <CardBox>
            <h5 className="text-sm font-semibold text-dark dark:text-white mb-3 flex items-center gap-2"><span className="size-2 rounded-full bg-success animate-pulse" /> Live now</h5>
            <div className="flex flex-col gap-3">
              {[
                { icon: "solar:microphone-3-bold", label: "Echoes live", value: live.echoes },
                { icon: "solar:videocamera-record-bold", label: "Streams live", value: live.livestreams },
                { icon: "solar:users-group-rounded-bold", label: "Users online", value: live.users_online },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-3">
                  <span className="size-9 rounded-lg grid place-items-center bg-lightsuccess text-success shrink-0"><Icon icon={s.icon} height={18} /></span>
                  <span className="text-sm text-darklink flex-1">{s.label}</span>
                  <span className="text-lg font-bold tabular-nums">{fmt(s.value)}</span>
                </div>
              ))}
            </div>
          </CardBox>
        </div>
      </div>

      {/* reports by service + recent enforcement */}
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-6">
          <CardBox>
            <h5 className="text-sm font-semibold text-dark dark:text-white mb-3">Reports by service</h5>
            {reports_by_service.length ? (
              <div className="flex flex-col gap-2.5">
                {reports_by_service.map((r) => (
                  <div key={r.label} className="grid grid-cols-[110px_1fr_36px] items-center gap-3">
                    <span className="text-xs text-darklink capitalize">{r.label}</span>
                    <span className="h-2 rounded-full bg-lightgray dark:bg-dark overflow-hidden">
                      <span className="block h-full rounded-full" style={{ width: `${(r.count / maxReport) * 100}%`, background: r.color }} />
                    </span>
                    <span className="text-xs font-semibold text-right tabular-nums">{r.count}</span>
                  </div>
                ))}
              </div>
            ) : <div className="py-6 text-center text-sm text-darklink">No reports.</div>}
          </CardBox>
        </div>
        <div className="col-span-12 lg:col-span-6">
          <CardBox>
            <h5 className="text-sm font-semibold text-dark dark:text-white mb-3">Recent enforcement</h5>
            {recent_enforcement.length ? (
              <div className="flex flex-col divide-y divide-border dark:divide-darkborder">
                {recent_enforcement.map((a) => (
                  <div key={a.uuid} className="flex items-center gap-3 py-2.5">
                    <span className={`size-8 rounded-lg grid place-items-center shrink-0 ${actionTone(a.action)}`}><Icon icon={actionIcon(a.action)} height={16} /></span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{actionLabel(a.action)}</p>
                      <p className="text-xs text-darklink truncate">{a.service_type || a.reason || a.result}</p>
                    </div>
                    <span className="text-[11px] text-darklink shrink-0">{a.created_at ? formatDistanceToNow(new Date(a.created_at), { addSuffix: true }) : ""}</span>
                  </div>
                ))}
              </div>
            ) : <div className="py-6 text-center text-sm text-darklink">No enforcement actions yet.</div>}
          </CardBox>
        </div>
      </div>

      {/* monetization + recent signups */}
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-5">
          <CardBox>
            <h5 className="text-sm font-semibold text-dark dark:text-white mb-3">Monetization</h5>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-border dark:border-darkborder p-3">
                <p className="text-[11px] text-darklink">Active subscribers</p>
                <p className="text-lg font-bold tabular-nums">{fmt(monetization.total_subscribers)}</p>
                <p className="text-[11px] text-darklink mt-0.5">{fmt(monetization.greencheck_subs)} green · {fmt(monetization.premium_subs)} premium</p>
              </div>
              <div className="rounded-xl border border-border dark:border-darkborder p-3">
                <p className="text-[11px] text-darklink">VFlix gifts</p>
                <p className="text-lg font-bold tabular-nums">{fmt(monetization.vflix_gifts)}</p>
                <p className="text-[11px] text-darklink mt-0.5">{fmt(monetization.vflix_coin_value)} coins</p>
              </div>
              <div className="rounded-xl border border-border dark:border-darkborder p-3">
                <p className="text-[11px] text-darklink">Paid out (VFlix)</p>
                <p className="text-lg font-bold tabular-nums">{ngn(monetization.vflix_paid_out)}</p>
              </div>
              <Link href="/dashboards/wallets" className="rounded-xl border border-dashed border-border dark:border-darkborder p-3 grid place-items-center hover:border-primary transition">
                <span className="text-xs font-semibold text-primary flex items-center gap-1">Treasury & payouts <Icon icon="solar:alt-arrow-right-linear" height={14} /></span>
              </Link>
            </div>
          </CardBox>
        </div>
        <div className="col-span-12 lg:col-span-7">
          <CardBox>
            <div className="flex items-center justify-between mb-3">
              <h5 className="text-sm font-semibold text-dark dark:text-white">Recent signups</h5>
              <Link href="/dashboards/users/list" className="text-primary text-sm font-semibold">All users</Link>
            </div>
            {recent_signups.length ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                {recent_signups.slice(0, 6).map((u) => (
                  <Link key={u.uuid} href={`/dashboards/users/${u.uuid}`} className="flex items-center gap-3 py-2 border-b border-border dark:border-darkborder last:border-0">
                    <Avatar src={u.profile_picture} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{u.name || "Unknown"}</p>
                      <p className="text-xs text-darklink truncate">@{u.username}</p>
                    </div>
                    <span className="text-[11px] text-darklink shrink-0">{u.created_at ? formatDistanceToNow(new Date(u.created_at), { addSuffix: true }) : ""}</span>
                  </Link>
                ))}
              </div>
            ) : <div className="py-6 text-center text-sm text-darklink">No signups yet.</div>}
          </CardBox>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;

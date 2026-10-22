"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@iconify/react";
import { formatDistanceToNow } from "date-fns";
import CardBox from "@/app/components/shared/CardBox";
import KpiCard from "@/app/components/shared/KpiCard";

const fmt = (n: number) => new Intl.NumberFormat("en", { notation: "compact" }).format(n || 0);

export const ATC_STATUS_TONE: Record<string, string> = {
  pending: "bg-lightwarning text-warning",
  in_review: "bg-lightinfo text-info",
  approved: "bg-lightsuccess text-success",
  declined: "bg-lighterror text-error",
};
const statusLabel = (s: string) => (s === "in_review" ? "Under review" : s.charAt(0).toUpperCase() + s.slice(1));

export interface ATCOverviewData {
  stats: IAtcStats | null;
  leaderboard: ILeaderboardParticipant[];
  active_episode: IActiveEpisode | null;
  recent_applications: IATCApplication[];
  suggestion: IATCData | null;
  periods: IATCPeriod[];
  period: string;
}

const NAV = [
  { href: "/dashboards/africa-talent-challenge/applications", label: "Applications", icon: "solar:users-group-two-rounded-linear" },
  { href: "/dashboards/africa-talent-challenge/episodes", label: "Episodes", icon: "solar:clapperboard-play-linear" },
  { href: "/dashboards/africa-talent-challenge/leaderboard", label: "Leaderboard", icon: "solar:ranking-linear" },
  { href: "/dashboards/africa-talent-challenge/suggestions", label: "Suggestions", icon: "solar:magic-stick-3-linear" },
];

const ContestantAvatar = ({ src }: { src?: string }) => (
  <div className="relative size-9 rounded-full overflow-hidden bg-lightgray dark:bg-dark shrink-0">
    {src && <Image src={src} alt="" fill className="object-cover" unoptimized />}
  </div>
);

const ATCOverviewContent = ({ data }: { data: ATCOverviewData }) => {
  const router = useRouter();
  const params = useSearchParams();
  const { stats, leaderboard, active_episode, recent_applications, suggestion, periods, period } = data;

  const setPeriod = (v: string) => {
    const p = new URLSearchParams(params.toString());
    if (v) p.set("period", v); else p.delete("period");
    router.replace(`?${p.toString()}`, { scroll: false });
  };

  const kpis = stats ? [
    { label: "Episodes", value: stats.episodes.total, icon: "solar:clapperboard-play-linear", tone: "bg-lightprimary text-primary" },
    { label: "Active episode", value: stats.episodes.active, icon: "solar:play-circle-linear", tone: "bg-lightsuccess text-success" },
    { label: "Applications", value: stats.applications.overall.total, icon: "solar:users-group-two-rounded-linear", tone: "bg-lightprimary text-primary" },
    { label: "Pending", value: stats.applications.overall.pending, icon: "solar:clock-circle-linear", tone: "bg-lightwarning text-warning" },
    { label: "Approved", value: stats.applications.overall.approved, icon: "solar:check-circle-linear", tone: "bg-lightsuccess text-success" },
    { label: "Declined", value: stats.applications.overall.declined, icon: "solar:close-circle-linear", tone: "bg-lighterror text-error" },
    { label: "Votes", value: stats.engagement.total_votes, icon: "solar:like-linear", tone: "bg-lightsecondary text-secondary" },
    { label: "Likes", value: stats.engagement.total_likes, icon: "solar:heart-linear", tone: "bg-lighterror text-error" },
    { label: "Comments", value: stats.engagement.total_comments, icon: "solar:chat-round-line-linear", tone: "bg-lightinfo text-info" },
  ] : [];

  return (
    <div className="flex flex-col gap-5">
      {/* header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h4 className="text-lg font-bold">Africa Talent Challenge</h4>
          <p className="text-sm text-darklink">Episodes, contestants, voting & leaderboard</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {periods.length > 0 && (
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="border border-ld bg-transparent rounded-lg text-sm h-10 px-3 focus:ring-primary focus:border-primary"
            >
              <option value="">All periods</option>
              {periods.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          )}
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="flex items-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-lg border border-ld hover:border-primary hover:text-primary transition">
              <Icon icon={n.icon} height={16} /> {n.label}
            </Link>
          ))}
        </div>
      </div>

      {/* KPIs */}
      {stats ? (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-9 gap-4">
          {kpis.map((c) => <KpiCard key={c.label} icon={c.icon} value={c.value} label={c.label} tone={c.tone} />)}
        </div>
      ) : (
        <CardBox><div className="py-10 text-center text-darklink">ATC statistics are unavailable right now.</div></CardBox>
      )}

      {/* leaderboard + recent applications */}
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-7">
          <CardBox>
            <div className="flex items-center justify-between mb-3">
              <h5 className="text-sm font-semibold text-dark dark:text-white flex items-center gap-2">
                <Icon icon="solar:ranking-bold" className="text-warning" height={17} /> Leaderboard
                {active_episode && <span className="text-darklink font-normal">· {active_episode.name}</span>}
              </h5>
              <Link href="/dashboards/africa-talent-challenge/leaderboard" className="text-primary text-sm font-semibold">Full leaderboard</Link>
            </div>
            {leaderboard.length ? (
              <div className="flex flex-col divide-y divide-border dark:divide-darkborder">
                {leaderboard.slice(0, 6).map((p) => (
                  <Link key={p.uuid} href={`/dashboards/africa-talent-challenge/applications/${p.uuid}`} className="flex items-center gap-3 py-2.5">
                    <span className={`size-6 rounded-md grid place-items-center text-xs font-bold shrink-0 ${p.rank <= 3 ? "bg-lightwarning text-warning" : "bg-lightgray dark:bg-dark text-darklink"}`}>{p.rank}</span>
                    <ContestantAvatar src={p.profile_picture} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{p.fullname}</p>
                      <p className="text-xs text-darklink truncate">{p.talent}</p>
                    </div>
                    <span className="text-sm font-bold tabular-nums flex items-center gap-1 shrink-0"><Icon icon="solar:like-bold" className="text-secondary" height={13} />{fmt(p.votes_count)}</span>
                  </Link>
                ))}
              </div>
            ) : <div className="py-6 text-center text-sm text-darklink">No ranked contestants yet.</div>}
          </CardBox>
        </div>
        <div className="col-span-12 lg:col-span-5">
          <CardBox>
            <div className="flex items-center justify-between mb-3">
              <h5 className="text-sm font-semibold text-dark dark:text-white">Recent applications</h5>
              <Link href="/dashboards/africa-talent-challenge/applications" className="text-primary text-sm font-semibold">All</Link>
            </div>
            {recent_applications.length ? (
              <div className="flex flex-col divide-y divide-border dark:divide-darkborder">
                {recent_applications.slice(0, 6).map((a) => (
                  <Link key={a.uuid} href={`/dashboards/africa-talent-challenge/applications/${a.uuid}`} className="flex items-center gap-3 py-2.5">
                    <ContestantAvatar src={a.profile_picture_url} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{a.fullname}</p>
                      <p className="text-xs text-darklink truncate">{a.occupation}</p>
                    </div>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${ATC_STATUS_TONE[a.status] || ""}`}>{statusLabel(a.status)}</span>
                  </Link>
                ))}
              </div>
            ) : <div className="py-6 text-center text-sm text-darklink">No applications yet.</div>}
          </CardBox>
        </div>
      </div>

      {/* active episode + AI suggestion */}
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-6">
          <CardBox>
            <h5 className="text-sm font-semibold text-dark dark:text-white mb-3">Active episode</h5>
            {active_episode ? (
              <div className="flex items-center gap-3">
                <span className="size-11 rounded-xl grid place-items-center bg-lightprimary text-primary shrink-0"><Icon icon="solar:clapperboard-play-bold" height={22} /></span>
                <div className="min-w-0">
                  <p className="text-base font-bold truncate">{active_episode.name}</p>
                  <p className="text-xs text-darklink">{active_episode.start_date?.slice(0, 10)} → {active_episode.end_date?.slice(0, 10)}</p>
                </div>
                <Link href="/dashboards/africa-talent-challenge/episodes" className="ml-auto text-xs font-semibold text-primary shrink-0">Manage</Link>
              </div>
            ) : <div className="py-4 text-center text-sm text-darklink">No active episode.</div>}
          </CardBox>
        </div>
        <div className="col-span-12 lg:col-span-6">
          <CardBox>
            <div className="flex items-center justify-between mb-3">
              <h5 className="text-sm font-semibold text-dark dark:text-white flex items-center gap-2"><Icon icon="solar:magic-stick-3-bold" className="text-secondary" height={16} /> AI episode suggestion</h5>
              <Link href="/dashboards/africa-talent-challenge/suggestions" className="text-primary text-sm font-semibold">Manage</Link>
            </div>
            {suggestion?.suggestions?.length ? (
              <div>
                <p className="text-sm font-semibold">{suggestion.suggestions[0].name}</p>
                <p className="text-xs text-darklink line-clamp-2 mt-1">{suggestion.suggestions[0].description}</p>
                <span className="text-[11px] text-darklink mt-2 inline-block">{suggestion.suggestions.length} suggested for {suggestion.current_month?.label}</span>
              </div>
            ) : <div className="py-4 text-center text-sm text-darklink">No suggestions this month.</div>}
          </CardBox>
        </div>
      </div>
    </div>
  );
};

export default ATCOverviewContent;

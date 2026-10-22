"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@iconify/react";
import CardBox from "@/app/components/shared/CardBox";

const fmt = (n: number) => new Intl.NumberFormat("en", { notation: "compact" }).format(n || 0);
const rankTone = (r: number) =>
  r === 1 ? "bg-amber-500 text-white" : r === 2 ? "bg-gray-400 text-white" : r === 3 ? "bg-orange-700 text-white" : "bg-lightgray dark:bg-dark text-darklink";

const LeaderboardView = ({ data, periods, period }: { data: ILeaderboardResponse | null; periods: IATCPeriod[]; period: string }) => {
  const router = useRouter();
  const params = useSearchParams();
  const setPeriod = (v: string) => {
    const p = new URLSearchParams(params.toString());
    if (v) p.set("period", v); else p.delete("period");
    router.replace(`?${p.toString()}`, { scroll: false });
  };

  const rows = data?.leaderboard || [];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button onClick={() => router.push("/dashboards/africa-talent-challenge")} className="p-1.5 -ml-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-darklink">
            <Icon icon="solar:alt-arrow-left-linear" height={20} />
          </button>
          <div>
            <h4 className="text-lg font-bold">Leaderboard</h4>
            <p className="text-sm text-darklink">
              {data?.active_episode?.name || "All episodes"}{typeof data?.participants_count === "number" ? ` · ${data.participants_count} contestants` : ""}
            </p>
          </div>
        </div>
        {periods.length > 0 && (
          <select value={period} onChange={(e) => setPeriod(e.target.value)} className="border border-ld bg-transparent rounded-lg text-sm h-10 px-3 focus:ring-primary focus:border-primary">
            <option value="">All periods</option>
            {periods.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        )}
      </div>

      <CardBox>
        {rows.length ? (
          <div className="flex flex-col divide-y divide-border dark:divide-darkborder">
            {rows.map((p) => (
              <Link key={p.uuid} href={`/dashboards/africa-talent-challenge/applications/${p.uuid}`} className="flex items-center gap-3 py-3">
                <span className={`size-8 rounded-lg grid place-items-center text-sm font-bold shrink-0 ${rankTone(p.rank)}`}>{p.rank}</span>
                <div className="relative size-11 rounded-full overflow-hidden bg-lightgray dark:bg-dark shrink-0">
                  {p.profile_picture && <Image src={p.profile_picture} alt="" fill className="object-cover" unoptimized />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate">{p.fullname}</p>
                  <p className="text-xs text-darklink truncate">{p.talent}</p>
                </div>
                <div className="hidden sm:flex items-center gap-4 text-xs text-darklink shrink-0">
                  <span className="flex items-center gap-1"><Icon icon="solar:heart-bold" className="text-error" height={13} />{fmt(p.likes_count)}</span>
                  <span className="flex items-center gap-1"><Icon icon="solar:chat-round-line-bold" className="text-info" height={13} />{fmt(p.comments_count)}</span>
                  <span className="flex items-center gap-1"><Icon icon="solar:gift-bold" className="text-warning" height={13} />{fmt(p.gifts_count)}</span>
                </div>
                <div className="text-right shrink-0 w-20">
                  <p className="text-base font-extrabold tabular-nums flex items-center justify-end gap-1"><Icon icon="solar:like-bold" className="text-secondary" height={15} />{fmt(p.votes_count)}</p>
                  <p className="text-[10px] text-darklink">votes</p>
                </div>
              </Link>
            ))}
          </div>
        ) : <div className="py-16 text-center text-sm text-darklink">No ranked contestants for this period.</div>}
      </CardBox>
    </div>
  );
};

export default LeaderboardView;

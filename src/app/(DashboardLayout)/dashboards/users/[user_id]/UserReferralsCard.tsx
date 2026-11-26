"use client";

import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import CardBox from "@/app/components/shared/CardBox";

const Person = ({ p, sub }: { p: IUserActivityPerson; sub?: string }) => (
  <Link href={`/dashboards/users/${p.uuid}`} className="flex items-center gap-2.5 py-1.5 group min-w-0">
    <span className="relative size-8 rounded-full overflow-hidden bg-lightgray dark:bg-dark shrink-0">
      {p.profile_picture && <Image src={p.profile_picture} alt="" fill className="object-cover" />}
    </span>
    <span className="min-w-0">
      <span className="block text-sm font-medium truncate group-hover:text-primary">{p.name || `@${p.username}`}</span>
      <span className="block text-[11px] text-darklink truncate">
        @{p.username}
        {sub ? ` · ${sub}` : ""}
      </span>
    </span>
  </Link>
);

const Step = ({ label, value }: { label: string; value: number | null }) => (
  <div className="rounded-xl border border-border dark:border-darkborder p-2.5 text-center">
    <p className="text-base font-bold tabular-nums">{value ?? "—"}</p>
    <p className="text-[11px] text-darklink leading-tight">{label}</p>
  </div>
);

const UserReferralsCard = ({ referrals, loading }: { referrals: IUserActivity["referrals"] | undefined; loading: boolean }) => {
  if (loading && !referrals) {
    return (
      <CardBox>
        <h5 className="card-title mb-3">Referrals</h5>
        <div className="h-24 rounded-xl animate-pulse bg-lightgray dark:bg-dark" />
      </CardBox>
    );
  }
  if (!referrals) return null;
  return (
    <CardBox>
      <h5 className="card-title mb-3">Referrals</h5>
      <div className="grid grid-cols-3 gap-2">
        <Step label="Signed up with their code" value={referrals.invited} />
        <Step label="Completed their profile" value={referrals.profile_completed} />
        <Step label="Stayed active" value={referrals.engagement_reached} />
      </div>
      <div className="mt-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-darklink">Invited by</p>
        {referrals.invited_by ? (
          <Person p={referrals.invited_by} />
        ) : (
          <p className="text-sm text-darklink py-1.5">Nobody: they joined without a code.</p>
        )}
      </div>
      {referrals.recent.length > 0 && (
        <div className="mt-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-darklink">Latest they invited</p>
          {referrals.recent.map((p) => (
            <Person
              key={p.uuid}
              p={p}
              sub={p.created_at ? `joined ${formatDistanceToNow(new Date(p.created_at), { addSuffix: true })}` : undefined}
            />
          ))}
        </div>
      )}
    </CardBox>
  );
};

export default UserReferralsCard;

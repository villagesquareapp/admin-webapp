"use client";

import { Icon } from "@iconify/react";
import CardBox from "@/app/components/shared/CardBox";
import KpiCard from "@/app/components/shared/KpiCard";
import ReusableTable from "@/app/components/shared/ReusableTable";
import { createColumnHelper } from "@/utils/table";
import PostSearch from "../../posts/PostSearch";
import { PersonCell } from "../../meetings/meetingsUi";
import { ago } from "../../discovery/discoveryUi";

const FILTERS = [
  {
    label: "Stage",
    key: "stage",
    options: [
      { value: "", label: "Every stage" },
      { value: "joined", label: "Joined, no reward yet" },
      { value: "profile", label: "Profile completed" },
      { value: "engaged", label: "Stayed active" },
      { value: "expired", label: "Didn’t stay active" },
    ],
  },
];

const PAID_LABEL: Record<string, string> = {
  referral_welcome_bonus: "Welcome",
  referral_profile_completion: "Profile completed",
  referral_engagement_milestone: "Stayed active",
};

// A referrer bringing many people in a day is worth a look.
const BUSY_DAY = 10;

const Stage = ({ r, rewards }: { r: IReferral; rewards?: IReferralStats["rewards"] }) => {
  const steps = [
    { done: true, label: "Joined", icon: "solar:user-plus-rounded-linear" },
    { done: r.profile_completion_rewarded, label: "Profile", icon: "solar:user-check-rounded-linear" },
    {
      done: r.engagement_milestone_rewarded,
      label: r.engagement_expired && !r.engagement_milestone_rewarded ? "Missed" : `Active ${r.login_days}/${rewards?.engagement_login_days ?? 5}d`,
      icon: r.engagement_expired && !r.engagement_milestone_rewarded ? "solar:clock-circle-linear" : "solar:fire-linear",
      missed: r.engagement_expired && !r.engagement_milestone_rewarded,
    },
  ];
  return (
    <div className="flex items-center gap-1.5">
      {steps.map((s) => (
        <span
          key={s.label}
          className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full whitespace-nowrap ${
            s.done ? "bg-lightsuccess text-success" : (s as any).missed ? "bg-lighterror text-error" : "bg-lightgray dark:bg-white/5 text-darklink"
          }`}
        >
          <Icon icon={s.icon} height={12} /> {s.label}
        </span>
      ))}
    </div>
  );
};

const ReferralsView = ({
  stats,
  page,
  currentPage,
  pageSize,
}: {
  stats: IReferralStats | null;
  page: IPaginatedResponse<IReferral> | null;
  currentPage: number;
  pageSize: number;
}) => {
  const paid = (stats?.cowries_paid ?? []).reduce((n, r) => n + Number(r.amount), 0);
  const col = createColumnHelper<IReferral>();
  const columns = [
    col.display({
      id: "referrer",
      header: () => <span>Referrer</span>,
      cell: (i) => <PersonCell person={i.row.original.referrer} />,
    }),
    col.display({
      id: "referred",
      header: () => <span>Brought in</span>,
      cell: (i) => <PersonCell person={i.row.original.referred_user} />,
    }),
    col.display({
      id: "stage",
      header: () => <span>Progress</span>,
      cell: (i) => <Stage r={i.row.original} rewards={stats?.rewards} />,
    }),
    col.accessor("created_at", {
      header: () => <span>Joined</span>,
      cell: (i) => <span className="text-sm text-darklink whitespace-nowrap">{ago(i.getValue())}</span>,
    }),
  ];

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h4 className="text-lg font-bold">Referrals</h4>
        <p className="text-sm text-darklink">
          Who brought whom, and what the referrer was paid.
          {stats?.rewards
            ? ` Referrers earn ${stats.rewards.profile_completion} cowries when the new person completes their profile, and ${stats.rewards.engagement_milestone} more when they log in on ${stats.rewards.engagement_login_days} days within ${stats.rewards.engagement_window_days}.`
            : ""}
        </p>
      </div>

      {stats && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
            <KpiCard icon="solar:users-group-rounded-bold-duotone" value={stats.total} label="Referrals" tone="bg-lightprimary text-primary" />
            <KpiCard icon="solar:calendar-bold-duotone" value={stats.last_7d} label={`This week · ${stats.last_30d.toLocaleString()} in 30 days`} tone="bg-lightsecondary text-secondary" />
            <KpiCard icon="solar:user-check-rounded-bold-duotone" value={stats.profile_completed} label="Completed their profile" tone="bg-lightsuccess text-success" />
            <KpiCard icon="solar:fire-bold-duotone" value={stats.engaged} label="Stayed active" tone="bg-lightsuccess text-success" />
            <KpiCard icon="solar:clock-circle-bold-duotone" value={stats.expired} label="Didn’t stay active" tone="bg-lightwarning text-warning" />
            <KpiCard icon="solar:wallet-money-bold-duotone" value={paid} label="Cowries paid out" tone="bg-lightprimary text-primary" />
          </div>

          <CardBox>
            <h5 className="text-sm font-semibold">Top referrers, last 30 days</h5>
            <p className="text-[11px] text-darklink mb-3">
              Many sign-ups in a day, or few that ever complete a profile, can mean fake accounts.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
              {stats.top_referrers.map((r) => (
                <div key={r.user.uuid} className="flex items-center justify-between gap-3">
                  <PersonCell person={r.user} />
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold tabular-nums">{r.referrals} referrals</p>
                    <p className={`text-[11px] ${r.last_24h >= BUSY_DAY ? "text-error font-semibold" : "text-darklink"}`}>
                      {r.rewarded} rewarded · {r.last_24h} today
                    </p>
                  </div>
                </div>
              ))}
              {!stats.top_referrers.length && <p className="text-sm text-darklink">No referrals in the last 30 days.</p>}
            </div>
            {stats.cowries_paid.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-ld">
                {stats.cowries_paid.map((r) => (
                  <span key={r.category} className="text-xs rounded-full border border-ld px-3 py-1">
                    {PAID_LABEL[r.category] ?? r.category}: <span className="font-semibold">{Number(r.amount).toLocaleString()} cowries</span> · {r.count}×
                  </span>
                ))}
              </div>
            )}
          </CardBox>
        </>
      )}

      <ReusableTable
        tableData={page?.data ?? []}
        columns={columns}
        totalPages={page?.last_page || 1}
        currentPage={currentPage}
        pageSize={pageSize}
        dense
        compactTitle
        tableTitle="All referrals"
        filterDropdowns={FILTERS}
        extraButtons={<PostSearch placeholder="Referrer or new user…" />}
      />
    </div>
  );
};

export default ReferralsView;

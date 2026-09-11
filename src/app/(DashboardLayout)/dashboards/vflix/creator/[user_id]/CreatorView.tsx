"use client";

import CardBox from "@/app/components/shared/CardBox";
import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";
import VflixTable from "../../VflixTable";
import VflixStatusBadge from "../../VflixStatusBadge";
import { formatCount } from "../../vflixStatus";

const SummaryStat = ({
  icon,
  label,
  value,
  danger = false,
}: {
  icon: string;
  label: string;
  value: string | number;
  danger?: boolean;
}) => (
  <CardBox className="!shadow-none border border-ld">
    <div className="flex items-center gap-3">
      <span
        className={`w-11 h-11 rounded-full flex items-center justify-center ${
          danger ? "bg-lighterror text-error" : "bg-lightprimary text-primary"
        }`}
      >
        <Icon icon={icon} height={22} />
      </span>
      <div>
        <h4 className="text-xl font-semibold">{value}</h4>
        <p className="text-sm text-darklink">{label}</p>
      </div>
    </div>
  </CardBox>
);

const CreatorView = ({
  data,
  page,
  limit,
}: {
  data: IVflixCreatorView | null;
  page: number;
  limit: number;
}) => {
  if (!data) {
    return (
      <CardBox>
        <div className="text-center py-16 text-darklink">Creator not found.</div>
      </CardBox>
    );
  }

  const { creator, summary, videos } = data;
  const totalPages = Math.max(1, Math.ceil((videos.total || 0) / (videos.limit || limit)));

  return (
    <div className="flex flex-col gap-30">
      {/* Creator header */}
      <CardBox>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative size-16 rounded-full overflow-hidden">
              <Image
                src={creator.profile_picture}
                alt={creator.name}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h4 className="text-lg font-semibold">{creator.name}</h4>
              <p className="text-sm text-darklink">@{creator.username}</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {Object.entries(summary.by_status).map(([status, count]) => (
                  <span key={status} className="flex items-center gap-1">
                    <VflixStatusBadge status={status} />
                    <span className="text-xs text-darklink">×{count}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
          <Link
            href={`/dashboards/users?userId=${creator.uuid}`}
            className="text-sm text-primary hover:underline flex items-center gap-1 shrink-0"
          >
            <Icon icon="solar:user-circle-linear" height={18} />
            Manage account
          </Link>
        </div>
      </CardBox>

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryStat icon="solar:videocamera-record-linear" label="Total Videos" value={summary.total} />
        <SummaryStat icon="solar:eye-linear" label="Total Views" value={formatCount(summary.total_views)} />
        <SummaryStat icon="solar:heart-linear" label="Total Likes" value={formatCount(summary.total_likes)} />
        <SummaryStat
          icon="solar:danger-triangle-linear"
          label="Strikes"
          value={summary.strikes}
          danger={summary.strikes > 0}
        />
      </div>

      {/* Videos */}
      <div className="grid grid-cols-12">
        <VflixTable
          videos={videos.data || []}
          totalPages={totalPages}
          currentPage={page}
          pageSize={limit}
          tableTitle={`${creator.name}'s Videos`}
        />
      </div>
    </div>
  );
};

export default CreatorView;

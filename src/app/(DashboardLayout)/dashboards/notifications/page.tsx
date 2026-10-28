import { Suspense } from "react";
import { getToken } from "@/lib/getToken";
import KpiCard from "@/app/components/shared/KpiCard";
import PushNotification from "./PushNotification";
import { getPushNotifications, getPushStats } from "@/app/api/push-notification";
import { formatDateTime } from "./pushUi";

const Stats = ({ stats }: { stats: IPushStats | null }) => {
  if (!stats) return null;
  const b = stats.broadcasts;
  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <KpiCard icon="solar:plain-2-bold-duotone" value={stats.sent} label="Pushes sent" tone="bg-lightprimary text-primary" />
        <KpiCard icon="solar:calendar-date-bold-duotone" value={stats.sent_7d} label="Sent in the last 7 days" tone="bg-lightsecondary text-secondary" />
        <KpiCard icon="solar:clock-circle-bold-duotone" value={stats.scheduled} label="Scheduled" tone="bg-lightsecondary text-secondary" />
        <KpiCard icon="solar:smartphone-2-bold-duotone" value={stats.devices.total} label={`Devices · ${stats.devices.ios.toLocaleString()} iOS, ${stats.devices.android.toLocaleString()} Android`} tone="bg-lightsuccess text-success" />
        <KpiCard icon="solar:check-read-bold-duotone" value={stats.delivered_30d} label={`Devices reached (30 days)${stats.refused_30d ? ` · ${stats.refused_30d.toLocaleString()} refused` : ""}`} tone="bg-lightsuccess text-success" />
        <KpiCard
          icon="solar:users-group-rounded-bold-duotone"
          value={b.remaining}
          suffix={` / ${b.limit}`}
          label="Whole-audience pushes left today"
          tone={b.remaining ? "bg-lightwarning text-warning" : "bg-lighterror text-error"}
        />
      </div>
      {(stats.failed_30d > 0 || (!b.remaining && b.next_slot_at)) && (
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-darklink px-1">
          {stats.failed_30d > 0 && (
            <span className="text-error">{stats.failed_30d} push{stats.failed_30d === 1 ? "" : "es"} failed in the last 30 days. Filter by “Failed” to see why.</span>
          )}
          {!b.remaining && b.next_slot_at && <span>The next whole-audience push frees up {formatDateTime(b.next_slot_at)}.</span>}
        </div>
      )}
    </div>
  );
};

const NotificationsWrapper = async ({
  page,
  limit,
  search,
  status,
  audience,
}: {
  page: number;
  limit: number;
  search?: string;
  status?: string;
  audience?: string;
}) => {
  const [notifications, stats] = await Promise.all([
    getPushNotifications(page, limit, { search, status, audience }),
    getPushStats(),
  ]);
  return (
    <PushNotification
      notifications={notifications?.data || null}
      stats={stats?.data ?? null}
      statsRow={<Stats stats={stats?.data ?? null} />}
      totalPages={notifications?.data?.last_page || 1}
      currentPage={page}
      pageSize={limit}
    />
  );
};

const Page = async (props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) => {
  const searchParams = await props.searchParams;
  const token = await getToken();
  const page = Number(searchParams.page) || 1;
  const limit = Number(searchParams.limit) || 20;
  const search = searchParams.search?.toString();
  const status = searchParams.status?.toString();
  const audience = searchParams.audience?.toString();

  if (!token) throw new Error("No token found");

  return (
    <Suspense
        key={`${page}-${limit}-${search}-${status}-${audience}`}
        fallback={<div className="h-[600px] w-full animate-pulse bg-lightgray dark:bg-white/5 rounded-3xl" />}
      >
        <NotificationsWrapper page={page} limit={limit} search={search} status={status} audience={audience} />
      </Suspense>
  );
};

export default Page;

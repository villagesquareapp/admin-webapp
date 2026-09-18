import { Suspense } from "react";
import { getEchoOverview } from "../api/echo";
import { getLivestreamOverview } from "../api/livestream";
import { getMarketSquareStats } from "../api/market-square";
import { getPendingVerification, getVerificationRequested } from "../api/pending-verification";
import { getPostOverview } from "../api/post";
import { getUserDetails, getUserOverview, getVerifiedUserStats } from "../api/user";
import { getPendingWithdrawals } from "../api/wallet";
import { getReportStats } from "../api/report";
import { getEnforcementLog } from "../api/moderation";
import { getVflixOverview } from "../api/vflix";
import { getVflixMonetization } from "../api/vflix-insights";
import DashboardOverview, { DashboardData } from "./DashboardOverview";
import PendingVerifications from "./PendingVerifications";
import Withdrawals from "./Withdrawals";

const num = (v: unknown) => Number(v) || 0;

const DashboardWrapper = async () => {
  const [
    users,
    posts,
    echoes,
    livestreams,
    vflix,
    market,
    reportStats,
    verifiedStats,
    vflixMon,
    enforcement,
    withdrawals,
    verifications,
  ] = await Promise.all([
    getUserOverview(),
    getPostOverview(),
    getEchoOverview(),
    getLivestreamOverview(),
    getVflixOverview(),
    getMarketSquareStats(),
    getReportStats(),
    getVerifiedUserStats(),
    getVflixMonetization(),
    getEnforcementLog(1, 6),
    getPendingWithdrawals(1, 1),
    getPendingVerification(1, 1),
  ]);

  const u = users?.data;
  const p = posts?.data;
  const e = echoes?.data;
  const l = livestreams?.data;
  const vf = vflix?.data;
  const mk = (market?.data as any) || {};
  const rs = reportStats?.data;
  const vs = verifiedStats?.data;
  const vm = vflixMon?.data;

  const openReports =
    num(u?.kpis?.open_reports) + num(p?.kpis?.open_reports) + num(e?.kpis?.open_reports) + num(l?.kpis?.open_reports);

  const data: DashboardData = {
    needs_action: {
      pending_withdrawals: num(withdrawals?.data?.total),
      pending_verifications: num(verifications?.data?.total),
      open_reports: openReports,
      flagged_users: num(u?.kpis?.flagged),
      taken_down: num(p?.kpis?.taken_down),
    },
    modules: {
      users: {
        total: num(u?.kpis?.total),
        active: num(u?.kpis?.active),
        verified: num(u?.kpis?.verified),
        suspended: num(u?.kpis?.suspended),
      },
      posts: {
        total: num(p?.kpis?.total),
        active: num(p?.kpis?.active),
        open_reports: num(p?.kpis?.open_reports),
        taken_down: num(p?.kpis?.taken_down),
      },
      echoes: {
        total: num(e?.kpis?.total),
        live: num(e?.kpis?.live),
        listeners: num(e?.kpis?.total_listeners),
        gifts: num(e?.kpis?.total_gifts),
      },
      livestreams: {
        total: num(l?.kpis?.total),
        live: num(l?.kpis?.live),
        viewers: num(l?.kpis?.total_viewers),
        gifts: num(l?.kpis?.total_gifts),
      },
      vflix: {
        total: num(vf?.kpis?.total),
        views_30d: num(vf?.kpis?.views_30d),
        featured: num(vf?.kpis?.featured),
        in_moderation: num(vf?.kpis?.in_moderation),
      },
      market: {
        products: num(mk.total_products),
        stores: num(mk.total_shops),
        reported: num(mk.reported_products),
        today: num(mk.today_products),
      },
    },
    live: {
      echoes: num(e?.kpis?.live),
      livestreams: num(l?.kpis?.live),
      users_online: num(u?.kpis?.online),
    },
    trends: p?.trends || [],
    reports_by_service: rs
      ? [
          { label: "posts", count: num(rs.total_post_reports), color: "#00A1FF" },
          { label: "users", count: num(rs.total_user_reports), color: "#FF6692" },
          { label: "echoes", count: num(rs.total_echo_reports), color: "#8965E5" },
          { label: "livestreams", count: num(rs.total_live_stream_reports), color: "#46caeb" },
          { label: "marketplace", count: num(rs.total_marketplace_reports), color: "#FFB900" },
          { label: "comments", count: num(rs.total_comment_reports), color: "#00ceb6" },
        ].filter((r) => r.count > 0)
      : [],
    monetization: {
      greencheck_subs: num(vs?.greencheck_active_subscribers),
      premium_subs: num(vs?.premium_active_subscribers),
      total_subscribers: num(vs?.total_active_subscribers),
      vflix_gifts: num(vm?.kpis?.total_gifts),
      vflix_coin_value: num(vm?.kpis?.coin_value),
      vflix_paid_out: num(vm?.kpis?.paid_out),
    },
    recent_signups: u?.recent_signups || [],
    recent_enforcement: enforcement?.data?.data || [],
  };

  return <DashboardOverview data={data} />;
};

const PendingVerificationsWrapper = async ({
  selectedPendingVerificationID,
  page,
  limit,
}: {
  selectedPendingVerificationID: string;
  page: number;
  limit: number;
}) => {
  const pendingVerification = await getPendingVerification(page, limit);

  let selectedPendingVerification: IPendingVerification | null = null;
  let selectedVerificationRequested: IVerificationRequested | null = null;
  let selectedUser: IUser | null = null;

  if (selectedPendingVerificationID) {
    selectedPendingVerification =
      pendingVerification?.data?.data.find((item) => item.uuid === selectedPendingVerificationID) || null;

    if (selectedPendingVerification) {
      const [user, verificationRequested] = await Promise.all([
        getUserDetails(selectedPendingVerification?.user?.uuid || ""),
        getVerificationRequested(selectedPendingVerification?.uuid || ""),
      ]);

      selectedVerificationRequested = verificationRequested?.data
        ? (verificationRequested.data as unknown as IVerificationRequested)
        : null;
      selectedUser = user?.data ? (user.data as unknown as IUser) : null;
    }
  }

  return (
    <PendingVerifications
      pendingVerification={pendingVerification?.data || null}
      totalPages={pendingVerification?.data?.last_page || 1}
      currentPage={page}
      pageSize={limit}
      currentSelectedPendingVerification={selectedPendingVerification}
      currentSelectedVerificationRequested={selectedVerificationRequested}
      currentSelectedUser={selectedUser}
    />
  );
};

const WithdrawalsWrapper = async ({
  selectedWithdrawalID,
  pWPage,
  pWLimit,
}: {
  selectedWithdrawalID: string;
  pWPage: number;
  pWLimit: number;
}) => {
  const pendingWithdrawals = await getPendingWithdrawals(pWPage, pWLimit);
  return (
    <Withdrawals
      selectedWithdrawalID={selectedWithdrawalID}
      withdrawals={pendingWithdrawals?.data || null}
      totalPages={pendingWithdrawals?.data?.last_page || 1}
      currentPage={pWPage}
      pageSize={pWLimit}
    />
  );
};

const Page = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
  const selectedWithdrawalID = searchParams.withdrawal as string;
  const selectedPendingVerificationID = searchParams.pending_verification as string;
  const page = Number(searchParams.page) || 1;
  const limit = Number(searchParams.limit) || 20;
  const pWLimit = Number(searchParams.pwLimit) || 10;
  const pWPage = Number(searchParams.pwPage) || 1;

  return (
    <div className="flex flex-col gap-5">
      <Suspense fallback={<div className="h-[420px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}>
        <DashboardWrapper />
      </Suspense>

      <div>
        <h5 className="text-sm font-bold text-darklink uppercase tracking-wide mb-2.5">Operations queues</h5>
        <div className="grid grid-cols-12 gap-5">
          <div className="lg:col-span-7 col-span-12">
            <Suspense fallback={<div className="h-[400px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}>
              <PendingVerificationsWrapper selectedPendingVerificationID={selectedPendingVerificationID} page={page} limit={limit} />
            </Suspense>
          </div>
          <div className="lg:col-span-5 col-span-12">
            <Suspense fallback={<div className="h-[400px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}>
              <WithdrawalsWrapper selectedWithdrawalID={selectedWithdrawalID} pWPage={pWPage} pWLimit={pWLimit} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;

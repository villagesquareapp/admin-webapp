import { Suspense } from "react";
import { getToken } from "@/lib/getToken";
import {
  getCowryBalance,
  getFlutterwaveBalance,
  getRecentTransfers,
  getPendingWithdrawals,
  getWithdrawalsNeedingAttention,
  getMissingLegacyTransfers,
  getPayoutSettings,
} from "@/app/api/wallet";
import TreasuryBalances from "./TreasuryBalances";
import RecentTransfers from "./RecentTransfers";
import PayoutsNeedingAttention from "./PayoutsNeedingAttention";
import MissingLegacyTransfers from "./MissingLegacyTransfers";
import PayoutRules from "./PayoutRules";
import Withdrawals from "../../Withdrawals";

const skeleton = (h: string) => <div className={`${h} w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl`} />;

const BalancesWrapper = async ({ token }: { token: string }) => {
  const [cowry, flutterwave] = await Promise.all([
    getCowryBalance(),
    getFlutterwaveBalance(),
  ]);
  return (
    <TreasuryBalances
      cowry={cowry?.data || null}
      flutterwave={flutterwave?.data || null}
      token={token}
    />
  );
};

const WithdrawalsWrapper = async ({
  selectedWithdrawalID, page, limit,
}: { selectedWithdrawalID: string; page: number; limit: number }) => {
  const pending = await getPendingWithdrawals(page, limit);
  return (
    <Withdrawals
      selectedWithdrawalID={selectedWithdrawalID}
      withdrawals={pending?.data || null}
      totalPages={pending?.data?.last_page || 1}
      currentPage={page}
      pageSize={limit}
    />
  );
};

const AttentionWrapper = async () => {
  const attention = await getWithdrawalsNeedingAttention();
  const items = Array.isArray(attention?.data?.data) ? attention.data.data : [];
  return <PayoutsNeedingAttention items={items} />;
};

const LegacyTransfersWrapper = async () => {
  const report = await getMissingLegacyTransfers();
  return <MissingLegacyTransfers report={report?.data ?? null} />;
};

const PayoutRulesWrapper = async () => {
  const settings = await getPayoutSettings();
  return <PayoutRules settings={settings?.status ? (settings.data ?? null) : null} />;
};

const TransfersWrapper = async ({ page, limit }: { page: number; limit: number }) => {
  const recent = await getRecentTransfers(page, limit);
  return (
    <RecentTransfers
      recentTransferData={recent?.data || null}
      totalPages={recent?.data?.last_page || 1}
      currentPage={page}
      pageSize={limit}
    />
  );
};

const Page = async (props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) => {
  const searchParams = await props.searchParams;
  const token = await getToken();
  if (!token) throw new Error("No token found");

  const page = Number(searchParams.page) || 1;
  const limit = Number(searchParams.limit) || 10;
  const wPage = Number(searchParams.wPage) || 1;
  const wLimit = Number(searchParams.wLimit) || 10;
  const selectedWithdrawalID = (searchParams.withdrawal as string) || "";

  return (
    <div className="flex flex-col gap-6">
      <Suspense fallback={skeleton("h-[220px]")}>
        <BalancesWrapper token={token} />
      </Suspense>

      <Suspense fallback={null}>
        <AttentionWrapper />
      </Suspense>

      <div>
        <h5 className="text-sm font-bold text-darklink uppercase tracking-wide mb-2.5">Pending withdrawals</h5>
        <Suspense key={`w-${wPage}-${wLimit}`} fallback={skeleton("h-[420px]")}>
          <WithdrawalsWrapper selectedWithdrawalID={selectedWithdrawalID} page={wPage} limit={wLimit} />
        </Suspense>
      </div>

      <div>
        <h5 className="text-sm font-bold text-darklink uppercase tracking-wide mb-2.5">Transfers</h5>
        <Suspense key={`t-${page}-${limit}`} fallback={skeleton("h-[420px]")}>
          <TransfersWrapper page={page} limit={limit} />
        </Suspense>
      </div>

      <Suspense fallback={null}>
        <LegacyTransfersWrapper />
      </Suspense>

      <Suspense fallback={skeleton("h-[360px]")}>
        <PayoutRulesWrapper />
      </Suspense>
    </div>
  );
};

export default Page;

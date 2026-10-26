import { Suspense } from "react";
import { getToken } from "@/lib/getToken";
import {
  getCowryBalance,
  getFlutterwaveBalance,
  getRecentTransfers,
  getPayoutQueue,
  getPayoutsNeedingAttention,
  getMissingLegacyTransfers,
  getPayoutSettings,
  getPayouts,
  getPayoutCycles,
} from "@/app/api/wallet";
import TreasuryBalances from "./TreasuryBalances";
import RecentTransfers from "./RecentTransfers";
import PayoutsNeedingAttention from "./PayoutsNeedingAttention";
import MissingLegacyTransfers from "./MissingLegacyTransfers";
import PayoutRules from "./PayoutRules";
import AutoPayouts from "./AutoPayouts";
import PayoutQueue from "../../PayoutQueue";

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

const PayoutQueueWrapper = async ({
  selectedPayoutID, page, limit,
}: { selectedPayoutID: string; page: number; limit: number }) => {
  const pending = await getPayoutQueue(page, limit);
  return (
    <PayoutQueue
      selectedPayoutID={selectedPayoutID}
      payouts={pending?.data || null}
      totalPages={pending?.data?.last_page || 1}
      currentPage={page}
      pageSize={limit}
    />
  );
};

const AttentionWrapper = async () => {
  const attention = await getPayoutsNeedingAttention();
  const items = Array.isArray(attention?.data?.data) ? attention.data.data : [];
  return <PayoutsNeedingAttention items={items} />;
};

const LegacyTransfersWrapper = async () => {
  const report = await getMissingLegacyTransfers();
  return <MissingLegacyTransfers report={report?.data ?? null} />;
};

const AutoPayoutsWrapper = async () => {
  const [payouts, cycles] = await Promise.all([getPayouts("review"), getPayoutCycles()]);
  if (!payouts?.status) return null;
  return (
    <AutoPayouts
      payouts={payouts.data ?? null}
      cycles={Array.isArray(cycles?.data) ? cycles.data : []}
    />
  );
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
  const selectedPayoutID = (searchParams.payout as string) || "";

  return (
    <div className="flex flex-col gap-6">
      <Suspense fallback={skeleton("h-[220px]")}>
        <BalancesWrapper token={token} />
      </Suspense>

      <Suspense fallback={null}>
        <AttentionWrapper />
      </Suspense>

      <div>
        <h5 className="text-sm font-bold text-darklink uppercase tracking-wide mb-2.5">Payout queue</h5>
        <Suspense key={`w-${wPage}-${wLimit}`} fallback={skeleton("h-[420px]")}>
          <PayoutQueueWrapper selectedPayoutID={selectedPayoutID} page={wPage} limit={wLimit} />
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

      <Suspense fallback={skeleton("h-[320px]")}>
        <AutoPayoutsWrapper />
      </Suspense>

      <Suspense fallback={skeleton("h-[360px]")}>
        <PayoutRulesWrapper />
      </Suspense>
    </div>
  );
};

export default Page;

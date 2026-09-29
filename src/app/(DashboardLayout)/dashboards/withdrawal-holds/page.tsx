import { Suspense } from "react";
import { getWithdrawalHolds } from "@/app/api/wallet";
import WithdrawalHoldsTable from "./WithdrawalHoldsTable";

type HoldStatus = "active" | "released" | "all";

const HoldsWrapper = async ({ status, page, limit }: { status: HoldStatus; page: number; limit: number }) => {
  const res = await getWithdrawalHolds(status, page, limit);
  return (
    <WithdrawalHoldsTable
      holds={res?.data || null}
      status={status}
      totalPages={res?.data?.last_page || 1}
      currentPage={page}
      pageSize={limit}
    />
  );
};

const Page = async ({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) => {
  const raw = searchParams.status as string;
  const status: HoldStatus = raw === "released" || raw === "all" ? raw : "active";
  const page = Number(searchParams.page) || 1;
  const limit = Number(searchParams.limit) || 10;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h4 className="text-lg font-bold">Withdrawal holds</h4>
        <p className="text-sm text-darklink">
          Accounts whose purchase was refunded after they had already spent the coins. Their withdrawals stay
          blocked until you release the hold.
        </p>
      </div>
      <Suspense
        key={`${status}-${page}-${limit}`}
        fallback={<div className="h-[420px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}
      >
        <HoldsWrapper status={status} page={page} limit={limit} />
      </Suspense>
    </div>
  );
};

export default Page;

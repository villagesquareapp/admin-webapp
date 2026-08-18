import { Suspense } from "react";
import CowryOverallBalance from "./CowryOverallBalance";
import RecentCowryTransfer from "./RecentCowryTransfer";
import PaystackOverallBalance from "./PaystackOverallBalance";
import { getRecentTransfers } from "@/app/api/wallet";

const WalletTransfersWrapper = async ({
  page,
  limit
}: {
  page: number;
  limit: number;
}) => {
  const recentTransfer = await getRecentTransfers(page, limit);
  return (
    <RecentCowryTransfer
      recentTransferData={recentTransfer?.data || null}
      totalPages={recentTransfer?.data?.last_page || 1}
      currentPage={page}
      pageSize={limit}
    />
  );
};

const Page = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
  const page = Number(searchParams.page) || 1;
  const limit = Number(searchParams.limit) || 10;

  return (
    <>
      <div className="grid grid-cols-12 gap-30">
        <div className="col-span-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Suspense fallback={<div className="h-[300px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}>
              <PaystackOverallBalance />
            </Suspense>
            <Suspense fallback={<div className="h-[300px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}>
              <CowryOverallBalance />
            </Suspense>
          </div>
        </div>
        <div className="col-span-12">
          <Suspense key={`${page}-${limit}`} fallback={<div className="h-[500px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}>
            <WalletTransfersWrapper page={page} limit={limit} />
          </Suspense>
        </div>
      </div>
    </>
  );
};

export default Page;

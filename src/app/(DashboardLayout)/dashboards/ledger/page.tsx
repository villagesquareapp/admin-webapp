import { Suspense } from "react";
import { getLedgerAccounts, getLedgerOverview, getLedgerTransactions } from "@/app/api/ledger";
import LedgerOverview from "./LedgerOverview";
import TransactionsTable from "./TransactionsTable";
import AccountsTable from "./AccountsTable";

type Params = { [key: string]: string | string[] | undefined };
const str = (v: string | string[] | undefined) => (typeof v === "string" && v ? v : undefined);

const Overview = async () => {
  const res = await getLedgerOverview();
  return <LedgerOverview overview={res?.data ?? null} />;
};

const List = async ({ params }: { params: Params }) => {
  const page = Number(params.page) || 1;
  const per_page = Number(params.limit) || 20;
  if (params.tab === "accounts") {
    const res = await getLedgerAccounts({
      page,
      per_page,
      search: str(params.search),
      owner_type: str(params.owner_type),
      currency_type: str(params.currency_type),
      status: str(params.status),
    });
    return <AccountsTable page={res?.data ?? null} />;
  }
  const res = await getLedgerTransactions({
    page,
    per_page,
    search: str(params.search),
    category: str(params.category),
    status: str(params.status),
    account_id: str(params.account_id),
  });
  return <TransactionsTable page={res?.data ?? null} />;
};

const Page = async (props: { searchParams: Promise<Params> }) => {
  const params = await props.searchParams;
  return (
    <div className="flex flex-col gap-5">
      <Suspense fallback={<div className="h-[340px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}>
        <Overview />
      </Suspense>
      <Suspense key={JSON.stringify(params)} fallback={<div className="h-[420px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}>
        <List params={params} />
      </Suspense>
    </div>
  );
};

export default Page;

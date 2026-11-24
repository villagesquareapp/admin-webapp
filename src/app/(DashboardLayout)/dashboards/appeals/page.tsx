import { Suspense } from "react";
import Link from "next/link";
import { getAppeals, type AppealFilter } from "@/app/api/appeals";
import AppealsQueue from "./AppealsQueue";

type Params = { [key: string]: string | string[] | undefined };
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;

const Queue = async ({ status, page }: { status: AppealFilter; page: number }) => {
  const res = await getAppeals(status, page);
  if (!res?.status || !res.data) {
    return <div className="py-16 text-center text-darklink">The appeals couldn&apos;t be loaded. Try again in a moment.</div>;
  }
  return <AppealsQueue page={res.data} status={status} />;
};

const Page = async (props: { searchParams: Promise<Params> }) => {
  const sp = await props.searchParams;
  const status: AppealFilter = (["decided", "all"] as const).find((s) => s === one(sp.status)) ?? "pending";
  const page = Number(one(sp.page)) || 1;

  const tabClass = (active: boolean) =>
    `px-4 py-2 text-sm font-semibold border-b-2 -mb-px ${active ? "border-primary text-primary" : "border-transparent text-darklink hover:text-dark dark:hover:text-white"}`;

  return (
    <div className="flex flex-col gap-30">
      <div>
        <h4 className="text-lg font-bold">Appeals</h4>
        <p className="text-sm text-darklink">
          Suspended and banned people asking for another look. Overturning lifts the suspension; both outcomes are emailed
          to them.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex border-b border-ld">
          <Link href="?status=pending" className={tabClass(status === "pending")}>
            Waiting
          </Link>
          <Link href="?status=decided" className={tabClass(status === "decided")}>
            Decided
          </Link>
          <Link href="?status=all" className={tabClass(status === "all")}>
            All
          </Link>
        </div>
        <Suspense
          key={`${status}-${page}`}
          fallback={<div className="h-[420px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}
        >
          <Queue status={status} page={page} />
        </Suspense>
      </div>
    </div>
  );
};

export default Page;

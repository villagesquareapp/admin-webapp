import { Suspense } from "react";
import Link from "next/link";
import { getVerificationRequests, getVerificationStats, getVerifiedAccounts } from "@/app/api/verification";
import KpiCard from "@/app/components/shared/KpiCard";
import RequestsTable from "./RequestsTable";
import VerifiedAccountsTable from "./VerifiedAccountsTable";
import GrantButton from "./GrantButton";

type Params = { [key: string]: string | string[] | undefined };
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;

const Stats = async () => {
  const s = (await getVerificationStats())?.data;
  const cards = [
    { label: "Waiting for review", value: s?.pending_requests, icon: "solar:document-text-linear", tone: "bg-lightwarning text-warning", href: "?tab=requests" },
    { label: "Approved (30 days)", value: s?.approved_30d, icon: "solar:check-circle-linear", tone: "bg-lightsuccess text-success", href: "?tab=requests&status=approved" },
    { label: "Paying subscribers", value: s?.paid_active, icon: "solar:card-linear", tone: "bg-lightprimary text-primary", href: "?tab=verified&state=active&source=paid" },
    { label: "Granted by staff", value: s?.granted_active, icon: "solar:star-linear", tone: "bg-lightinfo text-info", href: "?tab=verified&state=active&source=granted" },
    { label: "Ending within 7 days", value: s?.expiring_7d, icon: "solar:alarm-linear", tone: "bg-lighterror text-error", href: "?tab=verified&state=expiring" },
    { label: "Green check / Premium badges", value: (s?.badges?.greencheck ?? 0) + (s?.badges?.premium ?? 0), icon: "solar:verified-check-linear", tone: "bg-lightsuccess text-success", href: "?tab=verified&state=active", extra: s ? `${s.badges.greencheck.toLocaleString()} / ${s.badges.premium.toLocaleString()}` : null },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
      {cards.map((c) => (
        <Link key={c.label} href={c.href} className="block">
          <KpiCard icon={c.icon} value={c.value ?? 0} label={c.label} tone={c.tone} extra={c.extra} />
        </Link>
      ))}
    </div>
  );
};

const Requests = async ({ status, search, page, limit }: { status: string; search?: string; page: number; limit: number }) => {
  const res = await getVerificationRequests({ status, search, page, limit });
  return (
    <RequestsTable requests={res?.data ?? null} status={status} totalPages={res?.data?.last_page || 1} currentPage={page} pageSize={limit} />
  );
};

const Accounts = async ({ filters, page, limit }: { filters: { state?: string; source?: string; badge?: string; search?: string }; page: number; limit: number }) => {
  const res = await getVerifiedAccounts({ ...filters, page, limit });
  return (
    <VerifiedAccountsTable accounts={res?.data ?? null} filters={filters} totalPages={res?.data?.last_page || 1} currentPage={page} pageSize={limit} />
  );
};

const Page = async (props: { searchParams: Promise<Params> }) => {
  const sp = await props.searchParams;
  const tab = one(sp.tab) === "verified" ? "verified" : "requests";
  const page = Number(one(sp.page)) || 1;
  const limit = Number(one(sp.limit)) || 20;
  const search = one(sp.search);
  const status = ["approved", "rejected"].includes(one(sp.status) ?? "") ? one(sp.status)! : "pending";
  const filters = { state: one(sp.state), source: one(sp.source), badge: one(sp.badge), search };

  const tabClass = (active: boolean) =>
    `px-4 py-2 text-sm font-semibold border-b-2 -mb-px ${active ? "border-primary text-primary" : "border-transparent text-darklink hover:text-dark dark:hover:text-white"}`;

  return (
    <div className="flex flex-col gap-30">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h4 className="text-lg font-bold">Verification</h4>
          <p className="text-sm text-darklink">
            Review badge requests, see who is verified and until when, and verify people yourself (ambassadors, partners) for a set time.
          </p>
        </div>
        <GrantButton />
      </div>

      <Suspense fallback={<div className="h-[88px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-xl" />}>
        <Stats />
      </Suspense>

      <div className="flex flex-col gap-4">
        <div className="flex border-b border-ld">
          <Link href="?tab=requests" className={tabClass(tab === "requests")}>
            Requests
          </Link>
          <Link href="?tab=verified" className={tabClass(tab === "verified")}>
            Verified accounts
          </Link>
        </div>
        <Suspense
          key={JSON.stringify({ tab, page, limit, status, filters })}
          fallback={<div className="h-[420px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}
        >
          {tab === "requests" ? (
            <Requests status={status} search={search} page={page} limit={limit} />
          ) : (
            <Accounts filters={filters} page={page} limit={limit} />
          )}
        </Suspense>
      </div>
    </div>
  );
};

export default Page;

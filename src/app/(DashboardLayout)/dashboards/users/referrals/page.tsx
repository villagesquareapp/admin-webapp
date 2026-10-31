import { getReferrals, getReferralStats } from "@/app/api/referrals";
import ReferralsView from "./ReferralsView";

const str = (v: string | string[] | undefined) => (typeof v === "string" && v ? v : undefined);

const Page = async (props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) => {
  const params = await props.searchParams;
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 20;
  const [stats, list] = await Promise.all([
    getReferralStats(),
    getReferrals({ page, limit, search: str(params.search), stage: str(params.stage) }),
  ]);
  return <ReferralsView stats={stats?.data ?? null} page={list?.data ?? null} currentPage={page} pageSize={limit} />;
};

export default Page;

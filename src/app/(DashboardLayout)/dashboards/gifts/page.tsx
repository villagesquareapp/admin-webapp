import { Suspense } from "react";
import { getGifts, getGiftingOverview } from "@/app/api/gift";
import GiftCard from "./GiftCard";
import { getToken } from "@/lib/getToken";

const GiftsWrapper = async () => {
  // Prefer the analytics overview; fall back to the plain catalog if it isn't deployed yet.
  const overviewRes = await getGiftingOverview();
  let overview = overviewRes?.data || null;

  if (!overview) {
    const catalog = await getGifts();
    const gifts = Array.isArray(catalog?.data) ? catalog.data : [];
    const active = gifts.filter((g) => g.status).length;
    overview = {
      totals: { total_gifts: gifts.length, active_gifts: active, disabled_gifts: gifts.length - active, total_sent: 0, total_value_sent: 0 },
      gifts: gifts.map((g) => ({
        uuid: g.uuid, name: g.name, icon: g.icon, value: g.value, status: g.status,
        created_at: g.created_at, updated_at: g.updated_at, sent_count: 0, value_sent: 0, share: 0,
      })),
      top_gifts: [],
      trend: [],
    };
  }

  return <GiftCard overview={overview} />;
};

// The Admin API token stays on the server: the client components call
// server actions, the gift upload included (VS-ADM-009).
const Page = async () => {
  if (!(await getToken())) throw new Error("No token found");

  return (
    <Suspense fallback={<div className="h-[600px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}>
      <GiftsWrapper />
    </Suspense>
  );
};

export default Page;

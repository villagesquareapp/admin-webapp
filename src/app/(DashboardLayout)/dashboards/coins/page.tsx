import { Suspense } from "react";
import CoinCard from "./CoinCard";
import { getToken } from "@/lib/getToken";
import { getCoins, getCoinOverview } from "@/app/api/coin";

const CoinsWrapper = async ({ token }: { token: string }) => {
  // Prefer the analytics overview; fall back to the plain catalog if it isn't deployed yet.
  const overviewRes = await getCoinOverview();
  let overview = overviewRes?.data || null;

  if (!overview) {
    const catalog = await getCoins();
    const packages = Array.isArray(catalog?.data) ? catalog.data : [];
    const active = packages.filter((c) => c.status).length;
    const prices = packages.map((c) => Number(c.price)).filter((n) => n > 0);
    overview = {
      totals: {
        total_packages: packages.length, active_packages: active, disabled_packages: packages.length - active,
        total_purchases: 0, total_revenue: 0,
        min_price: prices.length ? Math.min(...prices) : 0, max_price: prices.length ? Math.max(...prices) : 0,
      },
      packages: packages.map((c) => ({
        ...c, purchases: 0, revenue: 0,
        coins_per_usd: Number(c.price) > 0 ? Math.round(Number(c.amount) / Number(c.price)) : 0,
      })),
    };
  }

  return <CoinCard overview={overview} token={token} />;
};

const Page = async () => {
  const token = await getToken();
  if (!token) throw new Error("No token found");

  return (
    <Suspense fallback={<div className="h-[600px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}>
      <CoinsWrapper token={token} />
    </Suspense>
  );
};

export default Page;

import { Suspense } from "react";
import { getFlutterwaveBalance, getCowryBalance, getPayoutQueue } from "@/app/api/wallet";
import { getCoins } from "@/app/api/coin";
import { getGifts } from "@/app/api/gift";
import { getBillingPlans, getBillingOverview } from "@/app/api/billing";
import { getVerifiedUserStats } from "@/app/api/user";
import { getVflixMonetization } from "@/app/api/vflix-insights";
import MonetizationOverview, { MonetizationData } from "./MonetizationOverview";

const num = (v: unknown) => Number(v) || 0;
const arr = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);

const OverviewWrapper = async () => {
  const [flutterwave, cowry, coinsRes, giftsRes, payoutQueue, plansRes, verified, vflixMon, billing] = await Promise.all([
    getFlutterwaveBalance(),
    getCowryBalance(),
    getCoins(),
    getGifts(),
    getPayoutQueue(1, 1),
    getBillingPlans(),
    getVerifiedUserStats(),
    getVflixMonetization(),
    getBillingOverview(),
  ]);

  const coins = arr<ICoins>(coinsRes?.data);
  const gifts = arr<IGifting>(giftsRes?.data);
  const plans = arr<IBillingPlan>(plansRes?.data);
  const vs = verified?.data as any;
  const vm = vflixMon?.data as any;

  const data: MonetizationData = {
    treasury: {
      flutterwave_ngn: flutterwave?.data?.available_balance?.ngn || "—",
      flutterwave_usd: flutterwave?.data?.available_balance?.usd || "—",
      cowry: cowry?.data?.cowry_value?.balance || "—",
      cowry_ngn: cowry?.data?.ngn_value?.balance || "—",
    },
    kpis: {
      subscribers_total: num(vs?.total_active_subscribers),
      greencheck: num(vs?.greencheck_active_subscribers),
      premium: num(vs?.premium_active_subscribers),
      payouts_waiting: num(payoutQueue?.data?.total),
      coin_packages: coins.length,
      coins_active: coins.filter((c) => c.status).length,
      gifts_total: gifts.length,
      gifts_active: gifts.filter((g) => g.status).length,
      billing_plans: plans.length,
      vflix_gifts: num(vm?.kpis?.total_gifts),
      vflix_coin_value: num(vm?.kpis?.coin_value),
      vflix_paid_out: num(vm?.kpis?.paid_out),
    },
    revenue: (billing?.data as IBillingOverview) || null,
    coins,
    gifts,
  };

  return <MonetizationOverview data={data} />;
};

const Page = async () => {
  return (
    <Suspense fallback={<div className="h-[600px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}>
      <OverviewWrapper />
    </Suspense>
  );
};

export default Page;

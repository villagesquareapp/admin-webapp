import { Suspense } from "react";
import CoinCard from "./CoinCard";
import { getToken } from "@/lib/getToken";
import { getCoins } from "@/app/api/coin";

const CoinsWrapper = async ({ token }: { token: string }) => {
  const coins = await getCoins();
  return (
    <CoinCard
      coinsData={Array.isArray(coins?.data) ? coins.data : []}
      token={token}
    />
  );
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

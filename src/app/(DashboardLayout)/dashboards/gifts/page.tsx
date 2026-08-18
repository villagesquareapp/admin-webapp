import { Suspense } from "react";
import { getGifts } from "@/app/api/gift";
import GiftCard from "./GiftCard";
import { getToken } from "@/lib/getToken";

const GiftsWrapper = async ({ token }: { token: string }) => {
  const gifts = await getGifts();
  return (
    <GiftCard
      giftsData={Array.isArray(gifts?.data) ? gifts.data : []}
      token={token}
    />
  );
};

const Page = async () => {
  const token = await getToken();

  if (!token) throw new Error("No token found");

  return (
    <Suspense fallback={<div className="h-[600px] w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-3xl" />}>
      <GiftsWrapper token={token} />
    </Suspense>
  );
};

export default Page;

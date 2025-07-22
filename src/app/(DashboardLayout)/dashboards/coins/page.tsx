import CoinCard from "./CoinCard";
import { getToken } from "@/lib/getToken";
import { getCoins } from "@/app/api/coin";

const Page = async () => {
  const coins = await getCoins();
  const token = await getToken();

  if (!token) throw new Error("No token found");
  // console.log("Gift Result:", gifts)

  return (
    <>
      <CoinCard
        coinsData={Array.isArray(coins?.data) ? coins.data : []}
        token={token}
      />
    </>
  );
};

export default Page;

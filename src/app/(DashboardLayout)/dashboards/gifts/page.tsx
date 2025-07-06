import { getGifts } from "@/app/api/gift";
import GiftCard from "./GiftCard";
import { getToken } from "@/lib/getToken";


const Page = async () => {
  const gifts = await getGifts();
    const token = await getToken();

      if (!token) throw new Error("No token found");
  console.log("Gift Result:", gifts);

  return (
    <>
      <GiftCard giftsData={Array.isArray(gifts?.data) ? gifts.data : []} token={token} />
    </>
  );
};

export default Page;

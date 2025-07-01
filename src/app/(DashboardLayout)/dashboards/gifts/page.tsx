import { getGifts } from "@/app/api/gift";
import GiftCard from "./GiftCard";


const Page = async () => {
  const gifts = await getGifts();
  // console.log("Gift Result:", gifts);

  return (
    <>
      <GiftCard giftsData={Array.isArray(gifts?.data) ? gifts.data : []} />
    </>
  );
};

export default Page;
